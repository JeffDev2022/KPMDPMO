<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="logo">SU</div>
      <div class="brand-txt">
        <div class="b1">KPMD Dashboard</div>
        <div class="b2">MTLDK Programme</div>
      </div>
    </div>

    <div class="lens" :class="roleMeta?.id">
      <span class="lens-dot"></span>{{ roleMeta?.lens }}
    </div>

    <nav class="nav">
      <NuxtLink
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        class="nav-item"
        active-class="active"
      >
        <span class="ic" v-html="item.icon"></span>
        <span>{{ item.label }}</span>
        <span v-if="item.tier" class="tier">{{ item.tier }}</span>
      </NuxtLink>
    </nav>

    <div class="foot">
      <div class="foot-line">Investment {{ programme.investmentId }}</div>
      <div class="foot-line muted-foot">Strathmore University Business School</div>
    </div>
  </aside>
</template>

<script setup>
import { programme } from '~/data/seed.js'
const { roleMeta, can } = useAuth()

const ICON = {
  daily: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  weekly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
  monthly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M7 13h4M7 17h4M14 13h3M14 17h3"/></svg>',
  quarterly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 19V5M4 19h16"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="13" width="3" height="4"/></svg>',
  yearly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 21l-5 .1 1-5.5-4-3.9 5.5-.8z"/></svg>',
  deliverables: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  offtakers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6"/></svg>',
  pipeline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 7h6l2 3h10"/><path d="M3 12h11l2 3h5"/><circle cx="20" cy="7" r="1.5"/><circle cx="21" cy="15" r="1.5"/></svg>',
  reports: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>'
}

const ALL = [
  { key: 'daily', to: '/daily', label: 'Daily', tier: 'D' },
  { key: 'weekly', to: '/weekly', label: 'Weekly', tier: 'W' },
  { key: 'monthly', to: '/monthly', label: 'Monthly', tier: 'M' },
  { key: 'quarterly', to: '/quarterly', label: 'Quarterly', tier: 'Q' },
  { key: 'yearly', to: '/yearly', label: 'Yearly', tier: 'Y' },
  { key: 'deliverables', to: '/deliverables', label: 'Deliverables' },
  { key: 'offtakers', to: '/offtakers', label: 'Offtakers' },
  { key: 'pipeline', to: '/pipeline', label: 'Co-investment' },
  { key: 'reports', to: '/reports', label: 'Reports' }
]

const items = computed(() => ALL.filter((i) => can(i.key)).map((i) => ({ ...i, icon: ICON[i.key] })))
</script>

<style scoped>
.sidebar {
  position: fixed; top: 0; left: 0; bottom: 0; width: var(--sidebar-w);
  background: linear-gradient(180deg, #14213d 0%, #1f3864 100%);
  color: #cdd7ea; display: flex; flex-direction: column; padding: 18px 14px; z-index: 30;
}
.brand { display: flex; align-items: center; gap: 11px; padding: 4px 6px 14px; }
.logo {
  width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, #c9a227, #a67c00); color: #14213d;
  font-weight: 800; font-size: 15px; display: flex; align-items: center; justify-content: center;
}
.b1 { color: #fff; font-weight: 700; font-size: 14px; }
.b2 { color: #9fb0cf; font-size: 11px; }
.lens {
  display: inline-flex; align-items: center; gap: 7px; margin: 0 6px 14px;
  font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 20px;
  background: rgba(255,255,255,0.07); color: #e8c766; width: fit-content;
}
.lens-dot { width: 7px; height: 7px; border-radius: 50%; background: #c9a227; }
.lens.staff { color: #9ec1ff; } .lens.staff .lens-dot { background: #6ea2ff; }
.nav { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
.nav-item {
  display: flex; align-items: center; gap: 11px; padding: 9px 12px; border-radius: 9px;
  color: #c2cee4; font-size: 13.5px; font-weight: 500; transition: all 0.12s;
}
.nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
.nav-item.active { background: rgba(201,162,39,0.16); color: #fff; font-weight: 600; }
.nav-item.active .ic { color: #e8c766; }
.ic { width: 18px; height: 18px; display: inline-flex; color: #8ea3c6; }
.ic :deep(svg) { width: 18px; height: 18px; }
.tier {
  margin-left: auto; font-size: 10px; font-weight: 800; width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center; border-radius: 5px;
  background: rgba(255,255,255,0.08); color: #9fb0cf;
}
.nav-item.active .tier { background: rgba(201,162,39,0.3); color: #f0d997; }
.foot { margin-top: auto; padding: 14px 8px 4px; border-top: 1px solid rgba(255,255,255,0.08); }
.foot-line { font-size: 11px; color: #9fb0cf; }
.muted-foot { color: #6f82a4; margin-top: 2px; }
@media (max-width: 880px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.2s; }
}
</style>
