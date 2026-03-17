<script setup lang="ts">
import { computed } from 'vue';
import { CURRENCIES } from '../constants/currencies';
import Multiselect from 'vue-multiselect';

const selectedCurrencies = defineModel<string[]>('selectedCurrencies', {
  default: () => [],
});

const currencies = Object.entries(CURRENCIES).map(([code, details]) => ({
  code,
  label: `${details.flag || ''} ${details.name} (${code.toUpperCase()})`,
}));

const selectedCurrencyObjects = computed({
  get: () =>
    currencies.filter((currency) =>
      selectedCurrencies.value.includes(currency.code),
    ),
  set: (values: any[]) => {
    selectedCurrencies.value = values.map((v) => v.code);
  },
});
</script>

<template>
  <div class="w-full">
    <Multiselect
      v-model="selectedCurrencyObjects"
      :options="currencies"
      :multiple="true"
      :close-on-select="false"
      :clear-on-select="false"
      placeholder="Select currencies"
      label="label"
      track-by="code"
      class="dark-multiselect"
    />
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style>
@reference "tailwindcss";

.dark-multiselect .multiselect__tag {
  @apply font-medium;
}

/* Dark mode styles - zinc theme */
.dark .dark-multiselect .multiselect {
  @apply bg-zinc-900 border-zinc-700;
}

.dark .dark-multiselect .multiselect__tags {
  @apply bg-zinc-900 border-zinc-700;
}

.dark .dark-multiselect .multiselect__input,
.dark .dark-multiselect .multiselect__single {
  @apply bg-zinc-900 text-zinc-200;
}

.dark .dark-multiselect .multiselect__placeholder {
  @apply text-zinc-500;
}

.dark .dark-multiselect .multiselect__content-wrapper {
  @apply bg-zinc-900 border-zinc-700;
}

.dark .dark-multiselect .multiselect__content {
  @apply bg-zinc-900;
}

.dark .dark-multiselect .multiselect__option {
  @apply text-zinc-200;
}

.dark .dark-multiselect .multiselect__option--highlight {
  @apply bg-zinc-800 text-zinc-100;
}

.dark .dark-multiselect .multiselect__option--selected {
  @apply bg-zinc-700 text-zinc-100 font-medium;
}

.dark .dark-multiselect .multiselect__tag {
  @apply bg-zinc-700 text-zinc-100 font-medium;
}

.dark .dark-multiselect .multiselect__tag-icon:after {
  @apply text-zinc-300;
}

.dark .dark-multiselect .multiselect__tag-icon:hover {
  @apply bg-zinc-600;
}

.dark .dark-multiselect .multiselect__select:before {
  @apply border-t-zinc-400;
}
</style>
