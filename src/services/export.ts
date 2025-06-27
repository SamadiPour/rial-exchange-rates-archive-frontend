import fileDownload from 'js-file-download';
import type { DateRange, ExchangeRatesData } from '../types/exchange';
import { format, isValid, isWithinInterval, parseISO } from 'date-fns';

/**
 * Unified Export Service
 * Handles all data and chart export functionality
 */
export class ExportService {
  private static instance: ExportService;

  private constructor() { }

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Filters exchange rate data by date range and optionally by selected currencies
   */
  private filterData(
    data: ExchangeRatesData,
    dateRange: DateRange,
    currencies?: string[],
  ): ExchangeRatesData {
    const filtered: ExchangeRatesData = {};

    Object.keys(data).forEach((dateStr) => {
      try {
        const date = dateStr.includes('-')
          ? parseISO(dateStr)
          : new Date(dateStr);
        if (
          isValid(date) &&
          isWithinInterval(date, { start: dateRange.start, end: dateRange.end })
        ) {
          const dayData = data[dateStr];

          if (currencies) {
            // Filter by selected currencies
            const filteredDayData: { [key: string]: any } = {};
            currencies.forEach((currency) => {
              if (dayData[currency]) {
                filteredDayData[currency] = dayData[currency];
              }
            });

            if (Object.keys(filteredDayData).length > 0) {
              filtered[dateStr] = filteredDayData;
            }
          } else {
            // Include all currencies for this date
            filtered[dateStr] = dayData;
          }
        }
      } catch (error) {
        console.warn(`Failed to parse date: ${dateStr}`, error);
      }
    });

    return filtered;
  }

  /**
   * Generates a filename with date range
   */
  private generateFilename(extension: string, dateRange: DateRange): string {
    const startDate = format(dateRange.start, 'yyyy-MM-dd');
    const endDate = format(dateRange.end, 'yyyy-MM-dd');
    return `rial-exchange-rates-${startDate}-to-${endDate}.${extension}`;
  }

  /**
   * Generates a chart filename with timestamp
   */
  private generateChartFilename(extension: string): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    return `rial-exchange-chart-${timestamp}.${extension}`;
  }

  // === DATA EXPORTS ===

  /**
   * Exports exchange rate data as CSV file
   */
  exportDataAsCSV(
    data: ExchangeRatesData,
    currencies: string[],
    dateRange: DateRange,
  ): void {
    const filteredData = this.filterData(data, dateRange, currencies);

    // Create CSV header
    const header = [
      'Date',
      ...currencies.flatMap((currency) => [
        `${currency.toUpperCase()}_Buy`,
        `${currency.toUpperCase()}_Sell`,
      ]),
    ];

    // Create CSV rows
    const dates = Object.keys(filteredData).sort();
    const rows = dates.map((date) => {
      const row = [date];
      currencies.forEach((currency) => {
        const rate = filteredData[date]?.[currency];
        row.push(rate?.buy?.toString() || '');
        row.push(rate?.sell?.toString() || '');
      });
      return row;
    });

    // Escape CSV values and create content
    const escapeCsvValue = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [header, ...rows]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');

    const filename = this.generateFilename('csv', dateRange);
    fileDownload(csvContent, filename);
  }

  /**
   * Exports exchange rate data as JSON file
   */
  exportDataAsJSON(
    data: ExchangeRatesData,
    currencies: string[],
    dateRange: DateRange,
  ): void {
    const filteredData = this.filterData(data, dateRange, currencies);

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        dateRange: {
          start: format(dateRange.start, 'yyyy-MM-dd'),
          end: format(dateRange.end, 'yyyy-MM-dd'),
        },
        currencies,
      },
      data: filteredData,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const filename = this.generateFilename('json', dateRange);
    const blob = new Blob([jsonContent], {
      type: 'application/json;charset=utf-8;',
    });
    fileDownload(blob, filename);
  }

  /**
   * Exports exchange rate data as XML file
   */
  exportDataAsXML(
    data: ExchangeRatesData,
    currencies: string[],
    dateRange: DateRange,
  ): void {
    const filteredData = this.filterData(data, dateRange, currencies);

    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<exchangeRates>\n';
    xmlContent += '  <metadata>\n';
    xmlContent += `    <exportDate>${new Date().toISOString()}</exportDate>\n`;
    xmlContent += '    <dateRange>\n';
    xmlContent += `      <start>${format(dateRange.start, 'yyyy-MM-dd')}</start>\n`;
    xmlContent += `      <end>${format(dateRange.end, 'yyyy-MM-dd')}</end>\n`;
    xmlContent += '    </dateRange>\n';
    xmlContent += '    <currencies>\n';
    currencies.forEach((currency) => {
      xmlContent += `      <currency>${currency.toUpperCase()}</currency>\n`;
    });
    xmlContent += '    </currencies>\n';
    xmlContent += '  </metadata>\n';
    xmlContent += '  <data>\n';

    Object.keys(filteredData)
      .sort()
      .forEach((date) => {
        xmlContent += `    <date value="${date}">\n`;
        currencies.forEach((currency) => {
          const rate = filteredData[date]?.[currency];
          if (rate) {
            xmlContent += `      <currency code="${currency.toUpperCase()}">\n`;
            xmlContent += `        <buy>${rate.buy || ''}</buy>\n`;
            xmlContent += `        <sell>${rate.sell || ''}</sell>\n`;
            xmlContent += '      </currency>\n';
          }
        });
        xmlContent += '    </date>\n';
      });

    xmlContent += '  </data>\n';
    xmlContent += '</exchangeRates>\n';

    const filename = this.generateFilename('xml', dateRange);
    const blob = new Blob([xmlContent], {
      type: 'application/xml;charset=utf-8;',
    });
    fileDownload(blob, filename);
  }

  // === CHART EXPORTS ===

  /**
   * Export chart as PNG
   */
  async exportChartAsPNG(
    chartElement: HTMLElement,
    filename?: string,
  ): Promise<void> {
    try {
      const { default: html2canvas } = await import('html2canvas');

      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const name = filename || this.generateChartFilename('png');
          fileDownload(blob, name);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting chart as PNG:', error);
      throw error;
    }
  }

  /**
   * Export chart as SVG
   */
  async exportChartAsSVG(
    chartElement: HTMLElement,
    filename?: string,
  ): Promise<void> {
    try {
      const canvas = chartElement.querySelector('canvas');
      if (!canvas) throw new Error('Canvas not found');

      const imgData = canvas.toDataURL('image/png');
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
             width="${canvas.width}" height="${canvas.height}">
          <image xlink:href="${imgData}" width="${canvas.width}" height="${canvas.height}"/>
        </svg>
      `;

      const name = filename || this.generateChartFilename('svg');
      fileDownload(svgString, name);
    } catch (error) {
      console.error('Error exporting chart as SVG:', error);
      throw error;
    }
  }

  /**
   * Export chart as PDF
   */
  async exportChartAsPDF(
    chartElement: HTMLElement,
    filename?: string,
  ): Promise<void> {
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 15, 15, imgWidth, imgHeight);

      const name = filename || this.generateChartFilename('pdf');
      pdf.save(name);
    } catch (error) {
      console.error('Error exporting chart as PDF:', error);
      throw error;
    }
  }
}

// Export convenience functions and singleton instance
export const exportService = ExportService.getInstance();

// Convenience functions for easier imports
export const {
  exportDataAsCSV,
  exportDataAsJSON,
  exportDataAsXML,
  exportChartAsPNG,
  exportChartAsSVG,
  exportChartAsPDF,
} = exportService;
