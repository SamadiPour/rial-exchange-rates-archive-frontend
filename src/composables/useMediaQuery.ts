import { onBeforeUnmount, ref } from 'vue';

export function useMediaQuery(query: string) {
  const mql = window.matchMedia(query);
  const matches = ref(mql.matches);
  const handler = (e: MediaQueryListEvent) => (matches.value = e.matches);
  mql.addEventListener('change', handler);
  onBeforeUnmount(() => mql.removeEventListener('change', handler));
  return matches;
}
