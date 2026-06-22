<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Operational core · Output 10</div>
      <h1>Offtakers</h1>
      <p>The five offtakers operating across ten counties. Select one to drill from the programme view into a single operator without losing context.</p>
    </div>

    <div class="grid grid-3 cards-row">
      <button
        v-for="o in offtakers" :key="o.id"
        class="ot-card card" :class="{ sel: selected === o.id }"
        @click="selected = o.id"
      >
        <div class="flex between center">
          <span class="ot-name">{{ o.name }}</span>
          <StatusPill :rag="o.rag" />
        </div>
        <div class="ot-counties">{{ o.counties.join(' · ') }}</div>
        <div class="ot-stat">
          <div><div class="os-v">{{ fmtNum(o.volumeActual) }}</div><div class="os-l">volume</div></div>
          <div><div class="os-v">{{ attain(o) }}%</div><div class="os-l">of target</div></div>
          <div><div class="os-v">{{ o.sustainability }}</div><div class="os-l">sustain.</div></div>
        </div>
        <SparkLine :data="o.weekly" :tone="o.rag === 'red' ? 'red' : 'green'" />
      </button>
    </div>

    <div class="card detail" v-if="active">
      <div class="card-head">
        <h3>{{ active.name }} · detail</h3>
        <span class="sub">{{ active.region }} · meets {{ active.meeting.day }} {{ active.meeting.time }}</span>
      </div>
      <div class="detail-grid">
        <div class="d-block">
          <div class="d-title">Contacts</div>
          <div v-for="(v, k) in active.contacts" :key="k" class="d-row"><span class="muted">{{ k }}</span><span class="strong">{{ v }}</span></div>
        </div>
        <div class="d-block">
          <div class="d-title">Counties</div>
          <div v-for="c in active.counties" :key="c" class="d-row"><span>{{ c }}</span><StatusPill rag="green" label="Active" /></div>
        </div>
        <div class="d-block">
          <div class="d-title">Volume against target</div>
          <ProgressBar :value="attain(active)" :rag="active.rag" />
          <div class="d-row" style="margin-top:10px"><span class="muted">Actual</span><span class="strong">{{ fmtNum(active.volumeActual) }} head</span></div>
          <div class="d-row"><span class="muted">Target</span><span>{{ fmtNum(active.volumeTarget) }} head</span></div>
        </div>
        <div class="d-block">
          <div class="d-title">Financial sustainability</div>
          <ProgressBar :value="active.sustainability" :rag="active.sustainability >= 70 ? 'green' : active.sustainability >= 60 ? 'amber' : 'red'" />
          <div class="d-row" style="margin-top:10px"><span class="muted">Disbursed</span><span class="strong">{{ fmtUsd(active.disbursedUsd) }}</span></div>
          <div class="d-row"><span class="muted">Facility</span><span>{{ fmtUsd(active.facilityUsd) }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { offtakers, fmtNum, fmtUsd } = useProgrammeData()
const selected = ref(offtakers[0].id)
const active = computed(() => offtakers.find((o) => o.id === selected.value))
const attain = (o) => Math.round((o.volumeActual / o.volumeTarget) * 100)
</script>

<style scoped>
.cards-row { margin-bottom: 18px; }
.ot-card { text-align: left; cursor: pointer; padding: 16px 18px; font-family: inherit; border: 1px solid var(--border); transition: all 0.12s; }
.ot-card:hover { box-shadow: var(--shadow-md); }
.ot-card.sel { border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }
.ot-name { font-size: 16px; font-weight: 800; color: var(--navy-dk); }
.ot-counties { font-size: 12px; color: var(--ink-3); margin: 4px 0 12px; }
.ot-stat { display: flex; gap: 18px; margin-bottom: 12px; }
.os-v { font-size: 17px; font-weight: 800; color: var(--navy); }
.os-l { font-size: 10.5px; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.03em; }
.detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; padding: 20px; }
.d-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gold); margin-bottom: 12px; }
.d-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 13px; border-bottom: 1px solid var(--border); }
.d-row:last-child { border-bottom: none; }
@media (max-width: 880px) { .detail-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .detail-grid { grid-template-columns: 1fr; } }
</style>
