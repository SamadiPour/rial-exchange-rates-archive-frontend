<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ExchangeData, PriceType } from '@/types';
import { CURRENCIES, CURRENCY_BY_CODE } from '@/constants/currencies';
import { findIndexAtOrBefore } from '@/services/exchange-rates';
import { fmtPct, fmtToman } from '@/utils/format';
import CurrencySelect from '@/components/controls/CurrencySelect.vue';

const props = defineProps<{
  data: ExchangeData;
  priceType: PriceType;
  rangeStart: string;
  rangeEnd: string;
}>();

const code = ref('usd');

interface Move {
  date: string;
  prev: number;
  cur: number;
  pct: number;
}

const moves = computed<Move[]>(() => {
  const i0 = findIndexAtOrBefore(props.data.dates, props.rangeStart);
  const i1 = findIndexAtOrBefore(props.data.dates, props.rangeEnd);
  const s = props.data.series[code.value];
  if (!s) return [];
  const meta = CURRENCY_BY_CODE[code.value];
  const pick = (i: number) =>
    (props.priceType === 'sell'
      ? s.sell[i]
      : props.priceType === 'mid'
        ? (s.sell[i] + s.buy[i]) / 2
        : s.buy[i]) / (meta?.scale || 1);
  const arr: Move[] = [];
  for (let i = i0 + 1; i <= i1; i++) {
    const prev = pick(i - 1);
    const cur = pick(i);
    if (!isFinite(prev) || !isFinite(cur) || prev <= 0) continue;
    const pct = ((cur - prev) / prev) * 100;
    arr.push({ date: props.data.dates[i], prev, cur, pct });
  }
  arr.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  return arr.slice(0, 20);
});
</script>

<template>
  <div class="panel">
    <div class="lb-head">
      <h3>Biggest single-day moves</h3>
      <div class="lb-select">
        <CurrencySelect v-model="code" :options="CURRENCIES" />
      </div>
    </div>
    <div class="lb-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th class="align-right">Prev</th>
            <th class="align-right">Close</th>
            <th class="align-right">Δ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(m, i) in moves" :key="m.date">
            <td class="muted">{{ i + 1 }}</td>
            <td class="mono">{{ m.date }}</td>
            <td class="align-right num">{{ fmtToman(m.prev) }}</td>
            <td class="align-right num">{{ fmtToman(m.cur) }}</td>
            <td class="align-right" :class="m.pct >= 0 ? 'up' : 'down'">
              {{ fmtPct(m.pct, 2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.lb-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.lb-head h3 {
  margin: 0;
}

.lb-select {
  width: 220px;
}

.lb-table-wrap {
  max-height: 320px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.align-right {
  text-align: right;
}

.mono {
  font-family: var(--mono-font);
}

.muted {
  color: var(--muted);
}

.up {
  color: var(--up);
}

.down {
  color: var(--down);
}
</style>
