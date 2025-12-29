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

/* Dark mode styles - gray theme */
.dark .dark-multiselect .multiselect {
  @apply bg-gray-800 border-gray-600;
}

.dark .dark-multiselect .multiselect__tags {
  @apply bg-gray-800 border-gray-600;
}

.dark .dark-multiselect .multiselect__input,
.dark .dark-multiselect .multiselect__single {
  @apply bg-gray-800 text-gray-200;
}

.dark .dark-multiselect .multiselect__placeholder {
  @apply text-gray-400;
}

.dark .dark-multiselect .multiselect__content-wrapper {
  @apply bg-gray-800 border-gray-600;
}

.dark .dark-multiselect .multiselect__content {
  @apply bg-gray-800;
}

.dark .dark-multiselect .multiselect__option {
  @apply text-gray-200;
}

.dark .dark-multiselect .multiselect__option--highlight {
  @apply bg-gray-700 text-gray-100;
}

.dark .dark-multiselect .multiselect__option--selected {
  @apply bg-gray-600 text-gray-100 font-medium;
}

.dark .dark-multiselect .multiselect__tag {
  @apply bg-gray-600 text-gray-100 font-medium;
}

.dark .dark-multiselect .multiselect__tag-icon:after {
  @apply text-gray-300;
}

.dark .dark-multiselect .multiselect__tag-icon:hover {
  @apply bg-gray-700;
}

.dark .dark-multiselect .multiselect__select:before {
  @apply border-t-gray-400;
}
</style>
