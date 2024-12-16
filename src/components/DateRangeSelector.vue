<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {subDays, subMonths, subYears} from 'date-fns';
import {DateRange} from "../types/exchange.ts";
import VueDatePicker from '@vuepic/vue-datepicker';
import {formatDate} from "../utils/utils.ts";

const emit = defineEmits(['update:dateRange']);
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

const presetDates = ref([
  {
    label: 'Last 7 days',
    value: [subDays(props.validDateRange.end, 7), props.validDateRange.end]
  },
  {
    label: 'Last 14 days',
    value: [subDays(props.validDateRange.end, 14), props.validDateRange.end]
  },
  {
    label: 'Last 30 days',
    value: [subDays(props.validDateRange.end, 30), props.validDateRange.end]
  },
  {
    label: 'Last 3 months',
    value: [subMonths(props.validDateRange.end, 3), props.validDateRange.end]
  },
  {
    label: 'Last 6 months',
    value: [subMonths(props.validDateRange.end, 6), props.validDateRange.end]
  },
  {
    label: 'Last year',
    value: [subYears(props.validDateRange.end, 1), props.validDateRange.end]
  },
  {
    label: 'All time',
    value: [props.validDateRange.start, props.validDateRange.end]
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
    dateRange.value = [props.selectedDateRange.start, props.selectedDateRange.end];
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
        range multi-calendars text-input
        class="rounded"
        @update:model-value="applyDateRange"/>
  </div>
</template>