// Returns every stored KPMD report file, tagged with its report type, period,
// offtaker and track (read from Drive appProperties). The front end uses this
// for both the report library and to compute the submission tracker.
const { getToken, listReports } = require('./_drive')

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
})

exports.handler = async (event, context) => {
  try {
    const user = context.clientContext && context.clientContext.user
    if (!user) return json(401, { error: 'unauthorized' })
    if (!process.env.GDRIVE_SA_KEY || !process.env.GDRIVE_ROOT_FOLDER_ID) {
      return json(200, { configured: false, files: [] })
    }
    const token = await getToken()
    const files = await listReports(token)
    const mapped = files.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size ? Number(f.size) : null,
      createdTime: f.createdTime,
      link: f.webViewLink,
      reportType: f.appProperties?.reportType || null,
      period: f.appProperties?.period || null,
      offtaker: f.appProperties?.offtaker || null,
      scope: f.appProperties?.scope || 'offtaker',
      track: f.appProperties?.track || null
    }))
    return json(200, { configured: true, files: mapped })
  } catch (e) {
    // Never crash with a 502; return a readable error so the cause is visible.
    return json(500, { configured: true, error: String(e.message || e), files: [] })
  }
}
