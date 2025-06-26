<template>
  <div class="relative">
    <button
      class="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      @click="toggleDropdown"
    >
      <component :is="currentIcon" class="w-4 h-4" />
      <span class="text-sm font-medium">{{ currentLabel }}</span>
      <ChevronDown class="w-4 h-4" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="py-1">
        <button
          v-for="option in themeOptions"
          :key="option.value"
          class="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :class="{ 'bg-gray-100 dark:bg-gray-700': theme === option.value }"
          @click="selectTheme(option.value)"
        >
          <component :is="option.icon" class="w-4 h-4" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme';

const { theme, setTheme } = useTheme();
const isOpen = ref(false);

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
  if (!(event.target as Element).closest('.relative')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>
