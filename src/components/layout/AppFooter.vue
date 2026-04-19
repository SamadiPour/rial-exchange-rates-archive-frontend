<script setup lang="ts">
defineProps<{
  totalDays: number;
  totalCurrencies: number;
}>();
</script>

<template>
  <footer class="foot">
    <div>
      Data:
      <a
        href="https://github.com/SamadiPour/rial-exchange-rates-archive"
        target="_blank"
        rel="noreferrer"
        >SamadiPour/rial-exchange-rates-archive</a
      >
      · Source:
      <a href="https://bonbast.com/" target="_blank" rel="noreferrer"
        >bonbast.com</a
      >
      · All prices are in Toman
    </div>
    <div class="mono-tiny">
      {{ totalDays }} days · {{ totalCurrencies }} currencies
    </div>
  </footer>
</template>

<style scoped>
.foot {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.foot a {
  color: var(--muted);
  border-bottom-color: var(--muted);
}
</style>
