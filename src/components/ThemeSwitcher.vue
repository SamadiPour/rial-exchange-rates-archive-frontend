<template>
  <div ref="switcherRef" class="relative">
    <button
      class="flex items-center space-x-1.5 px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      @click="toggleDropdown"
    >
      <component :is="currentIcon" class="w-4 h-4" />
      <ChevronDown
        class="w-3 h-3 opacity-60 transition-transform duration-150"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 z-50"
      >
        <div class="py-1">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            class="flex items-center space-x-2.5 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            :class="{
              'text-green-600 dark:text-green-500': theme === option.value,
            }"
            @click="selectTheme(option.value)"
          >
            <component :is="option.icon" class="w-4 h-4" />
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme';

const { theme, setTheme } = useTheme();
const isOpen = ref(false);
const switcherRef = ref<HTMLElement | null>(null);

const themeOptions = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
];

const currentOption = computed(
  () =>
    themeOptions.find((option) => option.value === theme.value) ||
    themeOptions[2],
);

const currentIcon = computed(() => currentOption.value.icon);
const currentLabel = computed(() => currentOption.value.label);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectTheme = (value: 'light' | 'dark' | 'system') => {
  setTheme(value);
  isOpen.value = false;
};

const closeDropdown = (event: Event) => {
  if (switcherRef.value && !switcherRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown, true);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown, true);
});
</script>
