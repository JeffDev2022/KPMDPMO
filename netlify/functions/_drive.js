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
const { JWT } = require('google-auth-library')

const SCOPES = ['https://www.googleapis.com/auth/drive']

function readServiceAccount() {
  const b64 = process.env.GDRIVE_SA_KEY
  if (!b64) throw new Error('missing_GDRIVE_SA_KEY')
  const json = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
  return { client_email: json.client_email, private_key: json.private_key }
}

async function getToken() {
  const sa = readServiceAccount()
  const client = new JWT({ email: sa.client_email, key: sa.private_key, scopes: SCOPES })
  const { token } = await client.getAccessToken()
  if (!token) throw new Error('token_failed')
  return token
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

module.exports = { getToken, ensurePath, listReports, createResumableSession }
