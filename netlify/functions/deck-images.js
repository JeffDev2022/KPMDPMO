// Extracts the photos embedded in an offtaker's uploaded report (a .pptx is a
// zip). Given a Drive fileId, it downloads the deck, pulls the images from
// ppt/media, and returns them as data URLs so the Consolidation Studio can pull
// the offtaker's own field photos into the generated highlight slides.
const { getToken, downloadFileBuffer } = require('./_drive')
const { unzipSync } = require('fflate')

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})

const MAX_IMAGES = 16
const MAX_EACH = 1_600_000     // skip images larger than ~1.6MB
const MAX_TOTAL = 5_200_000    // stay within the function response budget

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user
  if (!user) return json(401, { error: 'unauthorized' })
  if (!process.env.GDRIVE_SA_KEY || !process.env.GDRIVE_ROOT_FOLDER_ID) return json(200, { configured: false, images: [] })

  const fileId = (event.queryStringParameters || {}).fileId
  if (!fileId) return json(400, { error: 'missing_fileId' })

  try {
    const token = await getToken()
    const buf = await downloadFileBuffer(fileId, token)
    const entries = unzipSync(new Uint8Array(buf))
    const images = []
    let total = 0
    for (const [path, bytes] of Object.entries(entries)) {
      if (!/^ppt\/media\/.*\.(png|jpe?g)$/i.test(path)) continue
      if (bytes.length > MAX_EACH) continue
      if (total + bytes.length > MAX_TOTAL) break
      total += bytes.length
      const mime = /\.png$/i.test(path) ? 'image/png' : 'image/jpeg'
      images.push({
        name: path.split('/').pop(),
        dataUrl: `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`
      })
      if (images.length >= MAX_IMAGES) break
    }
    return json(200, { configured: true, images })
  } catch (e) {
    return json(500, { error: String(e.message || e), images: [] })
  }
}
