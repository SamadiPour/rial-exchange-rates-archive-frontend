<script setup lang="ts">
import { computed, ref } from 'vue';
import type {
  Calendar,
  ExchangeData,
  Mode,
  PriceType,
  Scale,
  Theme,
} from '@/types';
import { CURRENCY_BY_CODE, colorFor } from '@/constants/currencies';
import { ANNOTATIONS } from '@/constants/annotations';
import { findIndexAtOrBefore, priceOf } from '@/services/exchange-rates';
import { isoToJalali } from '@/utils/date';
import { fmtToman } from '@/utils/format';
import { useElementWidth } from '@/composables/useElementWidth';

const props = defineProps<{
  data: ExchangeData;
  codes: string[];
  priceType: PriceType;
  rangeStart: string;
  rangeEnd: string;
  scale: Scale;
  calendar: Calendar;
  mode: Mode;
  showAnnotations: boolean;
  theme: Theme;
  height?: number;
}>();

const wrap = ref<HTMLElement | null>(null);
const w = useElementWidth(wrap, 900);

const height = computed(() => props.height ?? 460);
const isDark = computed(() => props.theme === 'dark');

const colors = computed(() => ({
  bg: isDark.value ? '#0d1117' : '#fafaf7',
  grid: isDark.value ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
  axis: isDark.value ? 'rgba(232,237,243,0.45)' : 'rgba(0,0,0,0.55)',
  label: isDark.value ? 'rgba(232,237,243,0.7)' : 'rgba(0,0,0,0.75)',
  crosshair: isDark.value ? 'rgba(232,237,243,0.25)' : 'rgba(0,0,0,0.35)',
  tooltipBg: isDark.value ? 'rgba(22,27,34,0.97)' : 'rgba(255,255,255,0.98)',
  tooltipBorder: isDark.value ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
  tooltipText: isDark.value ? '#eee' : '#111',
}));

const padL = 64;
const padR = 16;
const padT = 20;
const padB = 40;

const innerW = computed(() => w.value - padL - padR);
const innerH = computed(() => height.value - padT - padB);

const i0 = computed(() =>
  Math.max(0, findIndexAtOrBefore(props.data.dates, props.rangeStart)),
);
const i1 = computed(() =>
  Math.max(i0.value, findIndexAtOrBefore(props.data.dates, props.rangeEnd)),
);

interface Series {
  code: string;
  vals: number[];
}

const slice = computed<Series[]>(() => {
  const out: Series[] = [];
  for (const code of props.codes) {
    if (!props.data.series[code]) continue;
    const pick = priceOf(props.data, code, props.priceType);
    const vals = new Array<number>(i1.value - i0.value + 1);
    for (let i = i0.value; i <= i1.value; i++) {
      vals[i - i0.value] = pick(i);
    }
    out.push({ code, vals });
  }
  return out;
});

const displaySeries = computed<Series[]>(() => {
  if (props.mode === 'indexed') {
    return slice.value.map((s) => {
      const base = s.vals.find((v) => isFinite(v) && v > 0);
      return {
        code: s.code,
        vals: s.vals.map((v) => (isFinite(v) && base ? (v / base) * 100 : NaN)),
      };
    });
  }
  if (props.mode === 'roi') {
    return slice.value.map((s) => {
      const base = s.vals.find((v) => isFinite(v) && v > 0);
      return {
        code: s.code,
        vals: s.vals.map((v) =>
          isFinite(v) && base ? (v / base - 1) * 100 : NaN,
        ),
      };
    });
  }
  return slice.value;
});

const yExtent = computed(() => {
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const s of displaySeries.value) {
    for (const v of s.vals) {
      if (!isFinite(v)) continue;
      if (v < yMin) yMin = v;
      if (v > yMax) yMax = v;
    }
  }
  if (!isFinite(yMin) || !isFinite(yMax)) {
    yMin = 0;
    yMax = 1;
  }
  if (yMin === yMax) {
    yMin *= 0.98;
    yMax *= 1.02;
  }
  if (props.scale === 'log') yMin = Math.max(yMin, 1e-6);
  return { yMin, yMax };
});

function yMap(v: number): number | null {
  if (!isFinite(v)) return null;
  const { yMin, yMax } = yExtent.value;
  if (props.scale === 'log') {
    const l0 = Math.log10(yMin);
    const l1 = Math.log10(yMax);
    return (
      padT + innerH.value - ((Math.log10(v) - l0) / (l1 - l0)) * innerH.value
    );
  }
  return padT + innerH.value - ((v - yMin) / (yMax - yMin)) * innerH.value;
}

const n = computed(() => i1.value - i0.value + 1);

function xMap(idx: number): number {
  if (n.value === 1) return padL + innerW.value / 2;
  return padL + (idx / (n.value - 1)) * innerW.value;
}

const paths = computed(() =>
  displaySeries.value.map((s) => {
    let d = '';
    let started = false;
    for (let i = 0; i < s.vals.length; i++) {
      const v = s.vals[i];
      const y = yMap(v);
      if (y == null) {
        started = false;
        continue;
      }
      const x = xMap(i);
      d += (started ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
      started = true;
    }
    return { code: s.code, d };
  }),
);

const yTicks = computed(() => {
  const out: number[] = [];
  const { yMin, yMax } = yExtent.value;
  if (props.scale === 'log') {
    const l0 = Math.ceil(Math.log10(yMin));
    const l1 = Math.floor(Math.log10(yMax));
    for (let p = l0; p <= l1; p++) out.push(Math.pow(10, p));
    if (out.length < 2) {
      for (let k = 1; k <= 5; k++) out.push(yMin + ((yMax - yMin) * k) / 5);
    }
  } else {
    for (let k = 0; k <= 5; k++) out.push(yMin + ((yMax - yMin) * k) / 5);
  }
  return out;
});

const xTickCount = computed(() =>
  Math.max(3, Math.min(8, Math.floor(innerW.value / 110))),
);

const xTicks = computed(() => {
  const out: number[] = [];
  for (let k = 0; k < xTickCount.value; k++) {
    const idx = Math.round((k / (xTickCount.value - 1)) * (n.value - 1));
    out.push(idx);
  }
  return out;
});

function xTickLabel(idx: number): string {
  const d = props.data.dates[i0.value + idx];
  return props.calendar === 'jalali'
    ? isoToJalali(d).slice(0, 7)
    : d.slice(0, 7);
}

function xTickAnchor(i: number): 'start' | 'middle' | 'end' {
  if (i === 0) return 'start';
  if (i === xTicks.value.length - 1) return 'end';
  return 'middle';
}

interface VisibleAnno {
  label: string;
  color: string;
  x: number;
}

const visibleAnnos = computed<VisibleAnno[]>(() => {
  if (!props.showAnnotations) return [];
  const out: VisibleAnno[] = [];
  for (const a of ANNOTATIONS) {
    if (a.date < props.rangeStart || a.date > props.rangeEnd) continue;
    const idx = findIndexAtOrBefore(props.data.dates, a.date) - i0.value;
    if (idx < 0 || idx >= n.value) continue;
    out.push({ label: a.label, color: a.color, x: xMap(idx) });
  }
  return out;
});

function fmtY(v: number): string {
  if (props.mode === 'roi') return (v >= 0 ? '+' : '') + v.toFixed(0) + '%';
  if (props.mode === 'indexed') return v.toFixed(0);
  if (v >= 1000) return (v / 1000).toFixed(v >= 1e4 ? 0 : 1) + 'K';
  return v.toFixed(0);
}

// Hover state
const hover = ref<number | null>(null);

function onMove(e: MouseEvent) {
  const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const frac = (mx - padL) / innerW.value;
  const idx = Math.round(frac * (n.value - 1));
  if (idx >= 0 && idx < n.value) hover.value = idx;
  else hover.value = null;
}

function onLeave() {
  hover.value = null;
}

interface TooltipBits {
  top: number;
  side: 'left' | 'right';
  offset: number;
  iso: string;
  dateLbl: string;
}

const tooltipBits = computed<TooltipBits | null>(() => {
  if (hover.value == null) return null;
  const iso = props.data.dates[i0.value + hover.value];
  const dateLbl =
    props.calendar === 'jalali' ? `${isoToJalali(iso)} (${iso})` : iso;
  const x = xMap(hover.value);
  const leftSide = x > w.value * 0.6;
  return {
    top: padT + 8,
    side: leftSide ? 'right' : 'left',
    offset: Math.max(8, leftSide ? w.value - x + 12 : x + 12),
    iso,
    dateLbl,
  };
});

function hoverDotY(vals: number[]): number | null {
  if (hover.value == null) return null;
  return yMap(vals[hover.value]);
}

function hoverValText(code: string): string {
  if (hover.value == null) return '—';
  const s = displaySeries.value.find((ds) => ds.code === code);
  if (!s) return '—';
  const v = s.vals[hover.value];
  if (props.mode === 'roi') {
    return isFinite(v) ? (v >= 0 ? '+' : '') + v.toFixed(2) + '%' : '—';
  }
  if (props.mode === 'indexed') return isFinite(v) ? v.toFixed(1) : '—';
  return fmtToman(v);
}
</script>

<template>
  <div ref="wrap" class="chart-wrap">
    <svg
      id="main-chart-svg"
      :width="w"
      :height="height"
      :viewBox="`0 0 ${w} ${height}`"
      class="chart-svg"
      :style="{ background: colors.bg }"
      @mousemove="onMove"
      @mouseleave="onLeave"
    >
      <!-- y grid + labels -->
      <g v-for="(v, i) in yTicks" :key="'yt' + i">
        <template v-if="yMap(v) != null">
          <line
            :x1="padL"
            :x2="padL + innerW"
            :y1="yMap(v) as number"
            :y2="yMap(v) as number"
            :stroke="colors.grid"
          />
          <text
            :x="padL - 8"
            :y="(yMap(v) as number) + 4"
            :fill="colors.label"
            font-size="10.5"
            text-anchor="end"
            font-family="'JetBrains Mono', monospace"
          >
            {{ fmtY(v) }}
          </text>
        </template>
      </g>

      <!-- x grid + labels -->
      <g v-for="(idx, i) in xTicks" :key="'xt' + i">
        <line
          :x1="xMap(idx)"
          :x2="xMap(idx)"
          :y1="padT"
          :y2="padT + innerH"
          :stroke="colors.grid"
        />
        <text
          :x="xMap(idx)"
          :y="padT + innerH + 18"
          :fill="colors.label"
          font-size="10.5"
          :text-anchor="xTickAnchor(i)"
          font-family="'JetBrains Mono', monospace"
        >
          {{ xTickLabel(idx) }}
        </text>
      </g>

      <!-- Annotations -->
      <g v-for="(a, i) in visibleAnnos" :key="'an' + i" opacity="0.75">
        <line
          :x1="a.x"
          :x2="a.x"
          :y1="padT"
          :y2="padT + innerH"
          :stroke="a.color"
          stroke-dasharray="3 3"
          stroke-width="1"
        />
        <text
          :x="a.x + 4"
          :y="padT + 10"
          :fill="a.color"
          font-size="10"
          font-family="'JetBrains Mono', monospace"
        >
          {{ a.label }}
        </text>
      </g>

      <!-- Series lines -->
      <path
        v-for="p in paths"
        :key="p.code"
        :d="p.d"
        fill="none"
        :stroke="colorFor(p.code, isDark)"
        stroke-width="1.6"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- Axes -->
      <line
        :x1="padL"
        :x2="padL + innerW"
        :y1="padT + innerH"
        :y2="padT + innerH"
        :stroke="colors.axis"
      />
      <line
        :x1="padL"
        :x2="padL"
        :y1="padT"
        :y2="padT + innerH"
        :stroke="colors.axis"
      />

      <!-- Crosshair -->
      <g v-if="hover != null">
        <line
          :x1="xMap(hover)"
          :x2="xMap(hover)"
          :y1="padT"
          :y2="padT + innerH"
          :stroke="colors.crosshair"
          stroke-dasharray="2 3"
        />
        <template v-for="s in displaySeries" :key="'dot' + s.code">
          <circle
            v-if="hoverDotY(s.vals) != null"
            :cx="xMap(hover)"
            :cy="hoverDotY(s.vals) as number"
            r="3"
            :fill="colorFor(s.code, isDark)"
            :stroke="colors.bg"
            stroke-width="1.5"
          />
        </template>
      </g>
    </svg>

    <!-- Tooltip -->
    <div
      v-if="tooltipBits"
      class="tooltip"
      :style="{
        top: tooltipBits.top + 'px',
        [tooltipBits.side]: tooltipBits.offset + 'px',
        background: colors.tooltipBg,
        color: colors.tooltipText,
        border: `1px solid ${colors.tooltipBorder}`,
      }"
    >
      <div class="tooltip-date">{{ tooltipBits.dateLbl }}</div>
      <div v-for="s in displaySeries" :key="s.code" class="tooltip-row">
        <span class="tooltip-label">
          <span
            class="swatch"
            :style="{ background: colorFor(s.code, isDark) }"
          />
          {{ CURRENCY_BY_CODE[s.code]?.flag }} {{ s.code.toUpperCase() }}
        </span>
        <span class="tooltip-val num">{{ hoverValText(s.code) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-wrap {
  width: 100%;
  position: relative;
}

.chart-svg {
  display: block;
  border-radius: 8px;
  font-family: var(--ui-font);
}

.tooltip {
  position: absolute;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  font-family: var(--mono-font);
  pointer-events: none;
  min-width: 180px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
  z-index: 5;
}

.tooltip-date {
  opacity: 0.7;
  margin-bottom: 6px;
  font-size: 11px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 2px 0;
}

.tooltip-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tooltip-val {
  font-variant-numeric: tabular-nums;
}

.swatch {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  display: inline-block;
}
</style>
