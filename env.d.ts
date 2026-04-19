/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module 'jalaali-js' {
  export function toJalaali(
    gy: number | Date,
    gm?: number,
    gd?: number,
  ): { jy: number; jm: number; jd: number };
  export function toGregorian(
    jy: number,
    jm: number,
    jd: number,
  ): { gy: number; gm: number; gd: number };
  export function jalaaliMonthLength(jy: number, jm: number): number;
}
