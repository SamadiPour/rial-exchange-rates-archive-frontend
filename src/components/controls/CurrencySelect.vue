<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { Currency } from '@/types';
import { useOnClickOutside } from '@/composables/useOnClickOutside';

const props = defineProps<{
  modelValue: string;
  options: Currency[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
}>();

const open = ref(false);
const query = ref('');
const wrap = ref<HTMLElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);

useOnClickOutside(wrap, () => (open.value = false));

const selected = computed(
  () =>
    props.options.find((o) => o.code === props.modelValue) || props.options[0],
);

const filtered = computed(() => {
  if (!query.value) return props.options;
  const q = query.value.toLowerCase();
  return props.options.filter(
    (o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q),
  );
});

watch(open, async (v) => {
  if (v) {
    query.value = '';
    await nextTick();
    searchRef.value?.focus();
  }
});

function pick(code: string) {
  emit('update:modelValue', code);
  open.value = false;
}
</script>

<template>
  <div ref="wrap" class="cs-wrap">
    <button type="button" class="cs-trigger" @click="open = !open">
      <span class="cs-trigger-inner">
        <span>{{ selected?.flag }}</span>
        <span class="code">{{ selected?.code.toUpperCase() }}</span>
        <span class="name">{{ selected?.name }}</span>
      </span>
      <span class="caret">▾</span>
    </button>
    <div v-if="open" class="cs-popover">
      <input
        ref="searchRef"
        v-model="query"
        placeholder="Search…"
        class="cs-search"
      />
      <div class="cs-list">
        <button
          v-for="o in filtered"
          :key="o.code"
          type="button"
          class="cs-option"
          :class="{ active: o.code === modelValue }"
          @click="pick(o.code)"
        >
          <span>{{ o.flag }}</span>
          <span class="option-code">{{ o.code.toUpperCase() }}</span>
          <span class="option-name">{{ o.name }}</span>
        </button>
        <div v-if="filtered.length === 0" class="cs-empty">No matches</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cs-wrap {
  position: relative;
  width: 100%;
}

.cs-trigger {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  padding: 8px 10px;
  border-radius: 6px;
  font-family: var(--mono-font);
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  transition: border-color 0.15s;
}

.cs-trigger:hover {
  border-color: var(--accent);
}

.cs-trigger-inner {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cs-trigger-inner .code {
  flex-shrink: 0;
}

.cs-trigger-inner .name {
  color: var(--muted);
  font-family: var(--ui-font);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.caret {
  opacity: 0.6;
  font-size: 14px;
  flex-shrink: 0;
}

.cs-popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 60;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  max-height: 280px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cs-search {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  padding: 6px 8px;
  border-radius: 5px;
  margin-bottom: 4px;
  outline: none;
  font-family: var(--mono-font);
  font-size: 12px;
}

.cs-search:focus {
  border-color: var(--accent);
}

.cs-list {
  overflow: auto;
  flex: 1;
}

.cs-option {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  background: transparent;
  border: none;
  color: var(--fg);
  cursor: pointer;
  border-radius: 5px;
  font-family: var(--mono-font);
  font-size: 12px;
  text-align: left;
  transition: background 0.12s;
}

.cs-option:hover {
  background: rgba(127, 127, 127, 0.1);
}

.cs-option.active {
  background: rgba(127, 127, 127, 0.18);
}

.option-code {
  min-width: 40px;
}

.option-name {
  color: var(--muted);
  font-family: var(--ui-font);
  font-size: 12px;
}

.cs-empty {
  padding: 12px;
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}
</style>
