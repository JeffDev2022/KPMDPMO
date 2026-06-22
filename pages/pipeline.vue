<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Co-investment acceleration · Outputs 7 and 11</div>
      <h1>Co-investment pipeline</h1>
      <p>Investors engaged, commitments and the credit guarantee instrument. Tracks the leverage the programme is mobilising against the co-investment target.</p>
    </div>

    <div class="grid grid-4">
      <KpiCard label="Leverage secured" :value="fmtUsd(pipeline.securedUsd)" :meta="pct(pipeline.securedUsd, pipeline.targetLeverageUsd) + '% of target'" trend="up" outputs="7" />
      <KpiCard label="Target leverage" :value="fmtUsd(pipeline.targetLeverageUsd)" meta="Programme goal" outputs="11" />
      <KpiCard label="Guarantee facility" :value="fmtUsd(pipeline.facility.sizeUsd)" :meta="fmtUsd(pipeline.facility.deployedUsd) + ' deployed'" outputs="7" />
      <KpiCard label="Active investors" :value="pipeline.investors.length" meta="Across all stages" outputs="11" />
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head"><h3>Leverage against target</h3><span class="sub">Secured vs {{ fmtUsd(pipeline.targetLeverageUsd) }} goal</span></div>
      <div class="card-pad">
        <div class="bigbar-track">
          <div class="bigbar-fill" :style="{ width: pct(pipeline.securedUsd, pipeline.targetLeverageUsd) + '%' }">
            <span>{{ fmtUsd(pipeline.securedUsd) }} secured</span>
          </div>
        </div>
        <div class="flex between" style="margin-top:8px"><span class="muted" style="font-size:12px">0</span><span class="muted" style="font-size:12px">{{ fmtUsd(pipeline.targetLeverageUsd) }} target</span></div>
      </div>
    </div>

    <div class="section-title">Investor pipeline by stage</div>
    <div class="stages">
      <div v-for="st in stages" :key="st" class="stage-col">
        <div class="stage-head">
          <span>{{ st }}</span>
          <span class="stage-count">{{ byStage(st).length }}</span>
        </div>
        <div v-for="(inv, i) in byStage(st)" :key="i" class="inv-card">
          <div class="inv-name">{{ inv.name }}</div>
          <div class="inv-amt">{{ fmtUsd(inv.amountUsd) }}</div>
          <div class="inv-focus">{{ inv.focus }}</div>
        </div>
        <div v-if="!byStage(st).length" class="stage-empty">None</div>
      </div>
    </div>

    <div class="note" style="margin-top:20px">
      <b>Credit guarantee instrument.</b> {{ pipeline.facility.name }} sized at {{ fmtUsd(pipeline.facility.sizeUsd) }}, status {{ pipeline.facility.status.toLowerCase() }}. The Investment Manager reports from July and the co-investment acceleration report (output 11) compiles investable opportunities for the donor at year end.
    </div>
  </div>
</template>

<script setup>
const { pipeline, fmtUsd, pct } = useProgrammeData()
const stages = ['Identified', 'Engaged', 'Due diligence', 'Committed']
const byStage = (s) => pipeline.investors.filter((i) => i.stage === s)
</script>

<style scoped>
.bigbar-track { background: var(--grey-soft); border-radius: 10px; height: 44px; overflow: hidden; }
.bigbar-fill {
  height: 100%; border-radius: 10px; background: linear-gradient(90deg, var(--navy), var(--navy-700));
  display: flex; align-items: center; padding-left: 16px; color: #fff; font-weight: 700; font-size: 13px; min-width: 120px;
}
.stages { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stage-col { background: #fafbfd; border: 1px solid var(--border); border-radius: 12px; padding: 12px; }
.stage-head { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: var(--navy); margin-bottom: 12px; }
.stage-count { background: var(--navy); color: #fff; border-radius: 20px; min-width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }
.inv-card { background: #fff; border: 1px solid var(--border); border-radius: 9px; padding: 11px 12px; margin-bottom: 9px; }
.inv-name { font-size: 13px; font-weight: 700; color: var(--navy-dk); }
.inv-amt { font-size: 15px; font-weight: 800; color: var(--gold); margin: 3px 0; }
.inv-focus { font-size: 11.5px; color: var(--ink-3); }
.stage-empty { font-size: 12px; color: var(--ink-3); text-align: center; padding: 10px 0; }
@media (max-width: 880px) { .stages { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .stages { grid-template-columns: 1fr; } }
</style>
