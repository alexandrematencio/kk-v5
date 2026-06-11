<template>
  <div class="layout">
    <slot />
  </div>
</template>

<style scoped>
/* SiteNav is fixed and global (app.vue) — inner pages clear it with padding */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: var(--nav-height);
  background: var(--color-bg);
}
</style>
