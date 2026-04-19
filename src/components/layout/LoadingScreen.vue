<template>
  <div class="loading">
    <div class="loading-inner">
      <div class="loader-dot" />
      <div>Fetching 13 years of daily rates…</div>
      <div class="via">via jsDelivr CDN</div>
    </div>
  </div>
</template>

<style scoped>
.loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: var(--muted);
  font-family: var(--mono-font);
  font-size: 13px;
}

.loading-inner {
  text-align: center;
}

.loader-dot {
  margin: 0 auto 16px;
}

.via {
  margin-top: 6px;
  opacity: 0.6;
  font-family: var(--mono-font);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
