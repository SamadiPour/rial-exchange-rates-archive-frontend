<template>
  <div class="relative">
    <button
      class="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
      @click="toggleDropdown"
    >
      <Download class="w-4 h-4" />
      <span>Export</span>
      <ChevronDown class="w-4 h-4" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="py-2">
        <div
          class="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          Data Export
        </div>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          @click="handleExport('csv')"
        >
          <FileText class="w-4 h-4" />
          <span>Export as CSV</span>
        </button>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          @click="handleExport('excel')"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Export as Excel</span>
        </button>

        <hr class="my-2 border-gray-200 dark:border-gray-600" />

        <div
          class="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          Chart Export
        </div>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          @click="handleExport('png')"
        >
          <Image class="w-4 h-4" />
          <span>Export as PNG</span>
        </button>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          @click="handleExport('svg')"
        >
          <FileImage class="w-4 h-4" />
          <span>Export as SVG</span>
        </button>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          @click="handleExport('pdf')"
        >
          <FileText class="w-4 h-4" />
          <span>Export as PDF</span>
        </button>
      </div>
    </div>

    <div
      v-if="isExporting"
      class="absolute right-0 mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-lg"
    >
      Exporting...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Image,
  FileImage,
} from 'lucide-vue-next';
import { useExport } from '../composables/useExport';
import type { ExchangeRatesData, DateRange } from '../types/exchange';

interface Props {
  data: ExchangeRatesData;
  selectedCurrencies: string[];
  dateRange: DateRange;
  chartElement?: HTMLElement;
}

const props = defineProps<Props>();

const {
  exportAsCSV,
  exportAsExcel,
  exportChartAsPNG,
  exportChartAsSVG,
  exportChartAsPDF,
} = useExport();

const isOpen = ref(false);
const isExporting = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleExport = async (type: 'csv' | 'excel' | 'png' | 'svg' | 'pdf') => {
  if (isExporting.value) return;

  isExporting.value = true;
  isOpen.value = false;

  try {
    switch (type) {
      case 'csv':
        exportAsCSV(props.data, props.selectedCurrencies, props.dateRange);
        break;
      case 'excel':
        exportAsExcel(props.data, props.selectedCurrencies, props.dateRange);
        break;
      case 'png':
        if (props.chartElement) {
          await exportChartAsPNG(props.chartElement);
        }
        break;
      case 'svg':
        if (props.chartElement) {
          await exportChartAsSVG(props.chartElement);
        }
        break;
      case 'pdf':
        if (props.chartElement) {
          await exportChartAsPDF(props.chartElement);
        }
        break;
    }
  } catch (error) {
    console.error('Export failed:', error);
    // You could emit an error event here or show a toast notification
  } finally {
    isExporting.value = false;
  }
};

const closeDropdown = (event: Event) => {
  if (!(event.target as Element).closest('.relative')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>
