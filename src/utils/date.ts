import { jalaaliMonthLength, toGregorian, toJalaali } from 'jalaali-js';

export function gregorianToJalali(
  gy: number,
  gm: number,
  gd: number,
): [number, number, number] {
  const { jy, jm, jd } = toJalaali(gy, gm, gd);
  return [jy, jm, jd];
}

export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number,
): [number, number, number] {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return [gy, gm, gd];
}

export function isoToJalali(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const [jy, jm, jd] = gregorianToJalali(y, m, d);
  return `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`;
}

export function jalaliDaysInMonth(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm);
}

export function gregorianDaysInMonth(gy: number, gm: number): number {
  return new Date(Date.UTC(gy, gm, 0)).getUTCDate();
}

export const JALALI_MONTH_NAMES = [
  'Farvardin',
  'Ordibehesht',
  'Khordad',
  'Tir',
  'Mordad',
  'Shahrivar',
  'Mehr',
  'Aban',
  'Azar',
  'Dey',
  'Bahman',
  'Esfand',
];

export const GREGORIAN_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function fmtDate(
  iso: string,
  calendar: 'gregorian' | 'jalali' = 'gregorian',
): string {
  if (calendar === 'jalali') return isoToJalali(iso);
  return iso;
}

export function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function clampISO(iso: string, min: string, max: string): string {
  if (iso < min) return min;
  if (iso > max) return max;
  return iso;
}
