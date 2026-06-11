<script setup lang="ts">
defineProps<{
  eyebrow?: string
  thai: string
  latin: string
}>()
</script>

<template>
  <header class="page-header">
    <p v-if="eyebrow" class="page-eyebrow">{{ eyebrow }}</p>
    <span class="page-thai">{{ thai }}</span>
    <h1 class="page-title">{{ latin }}</h1>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 5rem 1rem 4rem;
  max-width: 1100px;
  margin: 0 auto;
}

.page-eyebrow {
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #001B95;
  font-weight: 500;
  opacity: 0.45;
  margin-bottom: 1.25rem;
}

.page-thai {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 400;
  color: #E22B02;
  line-height: 1.1;
  margin-bottom: 0.25rem;
}

.page-title {
  font-family: 'Inter', sans-serif;
  font-size: clamp(2.75rem, 8vw, 5rem);
  font-weight: 700;
  color: #001B95;
  letter-spacing: 0.02em;
  line-height: 1;
  margin: 0;
}

@media (max-width: 768px) {
  .page-header {
    padding: 3rem 1rem 2.5rem;
  }
}
</style>
