// Step 1 of a two-part download. This v1 function keeps the proven Netlify
// Identity gate (context.clientContext.user is populated by Netlify when a valid
// Identity bearer token is present). It authenticates the user, then issues a
// short-lived signed ticket that the streaming function (download-stream.mjs)
// verifies. The ticket is an HMAC over fileId+expiry, signed with the existing
// service-account key, so no new environment variable is required.
//
// Why two functions: the raw Drive webViewLink shows "request access" to anyone
// not on the service-account's Shared Drive. Proxying the bytes fixes that, but
// a classic (v1) function response is capped at 6MB. A streaming (v2) function
// lifts that to 20MB — but v2's access to the Identity user is not guaranteed,
// so we verify identity here (v1) and authorise the stream with the ticket.
const crypto = require('crypto')
const { getToken, getFileMeta } = require('./_drive')

// Netlify streaming responses are capped at 20MB; stay safely under it.
const STREAM_MAX_BYTES = 19_000_000
const TICKET_TTL_MS = 60_000

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
})

function signTicket(fileId, exp) {
  return crypto.createHmac('sha256', process.env.GDRIVE_SA_KEY)
    .update(`${fileId}.${exp}`).digest('base64url')
}

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user
  if (!user) return json(401, { error: 'unauthorized' })
  if (!process.env.GDRIVE_SA_KEY || !process.env.GDRIVE_ROOT_FOLDER_ID) {
    return json(503, { error: 'not_configured' })
  }

  const fileId = (event.queryStringParameters || {}).fileId
  if (!fileId) return json(400, { error: 'missing_fileId' })

  try {
    const token = await getToken()
    const meta = await getFileMeta(fileId, token)
    const size = meta.size ? Number(meta.size) : null

    // Files larger than the streaming limit cannot be proxied; hand back the
    // Drive link so the client can fall back (works for Drive-shared users).
    if (size !== null && size > STREAM_MAX_BYTES) {
      return json(200, { tooLarge: true, size, link: meta.webViewLink })
    }

    const exp = Date.now() + TICKET_TTL_MS
    const sig = signTicket(fileId, exp)
    const params = new URLSearchParams({
      fileId,
      ticket: `${exp}.${sig}`,
      name: meta.name || 'report',
      type: meta.mimeType || 'application/octet-stream'
    })
    return json(200, { url: `/.netlify/functions/download-stream?${params.toString()}` })
  } catch (e) {
    return json(500, { error: String(e.message || e) })
  }
}
