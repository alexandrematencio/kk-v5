<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const baseURL = useRuntimeConfig().app.baseURL
const sectionRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => {
    if (!sectionRef.value) return

    gsap.fromTo('.cta-thai-word, .cta-headline, .cta-actions',
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      },
    )
  })
})

onBeforeUnmount(() => {
  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger && sectionRef.value?.contains(st.trigger as Node)) st.kill()
  })
})
</script>

<template>
  <section ref="sectionRef" class="footer-section">
    <div class="cta-band">
      <span class="cta-thai-word" aria-hidden="true">มาทานข้าวกัน</span>
      <h2 class="cta-headline">Une table vous attend</h2>
      <div class="cta-actions">
        <NuxtLink to="/reserver" class="cta-pill cta-pill-solid">Réserver</NuxtLink>
        <NuxtLink to="/commander" class="cta-pill">Commander</NuxtLink>
      </div>
    </div>

    <footer class="footer">
      <p>12 avenue de la République, Villejuif</p>
      <p class="hours">Ouvert 7j/7 · 11h30–14h30 · 18h30–22h30</p>
      <p class="credit">
        Concept, design &amp; development by
        <img :src="`${baseURL}logos/logo-aaxlo.svg`" alt="AAXLO" class="aaxlo-logo" />
      </p>
    </footer>
  </section>
</template>

<style scoped>
.footer-section {
  background: var(--color-blue);
  color: var(--color-cream);
}

.cta-band {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 7rem 2rem 5rem;
}

.cta-thai-word {
  font-size: clamp(1.1rem, 2.5vw, 1.6rem);
  color: var(--color-thai-on-blue);
  margin-bottom: 0.75rem;
}

.cta-headline {
  font-size: clamp(2.25rem, 6.5vw, 4.5rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0.01em;
  margin-bottom: 2.5rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.cta-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 44px;
  border: 1px solid var(--color-cream);
  border-radius: 60px;
  text-decoration: none;
  color: var(--color-cream);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  overflow: hidden;
  transition: color 0.35s ease;
}

.cta-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-cream);
  border-radius: 60px;
  transform: translateY(101%);
  transition: transform 0.45s var(--ease-out-expo);
}

.cta-pill:hover::before { transform: translateY(0); }
.cta-pill:hover { color: var(--color-blue); }

.cta-pill span,
.cta-pill { z-index: 0; }

.cta-pill-solid {
  background: var(--color-cream);
  color: var(--color-blue);
}

.cta-pill-solid::before {
  background: var(--color-thai-on-blue);
}

.cta-pill-solid:hover {
  color: var(--color-cream);
  border-color: var(--color-thai-on-blue);
}

/* Pill labels above the fill layer */
.cta-pill { isolation: isolate; }
.cta-pill::before { z-index: -1; }

.footer {
  padding: 3rem 2rem 2.5rem;
  text-align: center;
  border-top: 1px solid rgba(250, 244, 239, 0.2);
}

.footer p {
  font-size: 0.85rem;
  opacity: 0.65;
  margin-bottom: 0.5rem;
}

.footer .hours {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

.footer .credit {
  margin-top: 1.5rem;
  font-weight: 400;
  font-size: 0.75rem;
}

.footer .aaxlo-logo {
  display: inline-block;
  height: 0.75em;
  width: auto;
  vertical-align: -0.02em;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

@media (max-width: 768px) {
  .cta-band {
    padding: 5rem 1.25rem 3.5rem;
  }

  .cta-pill {
    padding: 12px 32px;
    font-size: 0.9rem;
  }
}
</style>
