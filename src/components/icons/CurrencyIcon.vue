<script setup lang="ts">
import CoinIcon from './CoinIcon.vue';

defineProps<{
  /** Flag emoji for fiat currencies; empty string for coins. */
  flag: string;
  code: string;
  size?: string | number;
}>();
</script>

<template>
  <CoinIcon v-if="!flag" :code="code" :size="size" />
  <span v-else aria-hidden="true">{{ flag }}</span>
</template>
