// ---------------------------------------------------------------------------
// Consolidated report generator. Builds the KPMD consolidated deck (PowerPoint)
// and narrative (Word) from a structured model, on the SBS template: navy and
// gold, Arial, the KPMD / MTLDK track split. Pure build functions with no
// browser or Node specifics, so the same code runs in the app and in tests.
// The caller handles output (download in the browser, file write in a test).
// ---------------------------------------------------------------------------

const NAVY = '1F3864'
const NAVY_DK = '14213D'
const GOLD = 'A67C00'
const GOLD_LT = 'C9A227'
const INK = '1F2937'
const LIGHT = 'EDF1F7'
const MUTE = '64748B'

const fmt = (n) => (n === null || n === undefined || n === '') ? '-' : Number(n).toLocaleString('en-US')

// ---- PowerPoint ------------------------------------------------------------
export async function buildDeck(model) {
  const pptxgen = (await import('pptxgenjs')).default
  const pptx = new pptxgen()
  pptx.defineLayout({ name: 'W', width: 13.33, height: 7.5 })
  pptx.layout = 'W'
  pptx.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial' }

  const titleBar = (s, title, sub) => {
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.15, fill: { color: NAVY } })
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 1.15, w: 13.33, h: 0.06, fill: { color: GOLD } })
    s.addText(title, { x: 0.5, y: 0.24, w: 12.3, h: 0.6, fontSize: 22, bold: true, color: 'FFFFFF' })
    if (sub) s.addText(sub, { x: 0.5, y: 0.78, w: 12.3, h: 0.3, fontSize: 12, color: GOLD_LT })
  }
  const footer = (s) => s.addText('Strathmore University Business School  |  Confidential', { x: 0.5, y: 7.05, w: 12.3, h: 0.3, fontSize: 8, color: MUTE })

  const tableOpts = (colW) => ({
    x: 0.5, y: 1.5, w: 12.33, colW,
    border: { type: 'solid', color: 'D5DCE8', pt: 0.5 },
    fontFace: 'Arial', autoPage: false, valign: 'middle'
  })
  const head = (cols) => cols.map((c) => ({ text: c, options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, fontSize: 10, align: 'left' } }))
  const bodyRows = (rows) => rows.map((r, ri) => r.map((c, ci) => ({
    text: String(c),
    options: { fontSize: 10, color: INK, fill: { color: ri % 2 ? 'F5F7FB' : 'FFFFFF' }, align: ci === 0 ? 'left' : 'right', bold: ci === 0 }
  })))

  // 1. Title
  let s = pptx.addSlide()
  s.background = { color: 'FFFFFF' }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 2.5, fill: { color: NAVY } })
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 2.5, w: 13.33, h: 0.08, fill: { color: GOLD } })
  s.addText('Kenya Pastoral Markets Development Program', { x: 0.6, y: 0.7, w: 12, h: 0.8, fontSize: 30, bold: true, color: 'FFFFFF' })
  s.addText(model.meta.investmentId, { x: 0.6, y: 1.55, w: 12, h: 0.4, fontSize: 13, color: GOLD_LT, bold: true })
  s.addText(`${model.meta.periodType === 'quarterly' ? 'Quarterly' : 'Monthly'} check-in  |  ${model.meta.periodLabel}`, { x: 0.6, y: 3.0, w: 12, h: 0.5, fontSize: 18, bold: true, color: NAVY_DK })
  s.addText(model.meta.preparedBy || 'Programme Management Office', { x: 0.6, y: 3.6, w: 12, h: 0.4, fontSize: 13, color: INK })
  s.addText(`Generated ${model.meta.generatedAt}`, { x: 0.6, y: 6.9, w: 12, h: 0.3, fontSize: 9, color: MUTE, italic: true })

  // 2. Agenda
  s = pptx.addSlide(); titleBar(s, 'Agenda'); footer(s)
  const agenda = ['Consolidated dashboard', 'Offtaker dashboards (KPMD and MTLDK)', 'Highlights', 'Challenges', 'Next steps']
  s.addText(agenda.map((a, i) => ({ text: `${i + 1}.  ${a}`, options: { breakLine: true, paraSpaceAfter: 14 } })),
    { x: 0.9, y: 1.7, w: 11, h: 4.5, fontSize: 18, color: INK })

  // 3. Consolidated dashboard
  s = pptx.addSlide(); titleBar(s, 'Consolidated dashboard', model.meta.periodLabel); footer(s)
  const dashHead = head(['Metric', 'KPMD', 'MTLDK', 'Total', 'Target', '% target'])
  const dashBody = bodyRows(model.metrics.map((m) => [m.label, fmt(m.kpmd), fmt(m.mtldk), fmt(m.total), fmt(m.target), m.pct + '%']))
  s.addTable([dashHead, ...dashBody], tableOpts([3.9, 1.7, 1.7, 1.7, 1.7, 1.63]))

  // 4. Offtaker dashboards per track
  for (const track of ['KPMD', 'MTLDK']) {
    const rows = model.perOfftaker.filter((r) => r.track === track)
    if (!rows.length) continue
    s = pptx.addSlide(); titleBar(s, `Offtaker dashboards ${track}`, `${rows.length} county operations`); footer(s)
    const h = head(['Offtaker', 'County', 'Registered HH', 'Female', 'Goats', 'Sheep'])
    const b = bodyRows(rows.map((r) => [r.offtaker, r.county, fmt(r.hh), fmt(r.female), fmt(r.goats), fmt(r.sheep)]))
    s.addTable([h, ...b], tableOpts([2.6, 2.6, 2.2, 1.7, 1.6, 1.63]))
  }

  // 5. Highlights, challenges, next steps per track
  const textSlide = (title, sub, items) => {
    const sl = pptx.addSlide(); titleBar(sl, title, sub); footer(sl)
    if (!items.length) { sl.addText('None recorded for this period.', { x: 0.9, y: 1.8, w: 11, h: 0.5, fontSize: 13, color: MUTE }); return }
    sl.addText(items.map((it) => ({
      text: `${it.head}: ${it.body || '-'}`,
      options: { bullet: { code: '2022' }, breakLine: true, paraSpaceAfter: 10, color: INK, fontSize: 13 }
    })), { x: 0.8, y: 1.6, w: 11.8, h: 5.2, valign: 'top' })
  }
  for (const track of ['KPMD', 'MTLDK']) {
    const nar = model.narrative.filter((n) => n.track === track)
    textSlide(`Highlights ${track}`, model.meta.periodLabel,
      nar.filter((n) => n.highlight).map((n) => ({ head: `${n.offtaker} – ${n.county}`, body: n.highlight })))
  }
  textSlide('Challenges', 'Across offtakers',
    model.narrative.filter((n) => n.challenge).map((n) => ({ head: `${n.offtaker} – ${n.county}`, body: n.challenge })))
  textSlide('Next steps', 'Across offtakers',
    model.narrative.filter((n) => n.nextStep).map((n) => ({ head: `${n.offtaker} – ${n.county}`, body: n.nextStep })))

  // 6. P&L (quarterly)
  if (model.meta.periodType === 'quarterly' && model.pnl && model.pnl.length) {
    s = pptx.addSlide(); titleBar(s, 'Offtaker business (P&L)', model.meta.periodLabel); footer(s)
    const h = head(['Offtaker', 'Total revenue', 'Total costs', 'Net income'])
    const b = bodyRows(model.pnl.map((p) => [p.offtaker, fmt(p.revenue), fmt(p.costs), fmt(p.netIncome)]))
    s.addTable([h, ...b], tableOpts([3.3, 3.0, 3.0, 3.03]))
  }

  // 6b. Field photo highlights, pulled from the offtakers' own decks
  if (model.photos && model.photos.length) {
    const byOff = {}
    model.photos.forEach((p) => { (byOff[p.offtaker] = byOff[p.offtaker] || []).push(p) })
    for (const off of Object.keys(byOff)) {
      const pics = byOff[off]
      for (let i = 0; i < pics.length; i += 2) {
        const sl = pptx.addSlide(); titleBar(sl, `Field highlights \u2013 ${off}`, model.meta.periodLabel); footer(sl)
        pics.slice(i, i + 2).forEach((p, idx) => {
          const x = 0.6 + idx * 6.35
          try { sl.addImage({ data: p.dataUrl, x, y: 1.5, w: 6.0, h: 3.7, sizing: { type: 'contain', w: 6.0, h: 3.7 } }) } catch (e) { /* skip bad image */ }
          if (p.caption) sl.addText(p.caption, { x, y: 5.35, w: 6.0, h: 0.9, fontSize: 12, color: INK, valign: 'top' })
        })
      }
    }
  }

  // 7. Thank you
  s = pptx.addSlide()
  s.background = { color: NAVY }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 3.55, w: 13.33, h: 0.06, fill: { color: GOLD } })
  s.addText('Thank you', { x: 0.6, y: 2.7, w: 12, h: 0.9, fontSize: 40, bold: true, color: 'FFFFFF' })
  s.addText(model.meta.investmentId + '  |  Strathmore University Business School', { x: 0.6, y: 3.75, w: 12, h: 0.4, fontSize: 13, color: GOLD_LT })

  return pptx
}

// ---- Word ------------------------------------------------------------------
export async function buildDoc(model) {
  const docx = await import('docx')
  const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, AlignmentType } = docx
  const W = 9026
  const bd = { style: BorderStyle.SINGLE, size: 1, color: 'D5DCE8' }
  const borders = { top: bd, bottom: bd, left: bd, right: bd }

  const hRow = (cols) => new TableRow({
    tableHeader: true,
    children: cols.map((c) => new TableCell({
      borders, shading: { fill: NAVY, type: ShadingType.CLEAR, color: 'auto' }, margins: { top: 50, bottom: 50, left: 90, right: 90 },
      children: [new Paragraph({ children: [new TextRun({ text: c, bold: true, color: 'FFFFFF', size: 17 })] })]
    }))
  })
  const bRow = (cells, i) => new TableRow({
    children: cells.map((c, ci) => new TableCell({
      borders, shading: i % 2 ? { fill: 'F5F7FB', type: ShadingType.CLEAR, color: 'auto' } : undefined, margins: { top: 40, bottom: 40, left: 90, right: 90 },
      children: [new Paragraph({ children: [new TextRun({ text: String(c), size: 16, color: INK, bold: ci === 0 })] })]
    }))
  })
  const table = (cols, rows) => new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: cols.map(() => Math.floor(W / cols.length)),
    rows: [hRow(cols), ...rows.map((r, i) => bRow(r, i))]
  })
  const h2 = (t) => new Paragraph({ spacing: { before: 240, after: 100 }, children: [new TextRun({ text: t, bold: true, size: 24, color: NAVY })] })

  const children = [
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Kenya Pastoral Markets Development Program  |  ' + model.meta.investmentId, bold: true, size: 16, color: GOLD })] }),
    new Paragraph({ spacing: { after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 2 } }, children: [new TextRun({ text: `${model.meta.periodType === 'quarterly' ? 'Quarterly' : 'Monthly'} consolidated report`, bold: true, size: 34, color: NAVY })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `${model.meta.periodLabel}. Prepared by ${model.meta.preparedBy || 'the Programme Management Office'}. Generated ${model.meta.generatedAt}.`, size: 18, color: MUTE, italics: true })] }),
    h2('Consolidated dashboard'),
    table(['Metric', 'KPMD', 'MTLDK', 'Total', 'Target', '% target'],
      model.metrics.map((m) => [m.label, fmt(m.kpmd), fmt(m.mtldk), fmt(m.total), fmt(m.target), m.pct + '%']))
  ]
  for (const track of ['KPMD', 'MTLDK']) {
    const rows = model.perOfftaker.filter((r) => r.track === track)
    if (!rows.length) continue
    children.push(h2(`Offtaker dashboards ${track}`))
    children.push(table(['Offtaker', 'County', 'Registered HH', 'Female', 'Goats', 'Sheep'],
      rows.map((r) => [r.offtaker, r.county, fmt(r.hh), fmt(r.female), fmt(r.goats), fmt(r.sheep)])))
  }
  const textBlock = (title, key) => {
    const items = model.narrative.filter((n) => n[key])
    children.push(h2(title))
    if (!items.length) { children.push(new Paragraph({ children: [new TextRun({ text: 'None recorded for this period.', size: 18, color: MUTE })] })); return }
    items.forEach((n) => children.push(new Paragraph({
      spacing: { after: 80 }, alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: `${n.offtaker} – ${n.county}: `, bold: true, size: 18, color: NAVY_DK }), new TextRun({ text: n[key], size: 18, color: INK })]
    })))
  }
  textBlock('Highlights', 'highlight')
  textBlock('Challenges', 'challenge')
  textBlock('Next steps', 'nextStep')

  if (model.meta.periodType === 'quarterly' && model.pnl && model.pnl.length) {
    children.push(h2('Offtaker business (P&L)'))
    children.push(table(['Offtaker', 'Total revenue', 'Total costs', 'Net income'],
      model.pnl.map((p) => [p.offtaker, fmt(p.revenue), fmt(p.costs), fmt(p.netIncome)])))
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial' } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }]
  })
  return { doc, Packer: docx.Packer }
}
