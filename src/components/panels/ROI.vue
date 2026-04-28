<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Calendar, ExchangeData, PriceType } from '@/types';
import { ALL_CURRENCIES } from '@/constants/currencies';
import { findIndexAtOrBefore, rateAt } from '@/services/exchange-rates';
import { fmtPct, fmtToman } from '@/utils/format';
import DatePicker from '@/components/controls/DatePicker.vue';
import NumberInput from '@/components/controls/NumberInput.vue';

const props = defineProps<{
  data: ExchangeData;
  priceType: PriceType;
  calendar: Calendar;
}>();

const startISO = ref(
  props.data.dates[Math.max(0, props.data.dates.length - 365 * 3)],
);
const endISO = ref(props.data.dates[props.data.dates.length - 1]);
const amount = ref(100000000);

interface RoiRow {
  code: string;
  flag: string;
  endToman: number;
  roi: number;
  cagr: number;
}

const rows = computed<RoiRow[]>(() => {
  const i0 = findIndexAtOrBefore(props.data.dates, startISO.value);
  const i1 = findIndexAtOrBefore(props.data.dates, endISO.value);
  const years = Math.max(0.01, (i1 - i0) / 365.25);

  const out = ALL_CURRENCIES.map((c) => {
    const r0 = rateAt(props.data, c.code, i0, props.priceType);
    const r1 = rateAt(props.data, c.code, i1, props.priceType);
    if (!isFinite(r0) || !isFinite(r1) || r0 <= 0) return null;
    const units = amount.value / r0;
    const endToman = units * r1;
    const roi = ((endToman - amount.value) / amount.value) * 100;
    const cagr = (Math.pow(endToman / amount.value, 1 / years) - 1) * 100;
    return { code: c.code, flag: c.flag, endToman, roi, cagr };
  }).filter((r): r is RoiRow => r != null);

  out.sort((a, b) => b.roi - a.roi);
  return out;
});
</script>

<template>
  <div class="panel">
    <h3>ROI simulator</h3>
    <p class="roi-desc">
      If you'd converted Toman into each currency and held it, what would it be
      worth in Toman today?
    </p>
    <div class="roi-inputs">
      <div class="roi-input-group">
        <label>Amount (Toman)</label>
        <NumberInput v-model="amount" />
      </div>
      <div class="roi-input-group">
        <label>Buy on</label>
        <DatePicker
          v-model="startISO"
          :min="data.dates[0]"
          :max="data.dates[data.dates.length - 1]"
          :calendar="calendar"
          fill
        />
      </div>
      <div class="roi-input-group">
        <label>Valued on</label>
        <DatePicker
          v-model="endISO"
          :min="data.dates[0]"
          :max="data.dates[data.dates.length - 1]"
          :calendar="calendar"
          fill
        />
      </div>
    </div>
    <div class="roi-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Asset</th>
            <th class="align-right">Value now</th>
            <th class="align-right">ROI</th>
            <th class="align-right">CAGR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in rows" :key="r.code">
            <td class="muted">{{ i + 1 }}</td>
            <td>{{ r.flag }} {{ r.code.toUpperCase() }}</td>
            <td class="align-right num">{{ fmtToman(r.endToman) }}</td>
            <td class="align-right" :class="r.roi >= 0 ? 'up' : 'down'">
              {{ fmtPct(r.roi, 1) }}
            </td>
            <td class="align-right" :class="r.cagr >= 0 ? 'up' : 'down'">
              {{ fmtPct(r.cagr, 1) }}
            </td>
          </tr>
          <tr class="hold-row">
            <td />
            <td>🇮🇷 Held in Toman</td>
            <td class="align-right num">{{ fmtToman(amount) }}</td>
            <td class="align-right">—</td>
            <td class="align-right">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.roi-desc {
  color: var(--muted);
  font-size: 12px;
  margin: 0 0 10px;
}

.roi-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.roi-input-group {
  flex: 1 1 160px;
  min-width: 140px;
}

.roi-table-wrap {
  max-height: 340px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.hold-row {
  border-top: 1px solid var(--border);
  background: var(--bg-soft);
}
</style>
