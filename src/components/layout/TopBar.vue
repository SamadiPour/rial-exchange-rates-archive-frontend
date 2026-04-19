<script setup lang="ts">
import type { Theme } from '@/types';
import { fmtToman } from '@/utils/format';

defineProps<{
  theme: Theme;
  lastDate: string;
  lastUsd: number;
}>();

defineEmits<{
  (e: 'toggleTheme'): void;
}>();
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <div class="logo-dot" />
      <div>
        <div class="title">Rial Archive</div>
        <div class="subtitle">
          Iranian Toman exchange-rate visualizer · 2012–present
        </div>
      </div>
    </div>
    <div class="topbar-right">
      <div class="usd-badge" title="USD buy price, latest session">
        <span class="mono-tiny">USD · {{ lastDate }}</span>
        <span class="big-num num">{{ fmtToman(lastUsd) }}</span>
        <span class="mono-tiny">Toman</span>
      </div>
      <button
        class="ghost-btn"
        :aria-label="
          theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
        "
        @click="$emit('toggleTheme')"
      >
        {{ theme === 'dark' ? '☀' : '☾' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
}

.logo-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 24px var(--accent);
}

.title {
  font-family: var(--display-font);
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1;
  letter-spacing: -0.01em;
}

.subtitle {
  color: var(--muted);
  font-size: 12px;
  font-family: var(--mono-font);
  margin-top: 4px;
}

.topbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.usd-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-soft);
  line-height: 1.1;
}

.big-num {
  font-family: var(--display-font);
  font-size: 26px;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.ghost-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  width: 38px;
  height: 38px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition:
    border-color 0.15s,
    color 0.15s;
}

.ghost-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

@media (max-width: 720px) {
  .big-num {
    font-size: 20px;
  }
  .topbar {
    padding-bottom: 14px;
  }
}
</style>
