<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import type { Calendar } from '@/types';
import {
  GREGORIAN_MONTH_NAMES,
  JALALI_MONTH_NAMES,
  clampISO,
  gregorianDaysInMonth,
  isoToJalali,
  jalaliDaysInMonth,
  jalaliToGregorian,
} from '@/utils/date';
import { useOnClickOutside } from '@/composables/useResizeObserver';

const props = defineProps<{
  modelValue: string;
  min: string;
  max: string;
  calendar?: Calendar;
  fill?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
}>();

const calendar = computed<Calendar>(() => props.calendar ?? 'gregorian');
const isJalali = computed(() => calendar.value === 'jalali');

const open = ref(false);
const wrap = ref<HTMLElement | null>(null);
useOnClickOutside(wrap, () => (open.value = false));

interface Parts {
  y: number | '';
  m: number | '';
  d: number | '';
}

const parts = computed<Parts>(() => {
  if (!props.modelValue) return { y: '', m: '', d: '' };
  if (isJalali.value) {
    const [y, m, d] = isoToJalali(props.modelValue).split('-').map(Number);
    return { y, m, d };
  }
  const [y, m, d] = props.modelValue.split('-').map(Number);
  return { y, m, d };
});

function daysInMonth(y: number, m: number): number {
  return isJalali.value ? jalaliDaysInMonth(y, m) : gregorianDaysInMonth(y, m);
}

function commit(np: Parts) {
  const { y } = np;
  let { m, d } = np;
  if (!y || !m || !d) return;
  m = Math.max(1, Math.min(12, Number(m)));
  const dim = daysInMonth(Number(y), m);
  d = Math.max(1, Math.min(dim, Number(d)));

  let iso: string;
  if (isJalali.value) {
    const [gy, gm, gd] = jalaliToGregorian(Number(y), m, d);
    iso = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  } else {
    iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  iso = clampISO(iso, props.min || '1900-01-01', props.max || '2100-12-31');
  emit('update:modelValue', iso);
}

// Segmented inputs
const draft = reactive<Parts>({ ...parts.value });
const editing = ref<'y' | 'm' | 'd' | null>(null);

watch(
  () => [props.modelValue, props.calendar],
  () => {
    if (editing.value) return;
    Object.assign(draft, parts.value);
  },
);

const yInput = ref<HTMLInputElement | null>(null);
const mInput = ref<HTMLInputElement | null>(null);
const dInput = ref<HTMLInputElement | null>(null);

function sanitize(s: string, maxVal: number): string {
  s = (s || '').replace(/[^0-9]/g, '');
  const maxLen = String(maxVal).length;
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

function onSegInput(which: 'y' | 'm' | 'd', e: Event, maxLen: number) {
  const raw = (e.target as HTMLInputElement).value;
  const cleaned = sanitize(raw, Math.pow(10, maxLen) - 1);
  draft[which] = cleaned === '' ? '' : +cleaned;

  if (cleaned.length === maxLen) {
    if (which === 'y') {
      mInput.value?.focus();
      mInput.value?.select();
    } else if (which === 'm') {
      dInput.value?.focus();
      dInput.value?.select();
    }
  }

  if (
    draft.y &&
    draft.m &&
    draft.d &&
    String(draft.y).length === 4 &&
    Number(draft.m) >= 1 &&
    Number(draft.m) <= 12
  ) {
    commit({ ...draft });
  }
}

function onSegBlur() {
  editing.value = null;
  const filled: Parts = {
    y: draft.y || parts.value.y,
    m: draft.m || parts.value.m,
    d: draft.d || parts.value.d,
  };
  if (filled.y && filled.m && filled.d) commit(filled);
  else Object.assign(draft, parts.value);
}

function onSegFocus(which: 'y' | 'm' | 'd', e: Event) {
  editing.value = which;
  Object.assign(draft, parts.value);
  nextTick(() => {
    (e.target as HTMLInputElement).select();
  });
}

function arrow(which: 'y' | 'm' | 'd', delta: number) {
  const p = parts.value;
  let y = Number(draft.y || p.y);
  let m = Number(draft.m || p.m);
  let d = Number(draft.d || p.d);
  if (!y || !m || !d) return;
  if (which === 'y') y += delta;
  if (which === 'm') {
    m += delta;
    while (m < 1) {
      m += 12;
      y--;
    }
    while (m > 12) {
      m -= 12;
      y++;
    }
  }
  if (which === 'd') {
    d += delta;
    const dim = daysInMonth(y, m);
    if (d < 1) {
      m--;
      if (m < 1) {
        m = 12;
        y--;
      }
      d = daysInMonth(y, m);
    } else if (d > dim) {
      d = 1;
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
  }
  commit({ y, m, d });
}

function onKey(which: 'y' | 'm' | 'd', e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    arrow(which, 1);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    arrow(which, -1);
  } else if (e.key === 'Enter') {
    (e.currentTarget as HTMLInputElement).blur();
  }
}

function pad(n: number | '' | null | undefined, len: number): string {
  if (n === '' || n == null) return '';
  return String(n).padStart(len, '0');
}

function segValue(which: 'y' | 'm' | 'd'): string {
  if (editing.value === which)
    return draft[which] === '' ? '' : String(draft[which]);
  return pad(parts.value[which], which === 'y' ? 4 : 2);
}

// Calendar popover
interface View {
  y: number;
  m: number;
}
const view = ref<View>({ y: 2024, m: 1 });

function computeStartView(): View {
  if (parts.value.y && parts.value.m)
    return { y: Number(parts.value.y), m: Number(parts.value.m) };
  const cur = props.modelValue || props.max || props.min;
  if (isJalali.value) {
    const [jy, jm] = isoToJalali(cur).split('-').map(Number);
    return { y: jy, m: jm };
  }
  const [y, m] = cur.split('-').map(Number);
  return { y, m };
}

watch(open, (v) => {
  if (v) view.value = computeStartView();
});
watch([() => props.modelValue, () => props.calendar], () => {
  if (open.value) view.value = computeStartView();
});

const monthLabel = computed(() => {
  const names = isJalali.value ? JALALI_MONTH_NAMES : GREGORIAN_MONTH_NAMES;
  return `${names[view.value.m - 1]} ${view.value.y}`;
});

const weekdays = computed(() =>
  isJalali.value
    ? ['Sh', 'Y', 'D', 'Se', 'Ch', 'Pj', 'J']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
);

const cells = computed(() => {
  const v = view.value;
  const dim = daysInMonth(v.y, v.m);
  const iso = isJalali.value
    ? (() => {
        const [gy, gm, gd] = jalaliToGregorian(v.y, v.m, 1);
        return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
      })()
    : `${v.y}-${String(v.m).padStart(2, '0')}-01`;
  const dow = new Date(iso + 'T00:00:00Z').getUTCDay();
  const firstWeekday = isJalali.value ? (dow + 1) % 7 : dow;
  const out: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) out.push(null);
  for (let d = 1; d <= dim; d++) out.push(d);
  return out;
});

function toISOfromView(d: number): string {
  const v = view.value;
  if (isJalali.value) {
    const [gy, gm, gd] = jalaliToGregorian(v.y, v.m, d);
    return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  }
  return `${v.y}-${String(v.m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function shiftView(delta: number) {
  let { y, m } = view.value;
  m += delta;
  while (m < 1) {
    m += 12;
    y--;
  }
  while (m > 12) {
    m -= 12;
    y++;
  }
  view.value = { y, m };
}

function pick(d: number) {
  commit({ y: view.value.y, m: view.value.m, d });
  open.value = false;
}

function earliest() {
  if (props.min) emit('update:modelValue', props.min);
  open.value = false;
}

function latest() {
  if (props.max) emit('update:modelValue', props.max);
  open.value = false;
}
</script>

<template>
  <div ref="wrap" class="dp-wrap" :class="{ fill, compact }">
    <div class="dp-segments">
      <input
        ref="yInput"
        :value="segValue('y')"
        placeholder="YYYY"
        inputmode="numeric"
        aria-label="Year"
        class="dp-seg seg-y"
        @focus="onSegFocus('y', $event)"
        @input="onSegInput('y', $event, 4)"
        @blur="onSegBlur"
        @keydown="onKey('y', $event)"
      />
      <span class="dp-sep">/</span>
      <input
        ref="mInput"
        :value="segValue('m')"
        placeholder="MM"
        inputmode="numeric"
        aria-label="Month"
        class="dp-seg seg-m"
        @focus="onSegFocus('m', $event)"
        @input="onSegInput('m', $event, 2)"
        @blur="onSegBlur"
        @keydown="onKey('m', $event)"
      />
      <span class="dp-sep">/</span>
      <input
        ref="dInput"
        :value="segValue('d')"
        placeholder="DD"
        inputmode="numeric"
        aria-label="Day"
        class="dp-seg seg-d"
        @focus="onSegFocus('d', $event)"
        @input="onSegInput('d', $event, 2)"
        @blur="onSegBlur"
        @keydown="onKey('d', $event)"
      />
      <button
        type="button"
        class="dp-icon-btn"
        aria-label="Open calendar"
        @click="open = !open"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="4.5" width="14" height="13" rx="1.5" />
          <line x1="3" y1="8.5" x2="17" y2="8.5" />
          <line x1="7" y1="3" x2="7" y2="6" />
          <line x1="13" y1="3" x2="13" y2="6" />
        </svg>
      </button>
    </div>
    <div v-if="open" class="dp-popover">
      <div class="dp-nav">
        <button type="button" class="dp-nav-btn" @click="shiftView(-1)">
          ‹
        </button>
        <div class="dp-month-label">{{ monthLabel }}</div>
        <button type="button" class="dp-nav-btn" @click="shiftView(1)">
          ›
        </button>
      </div>
      <div class="dp-weekdays">
        <div v-for="w in weekdays" :key="w">
          {{ w }}
        </div>
      </div>
      <div class="dp-grid">
        <template v-for="(d, i) in cells" :key="i">
          <div v-if="d === null" class="dp-empty" />
          <button
            v-else
            type="button"
            class="dp-cell"
            :class="{
              selected: toISOfromView(d) === modelValue,
              today:
                toISOfromView(d) === max && toISOfromView(d) !== modelValue,
            }"
            :disabled="
              (min && toISOfromView(d) < min) ||
              (max && toISOfromView(d) > max) ||
              false
            "
            @click="pick(d)"
          >
            {{ d }}
          </button>
        </template>
      </div>
      <div class="dp-shortcuts">
        <button type="button" class="dp-shortcut-btn" @click="earliest">
          Earliest
        </button>
        <button type="button" class="dp-shortcut-btn" @click="latest">
          Latest
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dp-wrap {
  position: relative;
  display: inline-block;
}

.dp-wrap.fill {
  display: block;
  width: 100%;
}

.dp-wrap.fill .dp-segments {
  display: flex;
  width: 100%;
}

.dp-segments {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  padding: 0 4px;
  font-family: var(--mono-font);
  font-size: 13px;
  transition: border-color 0.15s;
}

.compact .dp-segments {
  font-size: 11.5px;
}

.dp-segments:focus-within {
  border-color: var(--accent);
}

.dp-seg {
  background: transparent;
  border: none;
  outline: none;
  color: var(--fg);
  font-family: inherit;
  font-size: inherit;
  padding: 8px 2px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.compact .dp-seg {
  padding: 5px 2px;
}

.seg-y {
  width: 46px;
}

.seg-m,
.seg-d {
  width: 28px;
}

.compact .seg-y {
  width: 40px;
}

.compact .seg-m,
.compact .seg-d {
  width: 24px;
}

.dp-sep {
  color: var(--muted);
  padding: 0 2px;
  user-select: none;
}

.dp-icon-btn {
  background: transparent;
  border: none;
  color: var(--muted);
  padding: 6px 8px;
  cursor: pointer;
  border-left: 1px solid var(--border);
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
  transition: color 0.15s;
}

.compact .dp-icon-btn {
  padding: 4px 6px;
}

.dp-icon-btn:hover {
  color: var(--accent);
}

.dp-wrap.fill .dp-icon-btn {
  margin-left: auto;
}

.dp-popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 60;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  width: 260px;
  color: var(--fg);
}

.dp-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dp-nav-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  width: 28px;
  height: 28px;
  border-radius: 5px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;
}

.dp-nav-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.dp-month-label {
  font-family: var(--display-font);
  font-size: 15px;
}

.dp-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  font-size: 10.5px;
  font-family: var(--mono-font);
  color: var(--muted);
  margin-bottom: 4px;
}

.dp-weekdays > div {
  text-align: center;
  padding: 4px 0;
}

.dp-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.dp-empty {
  min-height: 26px;
}

.dp-cell {
  background: transparent;
  color: var(--fg);
  border: 1px solid transparent;
  border-radius: 5px;
  padding: 6px 0;
  font-family: var(--mono-font);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.12s;
}

.dp-cell:disabled {
  color: var(--muted);
  cursor: not-allowed;
  opacity: 0.35;
}

.dp-cell:not(:disabled):hover:not(.selected) {
  background: rgba(127, 127, 127, 0.14);
}

.dp-cell.selected {
  background: var(--accent);
  color: var(--bg);
}

.dp-cell.today {
  border-color: var(--accent);
}

.dp-shortcuts {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 6px;
}

.dp-shortcut-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-family: var(--mono-font);
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.dp-shortcut-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

@media (max-width: 720px) {
  .dp-segments {
    font-size: 13px;
  }
  .compact .dp-segments {
    font-size: 11.5px;
  }
  .dp-seg {
    font-size: inherit !important;
  }
}
</style>
