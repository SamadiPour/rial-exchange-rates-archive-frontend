<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { subDays, subMonths, subYears } from 'date-fns';
import { DateRange } from '../types/exchange.ts';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useTheme } from '../composables/useTheme';

const props = defineProps({
  validDateRange: {
    type: Object as () => DateRange,
    required: true,
  },
  selectedDateRange: {
    type: Object as () => DateRange,
    default: null,
  },
});

const emit = defineEmits(['update:dateRange']);

const { isDark } = useTheme();

const presetDates = ref([
  {
    label: 'Last 7 days',
    value: [subDays(props.validDateRange.end, 7), props.validDateRange.end],
  },
  {
    label: 'Last 14 days',
    value: [subDays(props.validDateRange.end, 14), props.validDateRange.end],
  },
  {
    label: 'Last 30 days',
    value: [subDays(props.validDateRange.end, 30), props.validDateRange.end],
  },
  {
    label: 'Last 3 months',
    value: [subMonths(props.validDateRange.end, 3), props.validDateRange.end],
  },
  {
    label: 'Last 6 months',
    value: [subMonths(props.validDateRange.end, 6), props.validDateRange.end],
  },
  {
    label: 'Last year',
    value: [subYears(props.validDateRange.end, 1), props.validDateRange.end],
  },
  {
    label: 'All time',
    value: [props.validDateRange.start, props.validDateRange.end],
  },
]);

const dateRange = ref<[Date, Date]>([new Date(), new Date()]);

function applyDateRange() {
  if (dateRange.value[0] && dateRange.value[1]) {
    emit('update:dateRange', {
      start: dateRange.value[0],
      end: dateRange.value[1],
    });
  }
}

onMounted(() => {
  if (props.selectedDateRange) {
    dateRange.value = [
      props.selectedDateRange.start,
      props.selectedDateRange.end,
    ];
  }
});
</script>

<template>
  <div class="flex space-y-4 space-x-4">
    <VueDatePicker
      v-model="dateRange"
      :min-date="props.validDateRange.start"
      :max-date="props.validDateRange.end"
      :enable-time-picker="false"
      :auto-apply="true"
      :preset-dates="presetDates"
      format="yyyy-MM-dd"
      range
      multi-calendars
      text-input
      :dark="isDark"
      class="rounded"
      @update:model-value="applyDateRange"
    />
  </div>
</template>

<style>
/* Dark mode styles for vue-datepicker — zinc theme with green accent */
.dark .dp__theme_dark {
  --dp-background-color: #18181b; /* zinc-900 */
  --dp-text-color: #e4e4e7; /* zinc-200 */
  --dp-hover-color: #27272a; /* zinc-800 */
  --dp-hover-text-color: #f4f4f5; /* zinc-100 */
  --dp-hover-icon-color: #f4f4f5;
  --dp-primary-color: #16a34a; /* green-600 */
  --dp-primary-text-color: #ffffff;
  --dp-secondary-color: #71717a; /* zinc-500 */
  --dp-border-color: #3f3f46; /* zinc-700 */
  --dp-menu-border-color: #3f3f46;
  --dp-border-color-hover: #52525b; /* zinc-600 */
  --dp-disabled-color: #3f3f46;
  --dp-scroll-bar-background: #27272a;
  --dp-scroll-bar-color: #52525b;
  --dp-success-color: #16a34a; /* green-600 */
  --dp-success-color-disabled: #166534; /* green-800 */
  --dp-icon-color: #a1a1aa; /* zinc-400 */
  --dp-danger-color: #ef4444;
  --dp-highlight-color: rgba(22, 163, 74, 0.12); /* green-600 at 12% */
}
</style>
