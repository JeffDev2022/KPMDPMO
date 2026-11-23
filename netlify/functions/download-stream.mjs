// Step 2 of the download: a v2 streaming function. It verifies the signed ticket
// minted by download-ticket.js (so it needs no Identity context of its own),
// then streams the file straight from Google Drive to the browser using the
// service account. Streaming lifts the response cap from 6MB to 20MB.
//
// Standalone by design: it imports nothing from the CommonJS _drive.js, because
// ESM->CJS named imports are not guaranteed to bundle. The small amount of
// service-account auth is inlined here instead.
import crypto from 'node:crypto'

const DRIVE = 'https://www.googleapis.com/drive/v3'
const ALL = 'supportsAllDrives=true&includeItemsFromAllDrives=true'

function readServiceAccount() {
  const raw = process.env.GDRIVE_SA_KEY
  if (!raw) throw new Error('missing_GDRIVE_SA_KEY')
  let text = Buffer.from(raw, 'base64').toString('utf8')
  if (!text.trim().startsWith('{')) text = raw
  const json = JSON.parse(text)
  let key = json.private_key || ''
  if (key.includes('\\n')) key = key.replace(/\\n/g, '\n')
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
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${signingInput}.${signature}` })
  })
  if (!res.ok) throw new Error(`token_${res.status}`)
  const data = await res.json()
  cachedToken = data.access_token
  cachedExp = now + (data.expires_in || 3600)
  return cachedToken
}

function ticketValid(fileId, ticket) {
  const [expStr, sig] = String(ticket || '').split('.')
  const exp = Number(expStr)
  if (!exp || !sig) return false
  if (Date.now() > exp) return false
  const expected = crypto.createHmac('sha256', process.env.GDRIVE_SA_KEY || '')
    .update(`${fileId}.${exp}`).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export default async (req) => {
  const url = new URL(req.url)
  const fileId = url.searchParams.get('fileId')
  const ticket = url.searchParams.get('ticket')
  if (!fileId || !ticket) return new Response('bad_request', { status: 400 })
  if (!process.env.GDRIVE_SA_KEY || !process.env.GDRIVE_ROOT_FOLDER_ID) {
    return new Response('not_configured', { status: 503 })
  }
  if (!ticketValid(fileId, ticket)) return new Response('forbidden', { status: 403 })

  let token
  try { token = await getToken() } catch (e) { return new Response('auth_failed', { status: 502 }) }

  const driveRes = await fetch(`${DRIVE}/files/${encodeURIComponent(fileId)}?alt=media&${ALL}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!driveRes.ok || !driveRes.body) {
    return new Response('download_failed', { status: 502 })
  }

  // Filename/type are cosmetic (they set the saved name); tampering only renames
  // the download, so they ride as plain query params rather than in the ticket.
  const name = url.searchParams.get('name') || 'report'
  const type = url.searchParams.get('type') || driveRes.headers.get('content-type') || 'application/octet-stream'
  const asciiName = name.replace(/["\\\r\n]/g, '_').replace(/[^\x20-\x7e]/g, '_')
  const encodedName = encodeURIComponent(name)

  const headers = {
    'Content-Type': type,
    'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
    'Cache-Control': 'no-store'
  }
  const len = driveRes.headers.get('content-length')
  if (len) headers['Content-Length'] = len

  return new Response(driveRes.body, { status: 200, headers })
}
