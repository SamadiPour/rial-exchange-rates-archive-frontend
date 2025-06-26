export interface ExchangeRate {
  sell?: number;
  buy?: number;
}

export interface DailyRates {
  [currencyCode: string]: ExchangeRate;
}

export interface ExchangeRatesData {
  [date: string]: DailyRates;
}

export interface Currency {
  code: string;
  name: string;
  flag?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}
