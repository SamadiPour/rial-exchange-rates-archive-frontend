<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from 'vue';
import { fetchExchangeRates, getDateRange } from '@/services/exchange-rates';
import DateRangeSelector from '@/components/DateRangeSelector.vue';
import CurrencySelector from '@/components/CurrencySelector.vue';
import ExchangeRateChart from '@/components/ExchangeRateChart.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import type { DateRange, ExchangeRatesData } from '@/types/exchange';
import { LineChart } from 'lucide-vue-next';
import { subMonths } from 'date-fns';
import { useUrlState } from '@/composables/useUrlState';

// Lazy load ExportMenu as it contains heavy export functionality
const ExportMenu = defineAsyncComponent(
  () => import('@/components/ExportMenu.vue'),
);

const urlState = useUrlState();

const exchangeRates = ref<ExchangeRatesData>({});
const validDataRange = ref<DateRange>({ start: new Date(), end: new Date() });
const loading = ref(true);
const error = ref<string | null>(null);
const chartElement = ref<HTMLElement>();

// Use URL state for these values
const selectedCurrencies = urlState.selectedCurrencies;
const selectedDateRange = urlState.selectedDateRange;
const roiEnabled = urlState.roiEnabled;

onMounted(async () => {
  try {
    // Load state from URL first, before setting defaults
    urlState.loadFromUrl();

    // fetch exchange rates data
    const data = await fetchExchangeRates();
    exchangeRates.value = data;

    // finding the date range for the data
    validDataRange.value = getDateRange(data);

    // Set defaults if no URL parameters were loaded
    if (selectedCurrencies.value.length === 0) {
      selectedCurrencies.value = ['usd', 'eur']; // Default to USD and EUR
    }

    if (
      !selectedDateRange.value.start ||
      !selectedDateRange.value.end ||
      selectedDateRange.value.start.getTime() ===
        selectedDateRange.value.end.getTime()
    ) {
      // set date range to the last month
      const oneMonthAgo = subMonths(validDataRange.value.end, 1);
      selectedDateRange.value = {
        start: oneMonthAgo,
        end: validDataRange.value.end,
      };
    }

    // Start watching for URL updates after initial setup
    urlState.startWatching();

    loading.value = false;
  } catch (e) {
    error.value = 'Failed to load exchange rates data';
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
    >
      <div class="flex items-center space-x-3">
        <LineChart class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Rial Exchange Rates Archive
        </h1>
      </div>
      <div class="flex items-center space-x-4">
        <ExportMenu
          v-if="!loading && !error"
          :data="exchangeRates"
          :selected-currencies="selectedCurrencies"
          :date-range="selectedDateRange"
          :chart-element="chartElement"
        />
        <ThemeSwitcher />
      </div>
    </div>

    <div
      v-if="loading"
      class="text-center py-8 text-gray-600 dark:text-gray-400"
    >
      Loading exchange rates data...
    </div>

    <div
      v-else-if="error"
      class="text-center py-8 text-red-600 dark:text-red-400"
    >
      {{ error }}
    </div>

    <div v-else class="space-y-8">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors"
      >
        <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          Select Date Range
        </h2>
        <DateRangeSelector
          v-model:date-range="selectedDateRange"
          :valid-date-range="validDataRange"
          :selected-date-range="selectedDateRange"
        />
        <div class="mb-4" />
        <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          Select Currencies
        </h2>
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <CurrencySelector
              v-model:selected-currencies="selectedCurrencies"
            />
          </div>
          <label class="inline-flex items-center cursor-pointer">
            <input v-model="roiEnabled" type="checkbox" class="sr-only peer" />
            <div
              class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            ></div>
            <span
              class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
              >ROI Mode</span
            >
          </label>
        </div>
      </div>

      <div
        ref="chartElement"
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors"
      >
        <ExchangeRateChart
          :data="exchangeRates"
          :selected-currencies="selectedCurrencies"
          :date-range="selectedDateRange"
          :roi-enabled="roiEnabled"
        />
      </div>
    </div>
  </div>
</template>
