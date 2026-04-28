<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Calendar, ExchangeData, PriceType } from '@/types';
import { CURRENCIES, COINS, TOMAN } from '@/constants/currencies';
import { findIndexAtOrBefore, rateAt } from '@/services/exchange-rates';
import { fmtNumberPretty } from '@/utils/format';
import CurrencySelect from '@/components/controls/CurrencySelect.vue';
import DatePicker from '@/components/controls/DatePicker.vue';
import NumberInput from '@/components/controls/NumberInput.vue';

const props = defineProps<{
  data: ExchangeData;
  priceType: PriceType;
  calendar: Calendar;
}>();

const amount = ref(1000000);
const from = ref('irr');
const to = ref('usd');
const iso = ref(props.data.dates[props.data.dates.length - 1]);

const idx = computed(() => findIndexAtOrBefore(props.data.dates, iso.value));

const result = computed(() => {
  const fromToman =
    from.value === 'irr'
      ? 1
      : rateAt(props.data, from.value, idx.value, props.priceType);
  const toToman =
    to.value === 'irr'
      ? 1
      : rateAt(props.data, to.value, idx.value, props.priceType);
  return (amount.value * fromToman) / toToman;
});

const options = computed(() => [TOMAN, ...CURRENCIES, ...COINS]);

watch(from, (val, oldVal) => {
  if (val === to.value) to.value = oldVal;
});

watch(to, (val, oldVal) => {
  if (val === from.value) from.value = oldVal;
});
</script>

<template>
  <div class="panel">
    <h3>Historical converter</h3>
    <div class="conv-grid">
      <div>
        <label>Amount</label>
        <NumberInput v-model="amount" />
        <div class="conv-cur">
          <CurrencySelect v-model="from" :options="options" />
        </div>
      </div>
      <div class="conv-arrow">→</div>
      <div>
        <label>Gets you</label>
        <div class="conv-result num">
          {{ fmtNumberPretty(result, 2) }}
        </div>
        <div class="conv-cur">
          <CurrencySelect v-model="to" :options="options" />
        </div>
      </div>
    </div>
    <div class="conv-date-row">
      <label class="conv-date-label">On date</label>
      <DatePicker
        v-model="iso"
        :min="data.dates[0]"
        :max="data.dates[data.dates.length - 1]"
        :calendar="calendar"
      />
    </div>
  </div>
</template>

<style scoped>
.conv-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: end;
}

.conv-arrow {
  font-size: 22px;
  padding-bottom: 26px;
  opacity: 0.6;
  color: var(--muted);
}

.conv-cur {
  margin-top: 6px;
}

.conv-result {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  padding: 8px 10px;
  border-radius: 6px;
  font-family: var(--mono-font);
  font-size: 15px;
  outline: none;
  width: 100%;
  min-height: 36px;
  font-variant-numeric: tabular-nums;
}

.conv-date-row {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.conv-date-label {
  margin: 0 !important;
}

@media (max-width: 520px) {
  .conv-grid {
    grid-template-columns: 1fr;
  }
  .conv-arrow {
    display: none;
  }
}
</style>
