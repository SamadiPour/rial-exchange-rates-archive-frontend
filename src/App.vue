<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { ExchangeData } from '@/types';
import { CURRENCIES } from '@/constants/currencies';
import { RANGE_PRESETS } from '@/constants/presets';
import { loadExchangeData, rateAt } from '@/services/exchange-rates';
import { fmtDate, shiftDate } from '@/utils/date';
import { useTheme } from '@/composables/useTheme';
import { useUrlState } from '@/composables/useUrlState';
import { useToast } from '@/composables/useToast';
import TopBar from '@/components/layout/TopBar.vue';
import ControlBar from '@/components/layout/ControlBar.vue';
import LoadingScreen from '@/components/layout/LoadingScreen.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import LineChart from '@/components/chart/LineChart.vue';
import ExportMenu from '@/components/panels/ExportMenu.vue';
import Stats from '@/components/panels/Stats.vue';
import Converter from '@/components/panels/Converter.vue';
import ROI from '@/components/panels/ROI.vue';
import Leaderboard from '@/components/panels/Leaderboard.vue';

const { theme, toggleTheme } = useTheme();
const { state, toggleCode } = useUrlState();
const { toast, show } = useToast();

const data = ref<ExchangeData | null>(null);
const err = ref<string | null>(null);

const activeTab = ref<'convert' | 'roi' | 'leaderboard'>('convert');

onMounted(async () => {
  try {
    data.value = await loadExchangeData();
  } catch (e) {
    err.value = String(e);
  }
});

const range = computed(() => {
  if (!data.value) return { rangeStart: '2012-10-09', rangeEnd: '2024-01-01' };
  const last = data.value.dates[data.value.dates.length - 1];
  const first = data.value.dates[0];
  if (state.preset === 'all') return { rangeStart: first, rangeEnd: last };
  if (state.preset === 'custom') {
    return {
      rangeStart: state.customStart || shiftDate(last, -365),
      rangeEnd: state.customEnd || last,
    };
  }
  const p = RANGE_PRESETS.find((r) => r.id === state.preset);
  return { rangeStart: shiftDate(last, -(p?.days || 365)), rangeEnd: last };
});

const lastUsd = computed(() => {
  if (!data.value) return NaN;
  return rateAt(
    data.value,
    'usd',
    data.value.dates.length - 1,
    state.priceType,
  );
});

const lastDate = computed(() => {
  if (!data.value) return '';
  return data.value.dates[data.value.dates.length - 1];
});

const effectiveCodes = computed(() =>
  state.codes.length ? state.codes : ['usd'],
);

const chartHeight = ref(window.innerWidth < 720 ? 320 : 460);

function handleShare() {
  navigator.clipboard
    .writeText(location.href)
    .then(() => show('Link copied to clipboard'))
    .catch(() => show('Could not copy link'));
}

window.addEventListener('resize', () => {
  chartHeight.value = window.innerWidth < 720 ? 320 : 460;
});

// Make findIndexAtOrBefore callable from template (for chart annotations guard).
// (Exported for template via `defineExpose`-less setup - just reference directly.)
</script>

<template>
  <LoadingScreen v-if="!data && !err" />
  <div v-else-if="err" class="error-view">Failed to load data: {{ err }}</div>
  <div v-else-if="data" class="app">
    <TopBar
      :theme="theme"
      :last-date="lastDate"
      :last-usd="lastUsd"
      @toggle-theme="toggleTheme"
    />

    <ControlBar
      :data="data"
      :codes="state.codes"
      :preset="state.preset"
      :custom-start="state.customStart"
      :custom-end="state.customEnd"
      :range-start="range.rangeStart"
      :range-end="range.rangeEnd"
      :scale="state.scale"
      :mode="state.mode"
      :calendar="state.calendar"
      :show-annos="state.showAnnos"
      :theme="theme"
      @update:preset="state.preset = $event"
      @update:custom-start="state.customStart = $event"
      @update:custom-end="state.customEnd = $event"
      @update:scale="state.scale = $event"
      @update:mode="state.mode = $event"
      @update:calendar="state.calendar = $event"
      @update:show-annos="state.showAnnos = $event"
      @toggle-code="toggleCode"
    />

    <section class="chart-section">
      <div class="panel chart-panel">
        <div class="chart-head">
          <div class="mono-tiny chart-range">
            {{ fmtDate(range.rangeStart, state.calendar) }} —
            {{ fmtDate(range.rangeEnd, state.calendar) }}
            <template v-if="state.mode === 'indexed'"> · indexed</template>
            <template v-if="state.mode === 'roi'"> · ROI %</template>
          </div>
          <ExportMenu
            :data="data"
            :codes="state.codes"
            :price-type="state.priceType"
            :range-start="range.rangeStart"
            :range-end="range.rangeEnd"
            :calendar="state.calendar"
            @share="handleShare"
            @toast="show"
          />
        </div>
        <LineChart
          :data="data"
          :codes="state.codes"
          :price-type="state.priceType"
          :range-start="range.rangeStart"
          :range-end="range.rangeEnd"
          :scale="state.scale"
          :calendar="state.calendar"
          :mode="state.mode"
          :show-annotations="state.showAnnos"
          :theme="theme"
          :height="chartHeight"
        />
      </div>
    </section>

    <section class="stats-section">
      <Stats
        :data="data"
        :codes="effectiveCodes"
        :price-type="state.priceType"
        :range-start="range.rangeStart"
        :range-end="range.rangeEnd"
      />
    </section>

    <section class="tools-section">
      <div class="tabs">
        <button
          v-for="t in [
            { id: 'convert', label: 'Converter' },
            { id: 'roi', label: 'ROI simulator' },
            { id: 'leaderboard', label: 'Biggest moves' },
          ] as const"
          :key="t.id"
          class="tab"
          :class="{ active: activeTab === t.id }"
          @click="activeTab = t.id"
        >
          {{ t.label }}
        </button>
      </div>
      <div class="tab-body">
        <Converter
          v-if="activeTab === 'convert'"
          :data="data"
          :price-type="state.priceType"
          :calendar="state.calendar"
        />
        <ROI
          v-else-if="activeTab === 'roi'"
          :data="data"
          :price-type="state.priceType"
          :calendar="state.calendar"
        />
        <Leaderboard
          v-else
          :data="data"
          :price-type="state.priceType"
          :range-start="range.rangeStart"
          :range-end="range.rangeEnd"
        />
      </div>
    </section>

    <AppFooter
      :total-days="data.dates.length"
      :total-currencies="CURRENCIES.length"
    />

    <Transition name="toast-fade">
      <div v-if="toast" class="toast">
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.error-view {
  padding: 40px;
  font-family: var(--ui-font);
  color: var(--fg);
}

.chart-panel {
  padding: 14px;
}

.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-range {
  color: var(--muted);
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.tab {
  background: transparent;
  border: none;
  color: var(--muted);
  font-family: var(--ui-font);
  font-size: 14px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.tab.active {
  color: var(--fg);
  border-bottom-color: var(--accent);
}

.tab:hover:not(.active) {
  color: var(--fg);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

@media (max-width: 720px) {
  .tab {
    font-size: 13px;
    padding: 8px 10px;
  }
}
</style>
