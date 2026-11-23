// Streams a stored report file back to the signed-in user, fetched with the
// service account. The report files live in a Shared Drive owned by the service
// account, so a dashboard user has no Google Drive permission on them and the
// raw Drive webViewLink shows "request access". This proxy removes that: anyone
// signed in to the dashboard (verified by the Netlify Identity gate below) can
// download, with no Google account or Drive sharing required.
//
// Size note: a Netlify (v1) synchronous function response is capped at 6MB, and
// base64 inflates bytes by ~4/3, so the real-byte ceiling is ~4.4MB. Uploads
// bypass this cap (resumable upload straight to Drive), so a stored deck can be
// larger. For those we return 413 { error: 'too_large', link } and the front end
// falls back to the Drive link, which still works for anyone with Drive access.
const { getToken, getFileMeta, downloadFileBuffer } = require('./_drive')

// Keep a safety margin under the 6MB response limit after base64 inflation.
const MAX_PROXY_BYTES = 4_300_000

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
})

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

    if (size !== null && size > MAX_PROXY_BYTES) {
      return json(413, { error: 'too_large', name: meta.name, size, link: meta.webViewLink })
    }

    const buf = await downloadFileBuffer(fileId, token)

    // Guard against files whose metadata reported no size but turn out oversized.
    if (buf.length > MAX_PROXY_BYTES) {
      return json(413, { error: 'too_large', name: meta.name, size: buf.length, link: meta.webViewLink })
    }

    // RFC 5987 filename*, with a plain ASCII fallback, so names with spaces or
    // non-ASCII characters download correctly.
    const name = meta.name || 'report'
    const asciiName = name.replace(/["\\\r\n]/g, '_').replace(/[^\x20-\x7e]/g, '_')
    const encodedName = encodeURIComponent(name)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': meta.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
        'Cache-Control': 'no-store'
      },
      body: buf.toString('base64'),
      isBase64Encoded: true
    }
  } catch (e) {
    return json(500, { error: String(e.message || e) })
  }
}
