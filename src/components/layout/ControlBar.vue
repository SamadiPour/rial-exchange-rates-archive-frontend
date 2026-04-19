<script setup lang="ts">
import type {
  Calendar,
  ExchangeData,
  Mode,
  PresetId,
  Scale,
  Theme,
} from '@/types';
import { CURRENCIES, colorFor } from '@/constants/currencies';
import { RANGE_PRESETS } from '@/constants/presets';
import DatePicker from '@/components/controls/DatePicker.vue';

defineProps<{
  data: ExchangeData;
  codes: string[];
  preset: PresetId;
  customStart: string;
  customEnd: string;
  rangeStart: string;
  rangeEnd: string;
  scale: Scale;
  mode: Mode;
  calendar: Calendar;
  showAnnos: boolean;
  theme: Theme;
}>();

const emit = defineEmits<{
  (e: 'update:preset', v: PresetId): void;
  (e: 'update:customStart', v: string): void;
  (e: 'update:customEnd', v: string): void;
  (e: 'update:scale', v: Scale): void;
  (e: 'update:mode', v: Mode): void;
  (e: 'update:calendar', v: Calendar): void;
  (e: 'update:showAnnos', v: boolean): void;
  (e: 'toggleCode', code: string): void;
}>();

function setScale(s: Scale, mode: Mode) {
  if (s === 'log' && mode === 'roi') return;
  emit('update:scale', s);
}

function setMode(m: Mode, currentScale: Scale) {
  emit('update:mode', m);
  if (m === 'roi' && currentScale === 'log') emit('update:scale', 'linear');
}
</script>

<template>
  <section class="controls">
    <div class="control-row">
      <div class="control-label">Range</div>
      <div class="btn-group">
        <button
          v-for="p in RANGE_PRESETS"
          :key="p.id"
          class="chip"
          :class="{ active: preset === p.id }"
          @click="$emit('update:preset', p.id)"
        >
          {{ p.label }}
        </button>
      </div>
      <div v-if="preset === 'custom'" class="custom-range">
        <DatePicker
          :model-value="customStart || rangeStart"
          :min="data.dates[0]"
          :max="data.dates[data.dates.length - 1]"
          :calendar="calendar"
          compact
          @update:model-value="$emit('update:customStart', $event)"
        />
        <span class="muted">→</span>
        <DatePicker
          :model-value="customEnd || rangeEnd"
          :min="data.dates[0]"
          :max="data.dates[data.dates.length - 1]"
          :calendar="calendar"
          compact
          @update:model-value="$emit('update:customEnd', $event)"
        />
      </div>
    </div>

    <div class="control-row">
      <div class="ctrl-group">
        <div class="control-label">Scale</div>
        <div class="btn-group">
          <button
            v-for="s in ['linear', 'log'] as const"
            :key="s"
            class="chip"
            :class="{ active: scale === s }"
            :disabled="mode === 'roi' && s === 'log'"
            @click="setScale(s, mode)"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <div class="ctrl-group">
        <div class="control-label">Mode</div>
        <div class="btn-group">
          <button
            class="chip"
            :class="{ active: mode === 'absolute' }"
            @click="setMode('absolute', scale)"
          >
            Toman
          </button>
          <button
            class="chip"
            :class="{ active: mode === 'indexed' }"
            @click="setMode('indexed', scale)"
          >
            Indexed
          </button>
          <button
            class="chip"
            :class="{ active: mode === 'roi' }"
            @click="setMode('roi', scale)"
          >
            ROI %
          </button>
        </div>
      </div>

      <div class="ctrl-group">
        <div class="control-label">Cal.</div>
        <div class="btn-group">
          <button
            class="chip"
            :class="{ active: calendar === 'gregorian' }"
            @click="$emit('update:calendar', 'gregorian')"
          >
            Gregorian
          </button>
          <button
            class="chip"
            :class="{ active: calendar === 'jalali' }"
            @click="$emit('update:calendar', 'jalali')"
          >
            Jalali
          </button>
        </div>
      </div>

      <div class="btn-group">
        <button
          class="chip"
          :class="{ active: showAnnos }"
          title="Toggle historical event annotations"
          @click="$emit('update:showAnnos', !showAnnos)"
        >
          Events {{ showAnnos ? '●' : '○' }}
        </button>
      </div>
    </div>

    <div class="currency-chips">
      <button
        v-for="c in CURRENCIES"
        :key="c.code"
        class="cur-chip"
        :class="{ active: codes.includes(c.code) }"
        :style="
          codes.includes(c.code)
            ? {
                borderColor: colorFor(c.code, theme === 'dark'),
                color: colorFor(c.code, theme === 'dark'),
              }
            : {}
        "
        @click="$emit('toggleCode', c.code)"
      >
        <span class="flag">{{ c.flag }}</span>
        <span>{{ c.code.toUpperCase() }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.controls {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid var(--border);
}

.control-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.control-label {
  font-family: var(--mono-font);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.ctrl-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.custom-range {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.muted {
  color: var(--muted);
}

.currency-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cur-chip {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 5px 9px;
  border-radius: 5px;
  font-family: var(--mono-font);
  font-size: 11.5px;
  cursor: pointer;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  letter-spacing: 0.04em;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.cur-chip:hover {
  color: var(--fg);
}

.cur-chip.active {
  color: var(--fg);
}

.flag {
  font-size: 11px;
}
</style>
