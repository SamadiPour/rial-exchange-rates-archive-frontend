<template>
  <div ref="menuRef" class="relative">
    <button
      class="flex items-center space-x-1.5 px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors text-sm font-medium"
      @click="toggleDropdown"
    >
      <Download class="w-4 h-4" />
      <span>Export</span>
      <ChevronDown class="w-3 h-3 opacity-70" />
    </button>

    <div
      v-if="isOpen"
      class="absolute left-0 sm:left-auto sm:right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 z-50"
    >
      <div class="py-1.5">
        <div
          class="px-3 py-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider"
        >
          Data
        </div>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-2.5 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
          @click="handleExport('csv')"
        >
          <FileText class="w-4 h-4 text-zinc-400" />
          <span>CSV</span>
        </button>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-2.5 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
          @click="handleExport('json')"
        >
          <Database class="w-4 h-4 text-zinc-400" />
          <span>JSON</span>
        </button>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-2.5 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
          @click="handleExport('xml')"
        >
          <Code class="w-4 h-4 text-zinc-400" />
          <span>XML</span>
        </button>

        <hr class="my-1 border-zinc-100 dark:border-zinc-800" />

        <div
          class="px-3 py-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider"
        >
          Chart
        </div>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-2.5 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
          @click="handleExport('png')"
        >
          <Image class="w-4 h-4 text-zinc-400" />
          <span>PNG</span>
        </button>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-2.5 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
          @click="handleExport('svg')"
        >
          <FileImage class="w-4 h-4 text-zinc-400" />
          <span>SVG</span>
        </button>
        <button
          :disabled="isExporting"
          class="flex items-center space-x-2.5 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
          @click="handleExport('pdf')"
        >
          <FileText class="w-4 h-4 text-zinc-400" />
          <span>PDF</span>
        </button>
      </div>
    </div>

    <div
      v-if="isExporting"
      class="absolute right-0 mt-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-700 text-white text-xs rounded-lg shadow-lg"
    >
      Exporting…
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
  Database,
  Code,
} from 'lucide-vue-next';
import { exportService } from '@/services';
import type { ExchangeRatesData, DateRange } from '../types/exchange';

interface Props {
  data: ExchangeRatesData;
  selectedCurrencies: string[];
  dateRange: DateRange;
  chartElement?: HTMLElement;
}

const props = defineProps<Props>();

const isOpen = ref(false);
const isExporting = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleExport = async (
  type: 'csv' | 'json' | 'xml' | 'png' | 'svg' | 'pdf',
) => {
  if (isExporting.value) return;

  isExporting.value = true;
  isOpen.value = false;

  try {
    switch (type) {
      case 'csv':
        exportService.exportDataAsCSV(
          props.data,
          props.selectedCurrencies,
          props.dateRange,
        );
        break;
      case 'json':
        exportService.exportDataAsJSON(
          props.data,
          props.selectedCurrencies,
          props.dateRange,
        );
        break;
      case 'xml':
        exportService.exportDataAsXML(
          props.data,
          props.selectedCurrencies,
          props.dateRange,
        );
        break;
      case 'png':
        if (props.chartElement) {
          await exportService.exportChartAsPNG(props.chartElement);
        }
        break;
      case 'svg':
        if (props.chartElement) {
          await exportService.exportChartAsSVG(props.chartElement);
        }
        break;
      case 'pdf':
        if (props.chartElement) {
          await exportService.exportChartAsPDF(props.chartElement);
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
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown, true);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown, true);
});
</script>
