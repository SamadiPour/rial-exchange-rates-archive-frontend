import type { ExchangeData, PriceType } from '@/types';
import { CURRENCIES, CURRENCY_BY_CODE } from '@/constants/currencies';

// jsDelivr mirrors of the data branch of the archive repo (CORS-friendly).
const DATA_URL =
  'https://cdn.jsdelivr.net/gh/SamadiPour/rial-exchange-rates-archive@data/gregorian_all.min.json';
const DATA_URL_FULL =
  'https://cdn.jsdelivr.net/gh/SamadiPour/rial-exchange-rates-archive@data/gregorian_all.json';

interface RawEntry {
  buy?: number;
  sell?: number;
  b?: number;
  s?: number;
}
type RawData = Record<string, Record<string, RawEntry>>;

export async function loadExchangeData(): Promise<ExchangeData> {
  let raw: RawData;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('min fetch failed');
    raw = (await res.json()) as RawData;
  } catch {
    const res = await fetch(DATA_URL_FULL);
    raw = (await res.json()) as RawData;
  }

  const keys = Object.keys(raw).sort();
  const dates = keys.map((k) => k.replace(/\//g, '-'));

  const series: ExchangeData['series'] = {};
  for (const c of CURRENCIES) {
    series[c.code] = {
      buy: new Float64Array(keys.length),
      sell: new Float64Array(keys.length),
    };
  }

  for (let i = 0; i < keys.length; i++) {
    const row = raw[keys[i]];
    if (!row) continue;
    for (const c of CURRENCIES) {
      const entry = row[c.code];
      if (!entry) {
        if (i > 0) {
          series[c.code].buy[i] = series[c.code].buy[i - 1];
          series[c.code].sell[i] = series[c.code].sell[i - 1];
        } else {
          series[c.code].buy[i] = NaN;
          series[c.code].sell[i] = NaN;
        }
        continue;
      }
      const buy = entry.buy ?? entry.b ?? NaN;
      const sell = entry.sell ?? entry.s ?? NaN;
      series[c.code].buy[i] =
        buy > 0 ? buy : i > 0 ? series[c.code].buy[i - 1] : NaN;
      series[c.code].sell[i] =
        sell > 0 ? sell : i > 0 ? series[c.code].sell[i - 1] : NaN;
    }
  }

  const index = new Map<string, number>();
  dates.forEach((d, i) => index.set(d, i));

  return { dates, index, series };
}

// Binary search: closest index at-or-before a given YYYY-MM-DD.
export function findIndexAtOrBefore(dates: string[], iso: string): number {
  let lo = 0;
  let hi = dates.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (dates[mid] <= iso) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

// Returns a picker (idx) => Toman-value-of-1-unit for the given code+priceType.
// Hoists map lookups + scale division out of tight loops.
export function priceOf(
  data: ExchangeData,
  code: string,
  priceType: PriceType = 'buy',
): (idx: number) => number {
  const s = data.series[code];
  if (!s) return () => NaN;
  const scale = CURRENCY_BY_CODE[code]?.scale || 1;
  if (priceType === 'sell') return (i) => s.sell[i] / scale;
  if (priceType === 'mid') return (i) => (s.sell[i] + s.buy[i]) / 2 / scale;
  return (i) => s.buy[i] / scale;
}

// Value (in Toman) that 1 unit of `code` is worth at `idx`.
// Normalizes by `scale` (e.g. JPY quoted per 10 yen).
export function rateAt(
  data: ExchangeData,
  code: string,
  idx: number,
  priceType: PriceType = 'buy',
): number {
  return priceOf(data, code, priceType)(idx);
}
