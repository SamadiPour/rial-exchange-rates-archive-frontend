export interface Currency {
  code: string;
  name: string;
  flag: string;
  scale: number;
}

export type PriceType = 'buy' | 'sell' | 'mid';
export type Scale = 'linear' | 'log';
export type Mode = 'absolute' | 'indexed' | 'roi';
export type Calendar = 'gregorian' | 'jalali';
export type Theme = 'dark' | 'light';
export type PresetId =
  | '7d'
  | '30d'
  | '3m'
  | '6m'
  | '1y'
  | '5y'
  | 'all'
  | 'custom';

export interface CurrencySeries {
  buy: Float64Array;
  sell: Float64Array;
}

export interface ExchangeData {
  dates: string[];
  index: Map<string, number>;
  series: Record<string, CurrencySeries>;
}

export interface Annotation {
  date: string;
  label: string;
  color: string;
}

export interface Preset {
  id: PresetId;
  label: string;
  days: number | null;
}
