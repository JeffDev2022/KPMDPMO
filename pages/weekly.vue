<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Weekly tier · Manage offtakers</div>
      <h1>Weekly offtaker scorecard</h1>
      <p>Built around the weekly meeting rota. Volumes against target, the issue log and the action tracker, so each offtaker meeting runs from one page. Feeds outputs 4, 8 and 10.</p>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Offtaker scorecard</h3>
        <span class="sub">Meeting order · this week</span>
      </div>
      <table class="data">
        <thead>
          <tr><th>Meeting</th><th>Offtaker</th><th>Lead</th><th class="num">Week volume</th><th class="num">Target</th><th style="width:160px">Attainment</th><th style="width:110px">8-week trend</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr v-for="o in byMeeting" :key="o.id">
            <td><div class="strong">{{ o.meeting.day }}</div><div class="muted" style="font-size:11.5px">{{ o.meeting.time }}</div></td>
            <td class="strong">{{ o.name }}</td>
            <td class="muted">{{ o.contacts.PM || Object.values(o.contacts)[0] }}</td>
            <td class="num strong">{{ o.weekly[o.weekly.length-1] }}</td>
            <td class="num muted">{{ Math.round(o.volumeTarget/8) }}</td>
            <td><ProgressBar :value="weekAttainment(o)" :rag="o.rag" /></td>
            <td><SparkLine :data="o.weekly" :tone="o.rag === 'red' ? 'red' : 'green'" /></td>
            <td><StatusPill :rag="o.rag" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-head"><h3>Issue log</h3><span class="sub">Open items</span></div>
        <table class="data">
          <thead><tr><th>Offtaker</th><th>Issue</th><th>Owner</th><th>Due</th><th>Severity</th></tr></thead>
          <tbody>
            <tr v-for="(i, idx) in issues" :key="idx">
              <td class="strong">{{ i.offtaker }}</td>
              <td>{{ i.issue }}</td>
              <td class="muted">{{ i.owner }}</td>
              <td class="muted">{{ fmtDate(i.due) }}</td>
              <td><StatusPill :rag="i.severity" :label="i.severity === 'red' ? 'High' : 'Medium'" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card card-pad">
        <h3 style="margin-bottom:6px">Insights commentary</h3>
        <p class="muted" style="font-size:12px; margin-bottom:14px">Output 4 · analytical assistant</p>
        <div class="insight"><span class="i-dot green"></span><div><b>LiveMo and ChillZone</b> are tracking ahead of target and pulling the programme aggregate up.</div></div>
        <div class="insight"><span class="i-dot red"></span><div><b>Sowle</b> is three weeks below target in Isiolo. Volumes have not recovered since the early-June dip. Recommend escalation at the Monday 9:15 meeting.</div></div>
        <div class="insight"><span class="i-dot amber"></span><div><b>ABF</b> growth is steady but Tana River cold chain access is intermittent, capping potential.</div></div>
        <div class="insight"><span class="i-dot navy"></span><div>Programme aggregation is up <b>{{ weekGrowth }}%</b> over the eight-week window.</div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { offtakers, issues } = useProgrammeData()
const meetingOrder = ['genco', 'chillzone', 'sowle', 'livemo', 'abf']
const byMeeting = computed(() => meetingOrder.map((id) => offtakers.find((o) => o.id === id)).filter(Boolean))
const weekAttainment = (o) => Math.round((o.weekly[o.weekly.length - 1] / (o.volumeTarget / 8)) * 100)
const fmtDate = (s) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
const weekGrowth = computed(() => {
  const first = offtakers.reduce((s, o) => s + o.weekly[0], 0)
  const last = offtakers.reduce((s, o) => s + o.weekly[o.weekly.length - 1], 0)
  return Math.round(((last - first) / first) * 100)
})
</script>

<style scoped>
.insight { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; line-height: 1.5; }
.insight:last-child { border-bottom: none; }
.i-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
.i-dot.green { background: var(--green); } .i-dot.red { background: var(--red); }
.i-dot.amber { background: var(--amber); } .i-dot.navy { background: var(--navy); }
</style>
