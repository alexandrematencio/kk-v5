<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const sectionRef = ref<HTMLElement | null>(null)

const words = [
  { thai: 'สดชื่น', latin: 'Fraîcheur', tagline: 'Ingrédients sélectionnés chaque matin' },
  { thai: 'ร้อน', latin: 'Feu', tagline: 'Wok poussé à haute température' },
  { thai: 'รัก', latin: 'Passion', tagline: 'Cuisine préparée avec cœur' },
]

onMounted(() => {
  initScrollReveal()
  initBounceAnimation()
})

onBeforeUnmount(() => {
  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger && sectionRef.value?.contains(st.trigger as Node)) st.kill()
  })
})

function initScrollReveal() {
  if (!sectionRef.value) return

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
    },
  })

  words.forEach((_, i) => {
    if (i > 0) tl.to({}, { duration: 0.1 })
    // Thai appears first, Latin lands over it — the brand's bilingual device
    tl.fromTo(`.word-group-${i} .thai-layer`,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 },
    )
    tl.fromTo(`.word-group-${i} .latin-layer`,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 },
      '>',
    )
    tl.fromTo(`.tagline-${i}`, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' }, '<')
    const others = words.map((__, j) => `.tagline-${j}`).filter((__, j) => j !== i).join(', ')
    tl.to(others, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '<')
  })
}

function initBounceAnimation() {
  gsap.to('.scroll-indicator', {
    y: 12,
    duration: 1.2,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  })
}

function scrollToNext() {
  window.scrollTo({
    top: window.scrollY + window.innerHeight * 0.8,
    behavior: 'smooth',
  })
}
</script>

<template>
  <section id="philosophie" ref="sectionRef" class="philosophy-section">
    <div class="philosophy-container">
      <div class="label">Notre philosophie</div>

      <div class="words-stack">
        <div
          v-for="(word, i) in words"
          :key="word.latin"
          class="word-group"
          :class="`word-group-${i}`"
        >
          <span class="thai-layer">{{ word.thai }}</span>
          <span class="latin-layer">{{ word.latin }}</span>
        </div>
      </div>

      <div class="taglines-wrapper">
        <p
          v-for="(word, i) in words"
          :key="word.tagline"
          class="philosophy-tagline"
          :class="`tagline-${i}`"
        >
          {{ word.tagline }}
        </p>
      </div>

      <div class="scroll-indicator" @click="scrollToNext">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  </section>
</template>

<style scoped>
.philosophy-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-alt);
  padding: 4rem 2rem;
}

.philosophy-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 0.65rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  opacity: 0.4;
  margin-bottom: 2.5rem;
  color: var(--color-blue);
  font-weight: 500;
}

.words-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.word-group {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.thai-layer {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 400;
  color: var(--color-thai);
  opacity: 0;
  line-height: 1.1;
  position: relative;
}

.latin-layer {
  font-size: clamp(2.25rem, 7.5vw, 3.75rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-blue);
  line-height: 1.1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  opacity: 0;
}

.philosophy-tagline {
  font-size: 1.125rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  opacity: 0;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  text-align: center;
  max-width: min(90vw, 600px);
  width: max-content;
  line-height: 1.4;
}

.taglines-wrapper {
  position: relative;
  height: 3rem;
  margin-top: 2rem;
  width: 100%;
}

@media (max-width: 600px) {
  .philosophy-tagline {
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    width: auto;
    max-width: 90vw;
  }

  .taglines-wrapper {
    height: 4.5rem;
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  color: var(--color-blue);
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.scroll-indicator:hover {
  opacity: 1;
}
</style>
