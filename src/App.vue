<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>

<template>
  <div
    class="h-full min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors"
  >
    <RouterView />
  </div>
</template>
