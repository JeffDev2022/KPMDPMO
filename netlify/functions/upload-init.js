// Prepares an upload. Given the report metadata, it ensures the Drive folder
// path exists (ReportType / Period / Offtaker) and returns a resumable upload
// session URI. The browser then PUTs the file bytes straight to that URI, so
// large decks with photos never pass through the 6MB function payload limit.
const { getToken, ensurePath, createResumableSession } = require('./_drive')

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})

const TYPE_LABEL = { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly' }

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user
  if (!user) return json(401, { error: 'unauthorized' })
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' })
  const root = process.env.GDRIVE_ROOT_FOLDER_ID
  if (!process.env.GDRIVE_SA_KEY || !root) return json(503, { error: 'not_configured' })

  let body
  try { body = JSON.parse(event.body || '{}') } catch { return json(400, { error: 'bad_json' }) }

  const { fileName, mimeType, reportType, period, offtaker, track, uploadedBy } = body
  if (!fileName || !reportType || !period || !offtaker) {
    return json(400, { error: 'missing_fields', need: ['fileName', 'reportType', 'period', 'offtaker'] })
  }

  try {
    const token = await getToken()
    const typeFolder = TYPE_LABEL[reportType] || reportType
    const folderId = await ensurePath([typeFolder, period, offtaker], root, token)
    const origin = event.headers.origin || process.env.URL || ''
    const sessionUri = await createResumableSession({
      name: fileName,
      mimeType,
      folderId,
      appProperties: {
        kpmd: '1', reportType, period, offtaker,
        track: track || '', uploadedBy: user.email || uploadedBy || ''
      },
      origin
    }, token)
    return json(200, { sessionUri })
  } catch (e) {
    return json(500, { error: String(e.message || e) })
  }
}
