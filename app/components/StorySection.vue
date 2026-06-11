<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const sectionRef = ref<HTMLElement | null>(null)
const { scrollTo } = useLenis()

const blocks = [
  {
    thai: 'ครอบครัว',
    latin: 'La famille',
    headline: 'Douze années à votre table.',
    text: 'Un restaurant tenu par une famille thaïlandaise — pas par des employés qui viennent et repartent. Chaque service est un retour à la maison.',
  },
  {
    thai: 'มรดก',
    latin: "L'héritage",
    headline: 'De recette en recette.',
    text: "Chaque plat retrace un souvenir, chaque épice raconte une histoire transmise de génération en génération. Ce qu'on cuisine ici, c'est ce qu'on a appris à la maison.",
  },
  {
    thai: 'บ้าน',
    latin: 'Notre maison',
    headline: 'Au cœur de Villejuif.',
    text: "Près du centre et de la mairie, à deux pas du boulevard Maxime Gorki. Facile d'accès en métro ou en voiture — on a hâte de vous accueillir.",
  },
]

function scrollToMenu() {
  scrollTo('#menu')
}

onMounted(() => {
  nextTick(initAnimation)
})

onBeforeUnmount(() => {
  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger && sectionRef.value?.contains(st.trigger as Node)) st.kill()
  })
})

function initAnimation() {
  if (!sectionRef.value) return

  gsap.fromTo('.story-eyebrow, .story-thai, .story-title',
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    },
  )

  // Each block: rule draws, then content rises with alternating drift
  sectionRef.value.querySelectorAll('.story-block').forEach((block, i) => {
    const rule = block.querySelector('.block-rule')
    const content = block.querySelectorAll('.block-label, .block-headline, .block-text')

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    })

    if (rule) {
      tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' })
    }
    tl.fromTo(content,
      { opacity: 0, x: i % 2 === 0 ? 36 : -36 },
      { opacity: 1, x: 0, duration: 0.65, stagger: 0.1, ease: 'power3.out' },
      '-=0.35',
    )
  })

  gsap.fromTo('.story-cta',
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.story-cta',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    },
  )
}
</script>

<template>
  <section ref="sectionRef" class="story-section">
    <div class="story-container">
      <header class="story-header">
        <p class="story-eyebrow">Une famille à votre table</p>
        <span class="story-thai">เรื่องราว</span>
        <h2 class="story-title">Histoire</h2>
      </header>

      <div class="story-body">
        <article v-for="block in blocks" :key="block.latin" class="story-block">
          <span class="block-rule" aria-hidden="true"></span>
          <p class="block-label">
            <span class="block-thai">{{ block.thai }}</span>
            <span class="block-dot">·</span>
            <span class="block-latin">{{ block.latin }}</span>
          </p>
          <p class="block-headline">{{ block.headline }}</p>
          <p class="block-text">{{ block.text }}</p>
        </article>
      </div>

      <button class="story-cta" @click="scrollToMenu">
        <span class="cta-text">Découvrez notre carte ↓</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.story-section {
  padding: 8rem 2rem 6rem;
  background: var(--color-cream);
  color: var(--color-text);
}

.story-container {
  max-width: 800px;
  margin: 0 auto;
}

.story-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 5rem;
}

.story-eyebrow {
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-blue);
  font-weight: 500;
  opacity: 0.45;
  margin-bottom: 1.25rem;
}

.story-thai {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 400;
  color: var(--color-thai);
  line-height: 1.1;
  margin-bottom: 0.25rem;
}

.story-title {
  font-size: clamp(2.75rem, 7vw, 5rem);
  font-weight: 700;
  color: var(--color-blue);
  letter-spacing: 0.02em;
  line-height: 1;
  margin: 0;
}

.story-body {
  display: flex;
  flex-direction: column;
  margin-bottom: 4rem;
}

.story-block {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 3rem 0;
}

.block-rule {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border);
  transform: scaleX(0);
  transform-origin: left;
}

.story-block:first-child .block-rule {
  display: none;
}

.story-block:first-child {
  padding-top: 0;
}

.block-label {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0 0 0.25rem;
  flex-wrap: wrap;
}

.block-thai {
  font-size: 1.05rem;
  color: var(--color-thai);
  font-weight: 400;
}

.block-dot {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.block-latin {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-blue);
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.block-headline {
  font-size: clamp(1.75rem, 4.5vw, 2.75rem);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.1;
  letter-spacing: 0.01em;
  margin: 0;
}

.block-text {
  font-size: 1rem;
  color: var(--color-text-muted);
  line-height: 1.65;
  max-width: 60ch;
  margin: 0;
}

.story-cta {
  display: block;
  margin: 2rem auto 0;
  padding: 14px 40px;
  background: var(--color-surface);
  border: 1px solid var(--color-text);
  border-radius: 60px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-body);
}

.story-cta:hover {
  background: var(--color-blue);
  border-color: var(--color-blue);
}

.story-cta:hover .cta-text {
  color: #fff;
}

.cta-text {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1;
  font-weight: 500;
  color: var(--color-blue);
  letter-spacing: 0.1em;
  white-space: nowrap;
  transition: color 0.2s ease;
}

@media (max-width: 768px) {
  .story-section {
    padding: 5rem 1.25rem 4rem;
  }

  .story-header {
    margin-bottom: 3rem;
  }

  .story-body {
    margin-bottom: 3rem;
  }

  .story-block {
    padding: 2.25rem 0;
  }
}

@media (max-width: 480px) {
  .story-cta {
    padding: 12px 28px;
  }

  .cta-text {
    font-size: 0.9rem;
    letter-spacing: 0.08em;
  }
}
</style>
