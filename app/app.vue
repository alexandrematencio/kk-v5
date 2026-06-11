<script setup lang="ts">
onMounted(() => {
  window.scrollTo(0, 0)
  window.onbeforeprint = () => window.scrollTo(0, 0)
})
</script>

<template>
  <SplashScreen />
  <SiteNav />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  /* Brand Colors from BRANDING.md (kk-v1) */
  --color-bg: #F7F7F7;
  --color-cream: #FAF4EF;
  --color-surface: #FFFFFF;
  --color-surface-alt: #F5F3EF;
  --color-text: #1A1A1E;
  --color-text-muted: #6B6B6B;
  --color-accent: #A51931;
  --color-accent-hover: #8B1528;
  --color-thai: #E22B02;
  --color-thai-on-blue: #FF6B4A;
  --color-blue: #001B95;
  --color-primary: #241D4F;
  --color-border: #E5E3DE;
  --color-border-light: #F0EDE8;

  /* Typography */
  --font-body: 'Inter', sans-serif;
  --font-heading: 'Inter', sans-serif;

  /* Layout */
  --nav-height: 72px;

  /* Motion */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: auto; }

html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: hidden; }

body {
  font-family: var(--font-body);
  font-weight: 400;
  background: var(--color-cream);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
}

::selection {
  background: var(--color-blue);
  color: var(--color-cream);
}

/* Light cross-fade between pages — deliberately never an opaque cover */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
