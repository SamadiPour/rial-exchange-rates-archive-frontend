<script setup lang="ts">
import { computed } from 'vue';
import type { Currency, ExchangeData, PriceType } from '@/types';
import { CURRENCY_BY_CODE } from '@/constants/currencies';
import { findIndexAtOrBefore, priceOf } from '@/services/exchange-rates';
import { fmtPct, fmtToman } from '@/utils/format';

const props = defineProps<{
  data: ExchangeData;
  codes: string[];
  priceType: PriceType;
  rangeStart: string;
  rangeEnd: string;
}>();

interface Row {
  code: string;
  meta: Currency | undefined;
  v0: number;
  v1: number;
  change: number;
  cagr: number;
  dd: number;
}

const rows = computed<Row[]>(() => {
  const i0 = findIndexAtOrBefore(props.data.dates, props.rangeStart);
  const i1 = findIndexAtOrBefore(props.data.dates, props.rangeEnd);
  const years = Math.max(0.01, (i1 - i0) / 365.25);
  const out: Row[] = [];
  for (const code of props.codes) {
    if (!props.data.series[code]) continue;
    const pick = priceOf(props.data, code, props.priceType);
    const v0 = pick(i0);
    const v1 = pick(i1);
    const change = ((v1 - v0) / v0) * 100;
    const cagr = (Math.pow(v1 / v0, 1 / years) - 1) * 100;
    let peak = v0;
    let dd = 0;
    for (let i = i0; i <= i1; i++) {
      const v = pick(i);
      if (v > peak) peak = v;
      const d = (peak - v) / peak;
      if (d > dd) dd = d;
    }
    out.push({
      code,
      meta: CURRENCY_BY_CODE[code],
      v0,
      v1,
      change,
      cagr,
      dd: dd * 100,
    });
  }
  return out;
});
</script>

<template>
  <div class="panel stats-panel">
    <h3>Devaluation stats</h3>
    <div class="range-line">
      Range:
      <span class="range-dates">{{ rangeStart }}</span>
      →
      <span class="range-dates">{{ rangeEnd }}</span>
    </div>
    <div class="stats-grid">
      <div v-for="r in rows" :key="r.code" class="stat-card">
        <div class="stat-label">
          {{ r.meta?.flag }} {{ r.code.toUpperCase() }} — {{ r.meta?.name }}
        </div>
        <div class="stat-value num">
          {{ fmtToman(r.v1) }}
          <span class="stat-unit">Toman</span>
        </div>
        <div class="stat-metrics">
          <span>
            Δ
            <span :class="r.change >= 0 ? 'up' : 'down'">{{
              fmtPct(r.change, 1)
            }}</span>
          </span>
          <span>
            CAGR
            <span :class="r.cagr >= 0 ? 'up' : 'down'">{{
              fmtPct(r.cagr, 1)
            }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  background: transparent;
  padding: 0;
  border: none;
}

.stats-panel h3 {
  padding-left: 4px;
}

.range-line {
  margin-top: -8px;
  margin-bottom: 14px;
  padding-left: 4px;
  color: var(--muted);
  font-family: var(--mono-font);
  font-size: 11.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.range-dates {
  color: var(--fg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.stat-card {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.15s;
}

.stat-card:hover {
  border-color: rgba(242, 239, 232, 0.22);
}

body[data-theme='light'] .stat-card:hover {
  border-color: rgba(26, 24, 21, 0.3);
}

.stat-label {
  font-size: 12px;
  color: var(--muted);
}

.stat-value {
  font-size: 22px;
  font-family: var(--display-font);
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}

.stat-unit {
  font-size: 11px;
  color: var(--muted);
  margin-left: 6px;
  font-family: var(--mono-font);
}

.stat-metrics {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  font-family: var(--mono-font);
}
</style>
