<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>

<template>
  <div
    class="h-full min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 transition-colors"
  >
    <RouterView />
  </div>
</template>
