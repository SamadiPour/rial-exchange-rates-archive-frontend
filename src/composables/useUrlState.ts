import {ref, watch} from 'vue'
import type {DateRange} from '../types/exchange'
import {format, isValid, parse} from 'date-fns'

export function useUrlState() {
  const selectedCurrencies = ref<string[]>([])
  const selectedDateRange = ref<DateRange>({start: new Date(), end: new Date()})
  const roiEnabled = ref(false)

  let updateTimeout: NodeJS.Timeout | null = null

  const updateUrl = () => {
    // Debounce URL updates
    if (updateTimeout) {
      clearTimeout(updateTimeout)
    }

    updateTimeout = setTimeout(() => {
      const url = new URL(window.location.href)
      const params = new URLSearchParams()

      if (selectedCurrencies.value.length > 0) {
        params.set('currencies', selectedCurrencies.value.join(','))
      }

      if (selectedDateRange.value.start && selectedDateRange.value.end) {
        params.set('startDate', format(selectedDateRange.value.start, 'yyyy-MM-dd'))
        params.set('endDate', format(selectedDateRange.value.end, 'yyyy-MM-dd'))
      }

      if (roiEnabled.value) {
        params.set('roi', 'true')
      }

      url.search = params.toString()
      window.history.replaceState({}, '', url.toString())
    }, 500) // Wait 500ms before updating URL
  }

  const loadFromUrl = () => {
    const params = new URLSearchParams(window.location.search)

    const currencies = params.get('currencies')
    if (currencies) {
      selectedCurrencies.value = currencies.split(',').filter(Boolean)
    }

    const startDate = params.get('startDate')
    const endDate = params.get('endDate')
    if (startDate && endDate) {
      const start = parse(startDate, 'yyyy-MM-dd', new Date())
      const end = parse(endDate, 'yyyy-MM-dd', new Date())

      if (isValid(start) && isValid(end)) {
        selectedDateRange.value = {start, end}
      }
    }

    const roi = params.get('roi')
    if (roi === 'true') {
      roiEnabled.value = true
    }
  }

  // Don't watch for changes initially to prevent immediate URL updates
  const startWatching = () => {
    watch([selectedCurrencies, selectedDateRange, roiEnabled], updateUrl, {deep: true})
  }

  return {
    selectedCurrencies,
    selectedDateRange,
    roiEnabled,
    loadFromUrl,
    startWatching
  }
}
