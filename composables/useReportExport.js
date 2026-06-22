// ---------------------------------------------------------------------------
// Reporting engine.
//
// Three selectors (period, deliverable scope, audience template) assemble ONE
// report model from the governed data layer. That single model is then rendered
// to Word, PowerPoint, PDF or Excel, so an exported report can never disagree
// with the live screen it came from. Heavy formatting libraries are imported
// dynamically so they only load when an export is actually requested.
// ---------------------------------------------------------------------------
import {
  programme, deliverables, offtakers, pipeline, meal, gender, stakeholders, impact, ragLabel
} from '~/data/seed.js'

const NAVY = '1F3864'
const GOLD = 'A67C00'
const INK = '1F2937'
const LIGHT = 'EDF1F7'

export const PERIODS = [
  { id: 'day', label: 'Single day (today)', short: 'Daily' },
  { id: 'week', label: 'This week', short: 'Weekly' },
  { id: 'month', label: 'This month', short: 'Monthly' },
  { id: 'quarter', label: 'This quarter', short: 'Quarterly' },
  { id: 'year', label: 'This year', short: 'Annual' },
  { id: 'programme', label: 'Full programme to date', short: 'Programme' }
]

export const SCOPES = [
  { id: 'all', label: 'All outputs (1 to 15)', ids: deliverables.map((d) => d.id) },
  { id: 'operational', label: 'Operational and scaling (8, 10)', ids: [8, 10] },
  { id: 'coinvest', label: 'Co-investment (7, 11)', ids: [7, 11] },
  { id: 'accountability', label: 'MEAL, gender, stakeholder (3, 5, 6)', ids: [3, 5, 6] },
  { id: 'foundation', label: 'Foundation and onboarding (1, 2)', ids: [1, 2] },
  { id: 'impact', label: 'Annual impact (12 to 15)', ids: [12, 13, 14, 15] }
]

export const AUDIENCES = [
  { id: 'staff', label: 'Programme staff (operational)' },
  { id: 'donor', label: 'Donor (accountability)' }
]

function fmtUsd(n) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'm'
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k'
  return '$' + n
}
function nowStamp() {
  const d = new Date()
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// --- assemble the report model ----------------------------------------------
export function buildReportModel({ periodId, scopeId, audienceId }) {
  const period = PERIODS.find((p) => p.id === periodId) || PERIODS[2]
  const scope = SCOPES.find((s) => s.id === scopeId) || SCOPES[0]
  const audience = AUDIENCES.find((a) => a.id === audienceId) || AUDIENCES[0]
  const scoped = deliverables.filter((d) => scope.ids.includes(d.id))

  const title = `${period.short} ${audience.id === 'donor' ? 'accountability' : 'operations'} report`
  const meta = {
    title,
    programme: programme.name,
    investmentId: programme.investmentId,
    periodLabel: period.label,
    audienceLabel: audience.label,
    audienceId: audience.id,
    deliverableLabel: scope.label,
    generatedAt: nowStamp(),
    freshness: 'Field aggregation sheet updated 22 Jun 2026 06:40'
  }

  // headline figures
  const volTarget = offtakers.reduce((s, o) => s + o.volumeTarget, 0)
  const volActual = offtakers.reduce((s, o) => s + o.volumeActual, 0)
  const disbursed = offtakers.reduce((s, o) => s + o.disbursedUsd, 0)
  const summary = [
    { label: 'Deliverables on track', value: `${scoped.filter((d) => d.rag === 'green').length} of ${scoped.length}` },
    { label: 'Aggregation vs target', value: `${Math.round((volActual / volTarget) * 100)}%` },
    { label: 'Disbursed to date', value: fmtUsd(disbursed) },
    { label: 'Co-investment secured', value: fmtUsd(pipeline.securedUsd) }
  ]

  // tables depend on scope
  const tables = []

  tables.push({
    title: 'Deliverable status',
    columns: ['Output', 'Title', 'Target', 'Status', 'Progress'],
    rows: scoped.map((d) => [String(d.id), d.title, d.target, `${d.status} (${ragLabel[d.rag]})`, `${d.progress}%`])
  })

  if (scope.ids.some((id) => [8, 10].includes(id)) || scopeId === 'all') {
    tables.push({
      title: 'Offtaker performance',
      columns: ['Offtaker', 'Counties', 'Volume', 'Target', 'Attainment', 'Status'],
      rows: offtakers.map((o) => [
        o.name, o.counties.join(', '), String(o.volumeActual), String(o.volumeTarget),
        `${Math.round((o.volumeActual / o.volumeTarget) * 100)}%`, ragLabel[o.rag]
      ])
    })
  }

  if (scope.ids.some((id) => [7, 11].includes(id)) || scopeId === 'all') {
    tables.push({
      title: 'Co-investment pipeline',
      columns: ['Investor', 'Stage', 'Amount', 'Focus'],
      rows: pipeline.investors.map((i) => [i.name, i.stage, fmtUsd(i.amountUsd), i.focus])
    })
  }

  if (scope.ids.some((id) => [3, 5, 6].includes(id)) || scopeId === 'all') {
    tables.push({
      title: 'MEAL indicators',
      columns: ['Indicator', 'Current', 'Target', 'Unit'],
      rows: meal.map((m) => [m.name, String(m.current), String(m.target), m.unit])
    })
  }

  if (scope.ids.some((id) => [12, 13, 14, 15].includes(id)) || scopeId === 'all') {
    tables.push({
      title: 'Annual impact reporting',
      columns: ['Year', 'Report', 'Analysis', 'Due', 'Readiness'],
      rows: impact.rows.map((r) => [String(r.year), r.report, r.analysis, r.due, `${r.readiness}%`])
    })
  }

  const narrative = audience.id === 'donor'
    ? `This ${period.short.toLowerCase()} brief reports progress against the funded outputs in scope (${scope.label}). It is prepared for the donor and governance audience and shows deliverable status against target dates, co-investment leverage secured, and outcome indicators drawn from the MEAL framework. Figures trace to the governed programme data layer.`
    : `This ${period.short.toLowerCase()} report is prepared for programme staff. It leads with the operational position across the ${offtakers.length} offtakers and active counties, surfacing performance against target and any items needing attention this period. Figures trace to the governed programme data layer.`

  return { meta, summary, tables, narrative }
}

// --- shared download helper for blob based exports --------------------------
function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

function baseName(model) {
  return model.meta.title.replace(/[^a-z0-9]+/gi, '_') + '_' + new Date().toISOString().slice(0, 10)
}

// --- PDF --------------------------------------------------------------------
async function exportPdf(model) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()

  doc.setFillColor('#' + NAVY); doc.rect(0, 0, W, 70, 'F')
  doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
  doc.text(model.meta.title, 40, 34)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.text(`${model.meta.programme}  |  ${model.meta.investmentId}`, 40, 52)

  let y = 92
  doc.setTextColor('#' + INK); doc.setFontSize(9)
  doc.text(`Period: ${model.meta.periodLabel}    Audience: ${model.meta.audienceLabel}`, 40, y)
  doc.text(`Scope: ${model.meta.deliverableLabel}`, 40, y + 13)
  doc.text(`Generated: ${model.meta.generatedAt}    Source: ${model.meta.freshness}`, 40, y + 26)
  y += 46

  // summary strip
  const sumBody = [model.summary.map((s) => s.value)]
  autoTable(doc, {
    startY: y,
    head: [model.summary.map((s) => s.label)],
    body: sumBody,
    theme: 'grid',
    headStyles: { fillColor: '#' + GOLD, textColor: '#FFFFFF', fontSize: 8 },
    bodyStyles: { fontSize: 11, fontStyle: 'bold', textColor: '#' + NAVY },
    margin: { left: 40, right: 40 }
  })
  y = doc.lastAutoTable.finalY + 16

  doc.setFontSize(9); doc.setTextColor('#475569')
  const lines = doc.splitTextToSize(model.narrative, W - 80)
  doc.text(lines, 40, y); y += lines.length * 12 + 8

  model.tables.forEach((t) => {
    autoTable(doc, {
      startY: y,
      head: [[t.title]],
      body: [],
      theme: 'plain',
      headStyles: { fillColor: '#' + LIGHT, textColor: '#' + NAVY, fontStyle: 'bold', fontSize: 10 },
      margin: { left: 40, right: 40 }
    })
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY,
      head: [t.columns],
      body: t.rows,
      theme: 'striped',
      headStyles: { fillColor: '#' + NAVY, textColor: '#FFFFFF', fontSize: 8 },
      bodyStyles: { fontSize: 8.5, textColor: '#' + INK },
      alternateRowStyles: { fillColor: '#F7F9FC' },
      margin: { left: 40, right: 40 }
    })
    y = doc.lastAutoTable.finalY + 14
    if (y > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); y = 50 }
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7.5); doc.setTextColor('#94A3B8')
    doc.text(`Strathmore University Business School  |  Confidential  |  Page ${i} of ${pageCount}`, 40, doc.internal.pageSize.getHeight() - 24)
  }
  doc.save(baseName(model) + '.pdf')
}

// --- Word -------------------------------------------------------------------
async function exportDocx(model) {
  const docx = await import('docx')
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, ShadingType, HeadingLevel } = docx
  const W = 9026
  const bd = { style: BorderStyle.SINGLE, size: 1, color: 'D5DCE8' }
  const borders = { top: bd, bottom: bd, left: bd, right: bd }

  const headRow = (cols) => new TableRow({
    tableHeader: true,
    children: cols.map((c) => new TableCell({
      borders, shading: { fill: NAVY, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 60, bottom: 60, left: 90, right: 90 },
      children: [new Paragraph({ children: [new TextRun({ text: c, bold: true, color: 'FFFFFF', size: 17 })] })]
    }))
  })
  const bodyRow = (cells, i, n) => new TableRow({
    children: cells.map((c) => new TableCell({
      borders, shading: i % 2 ? { fill: 'F2F5FA', type: ShadingType.CLEAR, color: 'auto' } : undefined,
      margins: { top: 50, bottom: 50, left: 90, right: 90 },
      children: [new Paragraph({ children: [new TextRun({ text: String(c), size: 16, color: INK })] })]
    }))
  })
  const makeTable = (t) => {
    const n = t.columns.length
    const widths = t.columns.map(() => Math.floor(W / n))
    return new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: widths,
      rows: [headRow(t.columns), ...t.rows.map((r, i) => bodyRow(r, i, n))]
    })
  }

  const children = [
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: model.meta.programme + '  |  ' + model.meta.investmentId, bold: true, size: 16, color: GOLD })] }),
    new Paragraph({ spacing: { after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 2 } }, children: [new TextRun({ text: model.meta.title, bold: true, size: 36, color: NAVY })] }),
    new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: `Period: ${model.meta.periodLabel}    Audience: ${model.meta.audienceLabel}`, size: 18, color: INK })] }),
    new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: `Scope: ${model.meta.deliverableLabel}`, size: 18, color: INK })] }),
    new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: `Generated ${model.meta.generatedAt}. ${model.meta.freshness}.`, italics: true, size: 16, color: '64748B' })] }),
    new Paragraph({ spacing: { after: 160 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: model.narrative, size: 19, color: INK })] })
  ]
  model.tables.forEach((t) => {
    children.push(new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: t.title, bold: true, size: 22, color: NAVY })] }))
    children.push(makeTable(t))
  })

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial' } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }]
  })
  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, baseName(model) + '.docx')
}

// --- PowerPoint -------------------------------------------------------------
async function exportPptx(model) {
  const pptxgen = (await import('pptxgenjs')).default
  const pptx = new pptxgen()
  pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 })
  pptx.layout = 'WIDE'
  const navy = NAVY, gold = GOLD

  // title slide
  let s = pptx.addSlide()
  s.background = { color: 'FFFFFF' }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 2.2, fill: { color: navy } })
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 2.2, w: 13.33, h: 0.08, fill: { color: gold } })
  s.addText(model.meta.programme + '  |  ' + model.meta.investmentId, { x: 0.6, y: 0.5, w: 12, h: 0.4, fontSize: 12, color: 'C9A227', bold: true })
  s.addText(model.meta.title, { x: 0.6, y: 0.9, w: 12, h: 0.9, fontSize: 30, color: 'FFFFFF', bold: true })
  s.addText([
    { text: `Period: ${model.meta.periodLabel}\n`, options: { breakLine: true } },
    { text: `Audience: ${model.meta.audienceLabel}\n`, options: { breakLine: true } },
    { text: `Scope: ${model.meta.deliverableLabel}`, options: {} }
  ], { x: 0.6, y: 2.6, w: 12, h: 1.2, fontSize: 14, color: '1F2937' })
  s.addText(`Generated ${model.meta.generatedAt}. ${model.meta.freshness}.`, { x: 0.6, y: 6.9, w: 12, h: 0.4, fontSize: 9, color: '94A3B8', italic: true })

  // summary slide
  s = pptx.addSlide()
  s.addText('Headline position', { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 22, color: navy, bold: true })
  s.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.05, w: 12.1, h: 0, line: { color: gold, width: 2 } })
  model.summary.forEach((kpi, i) => {
    const x = 0.6 + i * 3.05
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.4, w: 2.85, h: 1.7, fill: { color: 'F4F6FA' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.08 })
    s.addText(kpi.value, { x, y: 1.7, w: 2.85, h: 0.7, fontSize: 26, color: navy, bold: true, align: 'center' })
    s.addText(kpi.label, { x: x + 0.15, y: 2.45, w: 2.55, h: 0.6, fontSize: 11, color: '475569', align: 'center' })
  })
  s.addText(model.narrative, { x: 0.6, y: 3.5, w: 12.1, h: 2.5, fontSize: 13, color: '1F2937', valign: 'top' })

  // one slide per table
  model.tables.forEach((t) => {
    const sl = pptx.addSlide()
    sl.addText(t.title, { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 20, color: navy, bold: true })
    sl.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.0, w: 12.1, h: 0, line: { color: gold, width: 2 } })
    const header = t.columns.map((c) => ({ text: c, options: { bold: true, color: 'FFFFFF', fill: { color: navy }, fontSize: 10 } }))
    const rows = t.rows.slice(0, 12).map((r, ri) => r.map((c) => ({ text: String(c), options: { fontSize: 9.5, color: '1F2937', fill: { color: ri % 2 ? 'F2F5FA' : 'FFFFFF' } } })))
    sl.addTable([header, ...rows], { x: 0.6, y: 1.25, w: 12.1, colW: t.columns.map(() => 12.1 / t.columns.length), border: { type: 'solid', color: 'D5DCE8', pt: 0.5 }, autoPage: false })
  })

  await pptx.writeFile({ fileName: baseName(model) + '.pptx' })
}

// --- Excel ------------------------------------------------------------------
async function exportXlsx(model) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const cover = [
    [model.meta.programme],
    [model.meta.investmentId],
    [model.meta.title],
    [],
    ['Period', model.meta.periodLabel],
    ['Audience', model.meta.audienceLabel],
    ['Scope', model.meta.deliverableLabel],
    ['Generated', model.meta.generatedAt],
    ['Source', model.meta.freshness],
    [],
    ['Headline'],
    ...model.summary.map((s) => [s.label, s.value])
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cover), 'Summary')
  model.tables.forEach((t) => {
    const aoa = [t.columns, ...t.rows]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const name = t.title.replace(/[^a-z0-9 ]/gi, '').slice(0, 28)
    XLSX.utils.book_append_sheet(wb, ws, name || 'Sheet')
  })
  XLSX.writeFile(wb, baseName(model) + '.xlsx')
}

export function useReportExport() {
  const busy = ref(false)
  const lastFormat = ref(null)

  const run = async (format, model) => {
    busy.value = true
    lastFormat.value = format
    try {
      if (format === 'pdf') await exportPdf(model)
      else if (format === 'docx') await exportDocx(model)
      else if (format === 'pptx') await exportPptx(model)
      else if (format === 'xlsx') await exportXlsx(model)
    } catch (e) {
      console.error('Export failed', e)
      if (import.meta.client) alert('Export failed: ' + (e?.message || e))
    } finally {
      busy.value = false
    }
  }

  return { busy, lastFormat, run, buildReportModel, PERIODS, SCOPES, AUDIENCES }
}
