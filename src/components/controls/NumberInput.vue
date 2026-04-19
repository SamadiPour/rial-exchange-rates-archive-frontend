<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number;
  placeholder?: string;
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void;
}>();

const display = computed(() => {
  const v = props.modelValue;
  if (v == null || v === 0 || !isFinite(v)) {
    return v === 0 ? '0' : '';
  }
  return Number(v).toLocaleString('en-US');
});

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9.-]/g, '');
  if (raw === '' || raw === '-') {
    emit('update:modelValue', 0);
    return;
  }
  const n = parseFloat(raw);
  emit('update:modelValue', isNaN(n) ? 0 : n);
}
</script>

<template>
  <input
    type="text"
    inputmode="decimal"
    :value="display"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    class="number-input"
    @input="onInput"
  />
</template>

<style scoped>
.number-input {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  padding: 8px 10px;
  border-radius: 6px;
  font-family: var(--mono-font);
  font-size: 13px;
  outline: none;
  width: 100%;
  font-variant-numeric: tabular-nums;
  transition: border-color 0.15s;
}

.number-input:focus {
  border-color: var(--accent);
}

@media (max-width: 720px) {
  .number-input {
    font-size: 13px !important;
  }
}
</style>
