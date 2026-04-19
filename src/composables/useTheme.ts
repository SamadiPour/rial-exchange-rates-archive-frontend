import { ref, watchEffect } from 'vue';
import type { Theme } from '@/types';
import { DEFAULT_THEME, THEMES } from '@/constants/presets';

const STORAGE_KEY = 'theme';

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage may be unavailable (private mode, SSR, etc.)
  }
  return DEFAULT_THEME;
}

const theme = ref<Theme>(loadTheme());

function applyTheme(t: Theme) {
  const tokens = THEMES[t];
  const r = document.documentElement;
  r.style.setProperty('--bg', tokens.bg);
  r.style.setProperty('--bg-soft', tokens.bgSoft);
  r.style.setProperty('--fg', tokens.fg);
  r.style.setProperty('--muted', tokens.muted);
  r.style.setProperty('--border', tokens.border);
  r.style.setProperty('--accent', tokens.accent);
  r.style.setProperty('--up', tokens.up);
  r.style.setProperty('--down', tokens.down);
  r.style.setProperty('--display-font', tokens.displayFont);
  r.style.setProperty('--ui-font', tokens.uiFont);
  r.style.setProperty('--mono-font', tokens.monoFont);
  document.body.dataset.theme = t;
}

let mounted = false;

export function useTheme() {
  if (!mounted) {
    mounted = true;
    watchEffect(() => {
      applyTheme(theme.value);
      try {
        localStorage.setItem(STORAGE_KEY, theme.value);
      } catch {
        // ignore
      }
    });
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  return { theme, toggleTheme };
}
