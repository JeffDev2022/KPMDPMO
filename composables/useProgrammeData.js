// ---------------------------------------------------------------------------
// Programme data access. Wraps the seed layer and exposes derived aggregates so
// every view reads from one governed source. Swap the imports here for the live
// Google Sheets / database layer and the rest of the app is unchanged.
// ---------------------------------------------------------------------------
import {
  programme, sources, deliverables, offtakers, pipeline,
  meal, gender, stakeholders, impact, issues, ragLabel
} from '~/data/seed.js'

export function useProgrammeData() {
  const totalVolumeTarget = offtakers.reduce((s, o) => s + o.volumeTarget, 0)
  const totalVolumeActual = offtakers.reduce((s, o) => s + o.volumeActual, 0)
  const totalDisbursed = offtakers.reduce((s, o) => s + o.disbursedUsd, 0)
  const totalFacility = offtakers.reduce((s, o) => s + o.facilityUsd, 0)
  const todayVolume = offtakers.reduce((s, o) => s + o.daily[o.daily.length - 1], 0)
  const prevVolume = offtakers.reduce((s, o) => s + o.daily[o.daily.length - 2], 0)

  const delivByStatus = (st) => deliverables.filter((d) => d.status === st).length
  const countiesActive = [...new Set(offtakers.flatMap((o) => o.counties))]

  const redFlags = [
    ...issues.filter((i) => i.severity === 'red'),
    ...offtakers.filter((o) => o.rag === 'red').map((o) => ({ offtaker: o.name, issue: 'Performance off track', owner: Object.values(o.contacts)[0], severity: 'red' }))
  ]

  const fmtUsd = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'm'
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k'
    return '$' + n
  }
  const fmtNum = (n) => n.toLocaleString('en-US')
  const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100))

  return {
    programme, sources, deliverables, offtakers, pipeline, meal, gender,
    stakeholders, impact, issues, ragLabel,
    // aggregates
    totals: {
      volumeTarget: totalVolumeTarget,
      volumeActual: totalVolumeActual,
      disbursed: totalDisbursed,
      facility: totalFacility,
      todayVolume, prevVolume,
      completed: delivByStatus('Completed'),
      started: delivByStatus('Started'),
      scheduled: delivByStatus('Scheduled'),
      deliverableCount: deliverables.length,
      countiesActive: countiesActive.length
    },
    redFlags, countiesActive,
    // formatters
    fmtUsd, fmtNum, pct
  }
}
