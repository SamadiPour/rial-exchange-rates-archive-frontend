<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import { DateRange, ExchangeRatesData } from '../types/exchange';
import { CURRENCIES } from '../constants/currencies';
import { hexToRGBA } from '../utils/utils.ts';
import { verticalHoverLine } from '../utils/chart-plugins.ts';
import { useTheme } from '../composables/useTheme';
import 'chartjs-adapter-date-fns';

const props = defineProps<{
  data: ExchangeRatesData;
  selectedCurrencies: string[];
  dateRange: DateRange;
  roiEnabled: boolean;
}>();

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  verticalHoverLine,
);

const { isDark } = useTheme();

const filteredDates = computed(() => {
  return Object.entries(props.data)
    .map(([key, _]) => ({ key, date: new Date(key) }))
    .filter(({ date }) => {
      return date >= props.dateRange.start && date <= props.dateRange.end;
    });
});

const chartData = computed(() => {
  const lastMonthRange =
    (props.dateRange.end.getTime() - props.dateRange.start.getTime()) /
      (1000 * 60 * 60 * 24) <=
    31;

  const datasets = props.selectedCurrencies.map((currency) => {
    const currencyData = CURRENCIES[currency];
    const data = filteredDates.value.map(
      (date) => props.data[date.key]?.[currency]?.sell || null,
    );

    return {
      label: `${currencyData?.flag || ''} ${currency.toUpperCase()}`,
      data: props.roiEnabled ? calculateRio(data) : data,
      key: currency,
      backgroundColor: hexToRGBA(currencyData.color, 0.5),
      borderColor: currencyData.color,
      fill: false,
      tension: 0,
      borderWidth: 2.3,
      pointRadius: lastMonthRange ? 3 : 0,
      pointBackgroundColor: currencyData.color,
      pointHoverRadius: lastMonthRange ? 6 : 4,
      pointHoverBackgroundColor: currencyData.color,
    };
  });

  return {
    labels: filteredDates.value.map(({ date }) => date),
    datasets,
  };
});

function calculateRio(data: (number | null)[]): (number | null)[] {
  const firstValue = data.find((value) => value !== null);
  return data.map((value) => {
    if (value === null) {
      return null;
    }
    return firstValue !== undefined
      ? ((value - firstValue) / firstValue) * 100
      : null;
  });
}

const chartOptions = computed(() => {
  // more than 6 months
  const isLongTerm =
    (props.dateRange.end.getTime() - props.dateRange.start.getTime()) /
      (1000 * 60 * 60 * 24) >
    180;

  const textColor = isDark.value ? '#e5e7eb' : '#374151';
  const gridColor = isDark.value ? '#374151' : '#e5e7eb';
  const tooltipBg = isDark.value ? '#1f2937' : '#ffffff';
  const tooltipText = isDark.value ? '#e5e7eb' : '#333333';
  const tooltipBorder = isDark.value ? '#4b5563' : '#d1d5db';

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'yyyy-MM-dd',
          unit: isLongTerm ? undefined : 'day',
          displayFormats: {
            second: 'dd MMM',
            minute: 'dd MMM',
            hour: 'dd MMM',
            day: 'dd MMM',
            month: 'MMM yyyy',
            year: 'yyyy',
          },
        },
        grid: {
          display: false,
          color: gridColor,
        },
        title: {
          display: false,
          text: 'Date',
        },
        ticks: {
          maxTicksLimit: 15,
          color: textColor,
          major: {
            enabled: true,
          },
          font(context: any) {
            if (context.tick && context.tick.major) {
              return {
                weight: 'bold',
              };
            }
          },
        },
      },
      y: {
        grid: {
          drawBorder: false,
          color: gridColor,
        },
        ticks: {
          color: textColor,
          callback: props.roiEnabled
            ? function (value: number) {
                return `${value}%`;
              }
            : undefined,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 30,
          boxHeight: 10,
          color: textColor,
          font: {
            weight: 'bold',
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        position: 'nearest',
        intersect: false,
        // box itself
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        padding: 12,
        bodySpacing: 6,
        titleMarginBottom: 8,
        // caret - the arrow pointing to the hovered point
        caretSize: 0,
        caretPadding: 12,
        // border
        borderColor: tooltipBorder,
        borderWidth: 1.4,
        // color box style
        displayColors: true,
        boxPadding: 6,
        boxWidth: 12,
        boxHeight: 6,
        callbacks: {
          label: props.roiEnabled
            ? function (tooltipItem: any) {
                const dataset = tooltipItem.dataset;
                const index = tooltipItem.dataIndex;
                const roiValue = dataset.data[index] as number;
                const realValue =
                  props.data[filteredDates.value[index].key]?.[dataset.key]
                    ?.sell;
                const showValue =
                  realValue !== undefined ? realValue : roiValue;

                return `${dataset.label}: ${showValue.toLocaleString('en-US', { minimumFractionDigits: 0 })} - ${roiValue.toFixed(2)}% ${roiValue > 0 ? '↑' : '↓'}`;
              }
            : undefined,
        },
      },
      title: {
        display: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };
});
</script>

<template>
  <div class="h-[600px]">
    <Line
      v-if="chartData.datasets.length > 0"
      id="canvas"
      :data="chartData"
      :options="chartOptions as any"
      aria-label="Exchange rate chart"
      role="img"
    />
    <div
      v-else
      class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
    >
      Please select at least one currency to display the chart
    </div>
  </div>
</template>
