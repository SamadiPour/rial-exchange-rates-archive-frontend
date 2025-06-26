import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type {DateRange, ExchangeRatesData} from '../types/exchange'
import {format, isValid, isWithinInterval, parseISO} from 'date-fns'

export function useExport() {
  // Export data as CSV
  const exportAsCSV = (data: ExchangeRatesData, currencies: string[], dateRange: DateRange) => {
    const filteredData = filterDataByDateRange(data, dateRange)
    const dates = Object.keys(filteredData).sort()

    // Create CSV header
    const header = ['Date', ...currencies.flatMap(currency => [`${currency.toUpperCase()}_Buy`, `${currency.toUpperCase()}_Sell`])]

    // Create CSV rows
    const rows = dates.map(date => {
      const row = [date]
      currencies.forEach(currency => {
        const rate = filteredData[date]?.[currency]
        row.push(rate?.buy?.toString() || '')
        row.push(rate?.sell?.toString() || '')
      })
      return row
    })

    const csvContent = [header, ...rows].map(row => row.join(',')).join('\n')
    const filename = `rial-exchange-rates-${format(dateRange.start, 'yyyy-MM-dd')}-to-${format(dateRange.end, 'yyyy-MM-dd')}.csv`

    fileDownload(csvContent, filename)
  }

  // Export data as Excel (CSV with Excel-friendly format)
  const exportAsExcel = (data: ExchangeRatesData, currencies: string[], dateRange: DateRange) => {
    const filteredData = filterDataByDateRange(data, dateRange)
    const dates = Object.keys(filteredData).sort()

    // Create Excel-friendly CSV with UTF-8 BOM
    const header = ['Date', ...currencies.flatMap(currency => [`${currency.toUpperCase()} Buy`, `${currency.toUpperCase()} Sell`])]
    const rows = dates.map(date => {
      const row = [date]
      currencies.forEach(currency => {
        const rate = filteredData[date]?.[currency]
        row.push(rate?.buy?.toString() || '')
        row.push(rate?.sell?.toString() || '')
      })
      return row
    })

    const csvContent = '\uFEFF' + [header, ...rows].map(row => row.join(',')).join('\n')
    const filename = `rial-exchange-rates-${format(dateRange.start, 'yyyy-MM-dd')}-to-${format(dateRange.end, 'yyyy-MM-dd')}.xlsx`

    const blob = new Blob([csvContent], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;'})
    fileDownload(blob, filename)
  }

  // Export chart as PNG
  const exportChartAsPNG = async (chartElement: HTMLElement, filename?: string) => {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const name = filename || `rial-exchange-chart-${format(new Date(), 'yyyy-MM-dd-HHmm')}.png`
          fileDownload(blob, name)
        }
      }, 'image/png')
    } catch (error) {
      console.error('Error exporting chart as PNG:', error)
      throw error
    }
  }

  // Export chart as SVG
  const exportChartAsSVG = async (chartElement: HTMLElement, filename?: string) => {
    try {
      // Get the canvas element from Chart.js
      const canvas = chartElement.querySelector('canvas')
      if (!canvas) throw new Error('Canvas not found')

      // Convert canvas to SVG (simplified approach)
      const imgData = canvas.toDataURL('image/png')
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
             width="${canvas.width}" height="${canvas.height}">
          <image xlink:href="${imgData}" width="${canvas.width}" height="${canvas.height}"/>
        </svg>
      `

      const name = filename || `rial-exchange-chart-${format(new Date(), 'yyyy-MM-dd-HHmm')}.svg`
      fileDownload(svgString, name)
    } catch (error) {
      console.error('Error exporting chart as SVG:', error)
      throw error
    }
  }

  // Export chart as PDF
  const exportChartAsPDF = async (chartElement: HTMLElement, filename?: string) => {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('landscape')
      const imgWidth = 280
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 15, 15, imgWidth, imgHeight)

      const name = filename || `rial-exchange-chart-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`
      pdf.save(name)
    } catch (error) {
      console.error('Error exporting chart as PDF:', error)
      throw error
    }
  }

  const filterDataByDateRange = (data: ExchangeRatesData, dateRange: DateRange) => {
    const filtered: ExchangeRatesData = {}

    Object.keys(data).forEach(dateStr => {
      try {
        // Try parsing the date - it might be in YYYY-MM-DD format already
        const date = dateStr.includes('-') ? parseISO(dateStr) : new Date(dateStr)
        if (isValid(date) && isWithinInterval(date, {start: dateRange.start, end: dateRange.end})) {
          filtered[dateStr] = data[dateStr]
        }
      } catch (error) {
        console.warn(`Failed to parse date: ${dateStr}`, error)
      }
    })

    return filtered
  }

  return {
    exportAsCSV,
    exportAsExcel,
    exportChartAsPNG,
    exportChartAsSVG,
    exportChartAsPDF
  }
}
