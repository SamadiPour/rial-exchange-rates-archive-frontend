import type { Preset, Theme } from '@/types';

export const RANGE_PRESETS: Preset[] = [
  { id: '7d', label: '7D', days: 7 },
  { id: '30d', label: '1M', days: 30 },
  { id: '3m', label: '3M', days: 90 },
  { id: '6m', label: '6M', days: 182 },
  { id: '1y', label: '1Y', days: 365 },
  { id: '5y', label: '5Y', days: 365 * 5 },
  { id: 'all', label: 'All', days: null },
  { id: 'custom', label: 'Custom', days: null },
];

export interface ThemeTokens {
  bg: string;
  bgSoft: string;
  fg: string;
  muted: string;
  border: string;
  accent: string;
  displayFont: string;
  uiFont: string;
  monoFont: string;
  up: string;
  down: string;
}

const DISPLAY_FONT = "'Instrument Serif', 'Times New Roman', serif";
const UI_FONT = "'Inter Tight', system-ui, sans-serif";
const MONO_FONT = "'JetBrains Mono', ui-monospace, monospace";

export const THEMES: Record<Theme, ThemeTokens> = {
  light: {
    bg: '#faf8f3',
    bgSoft: '#f0ece2',
    fg: '#1a1815',
    muted: 'rgba(26,24,21,0.55)',
    border: 'rgba(26,24,21,0.14)',
    accent: 'oklch(0.82 0.14 75)',
    displayFont: DISPLAY_FONT,
    uiFont: UI_FONT,
    monoFont: MONO_FONT,
    up: 'oklch(0.55 0.14 150)',
    down: 'oklch(0.55 0.18 28)',
  },
  dark: {
    bg: '#0b0b0d',
    bgSoft: '#131318',
    fg: '#f2efe8',
    muted: 'rgba(242,239,232,0.55)',
    border: 'rgba(242,239,232,0.12)',
    accent: 'oklch(0.82 0.14 75)',
    displayFont: DISPLAY_FONT,
    uiFont: UI_FONT,
    monoFont: MONO_FONT,
    up: 'oklch(0.78 0.14 150)',
    down: 'oklch(0.72 0.18 28)',
  },
};

export const DEFAULT_THEME: Theme = 'light';
