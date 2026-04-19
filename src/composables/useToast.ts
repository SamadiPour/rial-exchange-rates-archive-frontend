import { ref } from 'vue';

const toast = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

export function useToast() {
  function show(msg: string, durationMs = 2000) {
    toast.value = msg;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      toast.value = null;
    }, durationMs);
  }
  return { toast, show };
}
