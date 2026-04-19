import { reactive, watch } from 'vue';
import type { Calendar, Mode, PresetId, PriceType, Scale } from '@/types';

export interface UrlState {
  codes: string[];
  priceType: PriceType;
  scale: Scale;
  mode: Mode;
  calendar: Calendar;
  preset: PresetId;
  customStart: string;
  customEnd: string;
  showAnnos: boolean;
}

function parseHash(): Record<string, string> {
  try {
    const h = window.location.hash.replace(/^#/, '');
    if (!h) return {};
    return Object.fromEntries(new URLSearchParams(h));
  } catch {
    return {};
  }
}

function initial(): UrlState {
  const h = parseHash();
  return {
    codes: h.c ? h.c.split(',') : ['usd', 'eur'],
    priceType: (h.p as PriceType) || 'buy',
    scale: (h.s as Scale) || 'linear',
    mode: (h.m as Mode) || 'absolute',
    calendar: (h.cal as Calendar) || 'gregorian',
    preset: (h.r as PresetId) || '5y',
    customStart: h.rs || '',
    customEnd: h.re || '',
    showAnnos: h.an !== '0',
  };
}

const state = reactive<UrlState>(initial());

let subscribed = false;

export function useUrlState() {
  if (!subscribed) {
    subscribed = true;
    watch(
      () => ({ ...state }),
      (s) => {
        const q = new URLSearchParams();
        q.set('c', s.codes.join(','));
        if (s.priceType !== 'buy') q.set('p', s.priceType);
        if (s.scale !== 'linear') q.set('s', s.scale);
        if (s.mode !== 'absolute') q.set('m', s.mode);
        if (s.calendar !== 'gregorian') q.set('cal', s.calendar);
        if (s.preset !== '5y') q.set('r', s.preset);
        if (s.preset === 'custom') {
          if (s.customStart) q.set('rs', s.customStart);
          if (s.customEnd) q.set('re', s.customEnd);
        }
        if (!s.showAnnos) q.set('an', '0');
        history.replaceState(null, '', '#' + q.toString());
      },
      { deep: true },
    );
  }

  function toggleCode(code: string) {
    const i = state.codes.indexOf(code);
    if (i >= 0) state.codes.splice(i, 1);
    else state.codes.push(code);
  }

  return { state, toggleCode };
}
