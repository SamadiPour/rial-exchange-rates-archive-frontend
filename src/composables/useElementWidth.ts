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
