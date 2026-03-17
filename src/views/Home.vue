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
  <div class="max-w-7xl mx-auto space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
    >
      <div class="flex items-center space-x-2.5">
        <LineChart class="w-5 h-5 text-green-600 dark:text-green-500" />
        <h1
          class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Rial Archive
        </h1>
      </div>
      <div class="flex items-center space-x-3">
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
      class="flex items-center justify-center gap-2.5 py-12 text-zinc-400 dark:text-zinc-500 text-sm"
    >
      <svg
        class="w-4 h-4 animate-spin-smooth"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>Loading exchange rates…</span>
    </div>

    <div
      v-else-if="error"
      class="text-center py-12 text-red-500 dark:text-red-400 text-sm"
    >
      {{ error }}
    </div>

    <Transition name="content" appear>
      <div v-if="!loading && !error" class="space-y-4">
        <div
          class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 transition-colors"
        >
          <div class="space-y-4">
            <DateRangeSelector
              v-model:date-range="selectedDateRange"
              :valid-date-range="validDataRange"
              :selected-date-range="selectedDateRange"
            />
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="flex-1">
                <CurrencySelector
                  v-model:selected-currencies="selectedCurrencies"
                />
              </div>
              <label class="inline-flex items-center cursor-pointer">
                <input
                  v-model="roiEnabled"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 dark:peer-focus:ring-green-900 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-green-600"
                ></div>
                <span
                  class="ms-3 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >ROI Mode</span
                >
              </label>
            </div>
          </div>
        </div>

        <div
          ref="chartElement"
          class="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors"
        >
          <ExchangeRateChart
            :data="exchangeRates"
            :selected-currencies="selectedCurrencies"
            :date-range="selectedDateRange"
            :roi-enabled="roiEnabled"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
