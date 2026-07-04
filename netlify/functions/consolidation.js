// Shared storage for the Consolidation Studio figures. GET returns the saved
// dataset for a period; POST saves it. Stored as one JSON file per period in a
// _consolidation folder, so the whole team prepares from the same numbers.
const { getToken, ensurePath, getFileByName, readFileText, saveJsonFile } = require('./_drive')

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
})

const nameFor = (pt, p) => `${pt || 'monthly'}_${p || 'draft'}`.replace(/[^a-z0-9_]+/gi, '-') + '.json'

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user
  if (!user) return json(401, { error: 'unauthorized' })
  const root = process.env.GDRIVE_ROOT_FOLDER_ID
  if (!process.env.GDRIVE_SA_KEY || !root) return json(200, { configured: false })

  try {
    const token = await getToken()
    const folderId = await ensurePath(['_consolidation'], root, token)

    if (event.httpMethod === 'GET') {
      const p = event.queryStringParameters || {}
      const f = await getFileByName(nameFor(p.periodType, p.period), folderId, token)
      if (!f) return json(200, { configured: true, data: null })
      return json(200, { configured: true, data: JSON.parse(await readFileText(f.id, token)) })
    }
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      await saveJsonFile(nameFor(body.periodType, body.period), folderId, body.data || {}, token)
      return json(200, { configured: true, ok: true, savedBy: user.email })
    }
    return json(405, { error: 'method_not_allowed' })
  } catch (e) {
    return json(500, { error: String(e.message || e) })
  }
}
