// ---------------------------------------------------------------------------
// Shared Google Drive helper for the KPMD Reporting Hub functions.
//
// Auth: a Google service account. Store its key JSON, base64 encoded, in the
// Netlify environment variable GDRIVE_SA_KEY (base64 avoids private-key newline
// issues). The reports live under the folder whose ID is in GDRIVE_ROOT_FOLDER_ID.
//
// IMPORTANT: the root folder must live in a Google Shared Drive (not the service
// account's My Drive). Service accounts have no personal Drive storage quota, so
// uploads into My Drive fail. A Shared Drive owns the storage. All calls below
// set supportsAllDrives=true accordingly. See REPORTING_SETUP.md.
// ---------------------------------------------------------------------------
// Auth uses a hand-rolled service-account JWT signed with Node's built-in
// crypto, then exchanged for an access token. This avoids bundling
// google-auth-library, which does not package reliably in Netlify Functions.
const crypto = require('crypto')

function readServiceAccount() {
  const raw = process.env.GDRIVE_SA_KEY
  if (!raw) throw new Error('missing_GDRIVE_SA_KEY')
  // Expect base64 of the key JSON, but tolerate raw JSON being pasted directly.
  let text = Buffer.from(raw, 'base64').toString('utf8')
  if (!text.trim().startsWith('{')) text = raw
  const json = JSON.parse(text)
  let key = json.private_key || ''
  if (key.includes('\\n')) key = key.replace(/\\n/g, '\n')   // undo double-escaping
  return { client_email: json.client_email, private_key: key }
}

const b64url = (input) => Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

let cachedToken = null
let cachedExp = 0
async function getToken() {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && now < cachedExp - 60) return cachedToken
  const sa = readServiceAccount()
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  }))
  const signingInput = `${header}.${claims}`
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(sa.private_key)
    .toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const assertion = `${signingInput}.${signature}`
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
  })
  if (!res.ok) throw new Error(`token_${res.status}:${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  cachedToken = data.access_token
  cachedExp = now + (data.expires_in || 3600)
  return cachedToken
}

const DRIVE = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'
const ALL = 'supportsAllDrives=true&includeItemsFromAllDrives=true'

async function driveGet(path, token) {
  const res = await fetch(`${DRIVE}${path}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`drive_get_${res.status}:${await res.text()}`)
  return res.json()
}

// Find a child folder by name under parentId, or create it. Returns folder id.
async function findOrCreateFolder(name, parentId, token) {
  const safe = name.replace(/'/g, "\\'")
  const q = encodeURIComponent(
    `name='${safe}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
  )
  const found = await driveGet(`/files?q=${q}&fields=files(id,name)&${ALL}`, token)
  if (found.files && found.files.length) return found.files[0].id

  const res = await fetch(`${DRIVE}/files?${ALL}&fields=id`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] })
  })
  if (!res.ok) throw new Error(`folder_create_${res.status}:${await res.text()}`)
  return (await res.json()).id
}

// Ensure a nested path [a, b, c] exists under rootId. Returns the leaf folder id.
async function ensurePath(segments, rootId, token) {
  let parent = rootId
  for (const seg of segments) {
    parent = await findOrCreateFolder(seg, parent, token)
  }
  return parent
}

// List every KPMD report file (tagged with appProperties.kpmd = '1').
async function listReports(token) {
  const q = encodeURIComponent(`appProperties has { key='kpmd' and value='1' } and trashed=false`)
  const fields = 'files(id,name,mimeType,size,createdTime,webViewLink,appProperties),nextPageToken'
  let out = []
  let pageToken = ''
  do {
    const pt = pageToken ? `&pageToken=${pageToken}` : ''
    const data = await driveGet(`/files?q=${q}&fields=${encodeURIComponent(fields)}&pageSize=200&${ALL}${pt}`, token)
    out = out.concat(data.files || [])
    pageToken = data.nextPageToken || ''
  } while (pageToken)
  return out
}

// Start a resumable upload session in folderId. Returns the session URI that the
// browser PUTs the file bytes to (bypasses the 6MB function payload limit).
// Origin is set so Google enables CORS for the browser upload.
async function createResumableSession({ name, mimeType, folderId, appProperties, origin }, token) {
  const metadata = { name, parents: [folderId], appProperties }
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json; charset=UTF-8',
    'X-Upload-Content-Type': mimeType || 'application/octet-stream'
  }
  if (origin) headers.Origin = origin
  const res = await fetch(`${UPLOAD}/files?uploadType=resumable&${ALL}&fields=id,webViewLink`, {
    method: 'POST',
    headers,
    body: JSON.stringify(metadata)
  })
  if (!res.ok) throw new Error(`session_${res.status}:${await res.text()}`)
  const sessionUri = res.headers.get('location')
  if (!sessionUri) throw new Error('no_session_uri')
  return sessionUri
}

// Find a non-folder file by name under a parent. Returns {id,name,mimeType} or null.
async function getFileByName(name, parentId, token) {
  const safe = name.replace(/'/g, "\\'")
  const q = encodeURIComponent(`name='${safe}' and '${parentId}' in parents and trashed=false`)
  const data = await driveGet(`/files?q=${q}&fields=files(id,name,mimeType)&${ALL}`, token)
  return (data.files && data.files[0]) || null
}

async function readFileText(fileId, token) {
  const res = await fetch(`${DRIVE}/files/${fileId}?alt=media&${ALL}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`read_${res.status}`)
  return res.text()
}

async function downloadFileBuffer(fileId, token) {
  const res = await fetch(`${DRIVE}/files/${fileId}?alt=media&${ALL}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`download_${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// Metadata for a single file (name, type, size, link). Used by the download
// proxy to set the right filename/Content-Type and to size-check before it
// buffers the bytes into a function response.
async function getFileMeta(fileId, token) {
  return driveGet(`/files/${fileId}?fields=id,name,mimeType,size,webViewLink&${ALL}`, token)
}

// Create or overwrite a JSON file by name in a folder. Returns the file id.
async function saveJsonFile(name, parentId, obj, token) {
  const body = JSON.stringify(obj)
  const existing = await getFileByName(name, parentId, token)
  if (existing) {
    const res = await fetch(`${UPLOAD}/files/${existing.id}?uploadType=media&${ALL}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body
    })
    if (!res.ok) throw new Error(`save_patch_${res.status}:${await res.text()}`)
    return existing.id
  }
  const boundary = 'kpmd' + Date.now()
  const metadata = { name, parents: [parentId], mimeType: 'application/json' }
  const multipart =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`
  const res = await fetch(`${UPLOAD}/files?uploadType=multipart&${ALL}&fields=id`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: multipart
  })
  if (!res.ok) throw new Error(`save_create_${res.status}:${await res.text()}`)
  return (await res.json()).id
}

module.exports = { getToken, ensurePath, listReports, createResumableSession, getFileByName, readFileText, downloadFileBuffer, getFileMeta, saveJsonFile }
