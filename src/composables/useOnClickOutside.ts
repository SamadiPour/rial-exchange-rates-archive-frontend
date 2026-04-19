import { onBeforeUnmount, onMounted, type Ref } from 'vue';

export function useOnClickOutside(
  target: Ref<HTMLElement | null>,
  handler: () => void,
) {
  function onDown(e: MouseEvent) {
    if (!target.value) return;
    if (!target.value.contains(e.target as Node)) handler();
  }
  onMounted(() => document.addEventListener('mousedown', onDown));
  onBeforeUnmount(() => document.removeEventListener('mousedown', onDown));
}
