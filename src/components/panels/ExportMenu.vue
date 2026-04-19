<script setup lang="ts">
import { ref } from 'vue';
import type { Calendar, ExchangeData, PriceType } from '@/types';
import { CURRENCY_BY_CODE } from '@/constants/currencies';
import { findIndexAtOrBefore } from '@/services/exchange-rates';
import { isoToJalali } from '@/utils/date';
import { useOnClickOutside } from '@/composables/useResizeObserver';

const props = defineProps<{
  data: ExchangeData;
  codes: string[];
  priceType: PriceType;
  rangeStart: string;
  rangeEnd: string;
  calendar: Calendar;
}>();

const emit = defineEmits<{
  (e: 'share'): void;
  (e: 'toast', msg: string): void;
}>();

const open = ref(false);
const wrap = ref<HTMLElement | null>(null);
useOnClickOutside(wrap, () => (open.value = false));

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

type Row = (string | number)[];

function buildRows(): Row[] {
  const i0 = findIndexAtOrBefore(props.data.dates, props.rangeStart);
  const i1 = findIndexAtOrBefore(props.data.dates, props.rangeEnd);
  const rows: Row[] = [];
  const header: string[] = ['date', ...props.codes.map((c) => c.toUpperCase())];
  if (props.calendar === 'jalali') header.splice(1, 0, 'jalali');
  rows.push(header);
  for (let i = i0; i <= i1; i++) {
    const d = props.data.dates[i];
    const row: Row = [d];
    if (props.calendar === 'jalali') row.push(isoToJalali(d));
    for (const code of props.codes) {
      const meta = CURRENCY_BY_CODE[code];
      const s = props.data.series[code];
      const v =
        (props.priceType === 'sell'
          ? s.sell[i]
          : props.priceType === 'mid'
            ? (s.sell[i] + s.buy[i]) / 2
            : s.buy[i]) / (meta?.scale || 1);
      row.push(isFinite(v) ? Math.round(v) : '');
    }
    rows.push(row);
  }
  return rows;
}

function exportCSV() {
  const rows = buildRows();
  const csv = rows
    .map((r) =>
      r
        .map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v))
        .join(','),
    )
    .join('\n');
  download(
    `rial-rates-${props.rangeStart}-to-${props.rangeEnd}.csv`,
    new Blob([csv], { type: 'text/csv' }),
  );
  emit('toast', 'CSV exported');
}

function exportJSON() {
  const rows = buildRows();
  const header = rows[0] as string[];
  const obj = rows
    .slice(1)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
  download(
    `rial-rates-${props.rangeStart}-to-${props.rangeEnd}.json`,
    new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }),
  );
  emit('toast', 'JSON exported');
}

function exportTSV() {
  const rows = buildRows();
  const tsv = rows.map((r) => r.join('\t')).join('\n');
  download(
    `rial-rates-${props.rangeStart}-to-${props.rangeEnd}.xls`,
    new Blob([tsv], { type: 'application/vnd.ms-excel' }),
  );
  emit('toast', 'Excel (TSV) exported');
}

function exportSVG() {
  const svg = document.getElementById('main-chart-svg') as SVGSVGElement | null;
  if (!svg) return;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const source = new XMLSerializer().serializeToString(clone);
  download(
    `rial-chart-${props.rangeStart}-to-${props.rangeEnd}.svg`,
    new Blob([source], { type: 'image/svg+xml' }),
  );
  emit('toast', 'SVG exported');
}

function exportPNG() {
  const svg = document.getElementById('main-chart-svg') as SVGSVGElement | null;
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const src = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  const blob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((b) => {
      if (b) {
        download(`rial-chart-${props.rangeStart}-to-${props.rangeEnd}.png`, b);
        emit('toast', 'PNG exported');
      }
      URL.revokeObjectURL(url);
    }, 'image/png');
  };
  img.src = url;
}

function handleShare() {
  emit('share');
}

interface Item {
  label: string;
  sub: string;
  onClick: () => void;
  group: 'data' | 'chart' | 'share';
}

const items: Item[] = [
  { label: 'CSV', sub: 'comma-separated', onClick: exportCSV, group: 'data' },
  { label: 'JSON', sub: 'structured', onClick: exportJSON, group: 'data' },
  {
    label: 'Excel',
    sub: 'tab-separated xls',
    onClick: exportTSV,
    group: 'data',
  },
  { label: 'PNG', sub: '2× raster image', onClick: exportPNG, group: 'chart' },
  { label: 'SVG', sub: 'vector', onClick: exportSVG, group: 'chart' },
  {
    label: 'Copy link',
    sub: 'share current view',
    onClick: handleShare,
    group: 'share',
  },
];

const groups: { id: 'data' | 'chart' | 'share'; label: string }[] = [
  { id: 'data', label: 'Data' },
  { id: 'chart', label: 'Chart' },
  { id: 'share', label: 'Share' },
];

function run(it: Item) {
  it.onClick();
  open.value = false;
}
</script>

<template>
  <div ref="wrap" class="export-wrap">
    <button type="button" class="export-trigger" @click="open = !open">
      <span>Export</span>
      <span class="caret">▾</span>
    </button>
    <div v-if="open" class="export-menu">
      <template v-for="(g, gi) in groups" :key="g.id">
        <div v-if="gi > 0" class="export-divider" />
        <div class="export-group-label">{{ g.label }}</div>
        <button
          v-for="it in items.filter((x) => x.group === g.id)"
          :key="it.label"
          type="button"
          class="export-item"
          @click="run(it)"
        >
          <span>{{ it.label }}</span>
          <span class="export-sub">{{ it.sub }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.export-wrap {
  position: relative;
}

.export-trigger {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: var(--ui-font);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition:
    border-color 0.15s,
    color 0.15s;
}

.export-trigger:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.caret {
  font-size: 10px;
  opacity: 0.7;
}

.export-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 50;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px;
  min-width: 200px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.export-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

.export-group-label {
  padding: 4px 10px;
  font-family: var(--mono-font);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.export-item {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  color: var(--fg);
  padding: 8px 10px;
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
  font-family: var(--ui-font);
  font-size: 13px;
  transition: background 0.12s;
}

.export-item:hover {
  background: rgba(127, 127, 127, 0.12);
}

.export-sub {
  font-family: var(--mono-font);
  font-size: 10px;
  color: var(--muted);
}
</style>
