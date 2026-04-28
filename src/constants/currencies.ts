import type { Currency } from '@/types';

// Currency metadata. `scale` = how many units of foreign currency the bonbast price represents.
// E.g. JPY is quoted per 10 yen, AMD per 10 dram, IQD per 100 dinar.
export const CURRENCIES: Currency[] = [
  { code: 'usd', name: 'US Dollar', flag: '🇺🇸', scale: 1 },
  { code: 'eur', name: 'Euro', flag: '🇪🇺', scale: 1 },
  { code: 'gbp', name: 'British Pound', flag: '🇬🇧', scale: 1 },
  { code: 'chf', name: 'Swiss Franc', flag: '🇨🇭', scale: 1 },
  { code: 'cad', name: 'Canadian Dollar', flag: '🇨🇦', scale: 1 },
  { code: 'aud', name: 'Australian Dollar', flag: '🇦🇺', scale: 1 },
  { code: 'sek', name: 'Swedish Krona', flag: '🇸🇪', scale: 1 },
  { code: 'nok', name: 'Norwegian Krone', flag: '🇳🇴', scale: 1 },
  { code: 'rub', name: 'Russian Ruble', flag: '🇷🇺', scale: 1 },
  { code: 'thb', name: 'Thai Baht', flag: '🇹🇭', scale: 1 },
  { code: 'sgd', name: 'Singapore Dollar', flag: '🇸🇬', scale: 1 },
  { code: 'hkd', name: 'Hong Kong Dollar', flag: '🇭🇰', scale: 1 },
  { code: 'azn', name: 'Azerbaijani Manat', flag: '🇦🇿', scale: 1 },
  { code: 'amd', name: 'Armenian Dram', flag: '🇦🇲', scale: 10 },
  { code: 'dkk', name: 'Danish Krone', flag: '🇩🇰', scale: 1 },
  { code: 'aed', name: 'UAE Dirham', flag: '🇦🇪', scale: 1 },
  { code: 'jpy', name: 'Japanese Yen', flag: '🇯🇵', scale: 10 },
  { code: 'try', name: 'Turkish Lira', flag: '🇹🇷', scale: 1 },
  { code: 'cny', name: 'Chinese Yuan', flag: '🇨🇳', scale: 1 },
  { code: 'sar', name: 'Saudi Riyal', flag: '🇸🇦', scale: 1 },
  { code: 'inr', name: 'Indian Rupee', flag: '🇮🇳', scale: 1 },
  { code: 'myr', name: 'Malaysian Ringgit', flag: '🇲🇾', scale: 1 },
  { code: 'afn', name: 'Afghan Afghani', flag: '🇦🇫', scale: 1 },
  { code: 'kwd', name: 'Kuwaiti Dinar', flag: '🇰🇼', scale: 1 },
  { code: 'iqd', name: 'Iraqi Dinar', flag: '🇮🇶', scale: 100 },
  { code: 'bhd', name: 'Bahraini Dinar', flag: '🇧🇭', scale: 1 },
  { code: 'omr', name: 'Omani Rial', flag: '🇴🇲', scale: 1 },
  { code: 'qar', name: 'Qatari Rial', flag: '🇶🇦', scale: 1 },
];

// Iranian gold coins — priced in Toman directly (scale = 1).
export const COINS: Currency[] = [
  { code: 'azadi1', name: 'Azadi', flag: '', scale: 1 },
  { code: 'emami1', name: 'Emami', flag: '', scale: 1 },
  { code: 'azadi1_2', name: '½ Azadi', flag: '', scale: 1 },
  { code: 'azadi1_4', name: '¼ Azadi', flag: '', scale: 1 },
  { code: 'azadi1g', name: 'Gerami', flag: '', scale: 1 },
];

// Combined list used for data-loading and lookups.
export const ALL_CURRENCIES: Currency[] = [...CURRENCIES, ...COINS];

export const CURRENCY_BY_CODE: Record<string, Currency> = Object.fromEntries(
  ALL_CURRENCIES.map((c) => [c.code, c]),
);

// Pseudo-currency used for "held in Toman" / base-unit rows.
export const TOMAN: Currency = {
  code: 'irr',
  name: 'Toman',
  flag: '🇮🇷',
  scale: 1,
};

// Consistent color-per-currency (OKLCH, shared chroma/lightness, varying hue).
export function colorFor(code: string, dark = true): string {
  const idx = ALL_CURRENCIES.findIndex((c) => c.code === code);
  const hue = (idx * 37) % 360;
  const L = dark ? 0.78 : 0.55;
  const C = 0.14;
  return `oklch(${L} ${C} ${hue})`;
}
