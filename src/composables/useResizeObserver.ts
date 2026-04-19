import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

export function useElementWidth(
  el: Ref<HTMLElement | null>,
  initial = 900,
  min = 320,
) {
  const width = ref(initial);
  let ro: ResizeObserver | null = null;

  onMounted(() => {
    if (!el.value) return;
    width.value = Math.max(
      min,
      Math.floor(el.value.getBoundingClientRect().width),
    );
    ro = new ResizeObserver((entries) => {
      for (const e of entries)
        width.value = Math.max(min, Math.floor(e.contentRect.width));
    });
    ro.observe(el.value);
  });

  onBeforeUnmount(() => {
    ro?.disconnect();
  });

  return width;
}

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
