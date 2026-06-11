<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const baseURL = useRuntimeConfig().app.baseURL
const { scrollTo } = useLenis()

const splashDone = useState('splashDone', () => false)

const heroRef = ref<HTMLElement | null>(null)
const ctaBtn = ref<HTMLButtonElement>()
const ctaSize = ref({ w: 0, h: 0 })
let ctaRO: ResizeObserver | null = null

function scrollToPhilosophy() {
  scrollTo('#philosophie')
}

function playEntrance() {
  const tl = gsap.timeline()

  tl.fromTo('.hero-dish-wrap',
    { clipPath: 'inset(100% 0 0 0)', y: 40 },
    { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 0.9, ease: 'power3.out' },
    0,
  )
  tl.fromTo('.cuisine-text',
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
    0.35,
  )
  // Wordmark rise — the kk-v1 signature
  tl.fromTo('.hero-display-title',
    { y: 300 },
    { y: 0, duration: 0.9, ease: 'back.out(1.7)' },
    0.15,
  )
  tl.fromTo('.scroll-cta',
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(4)' },
    '-=0.2',
  )
}

function initScrub() {
  if (!heroRef.value) return

  // Counter-parallax: watermark drifts down, dish lifts, wordmark sinks
  gsap.to('.hero-watermark', {
    yPercent: 26,
    ease: 'none',
    scrollTrigger: {
      trigger: heroRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })

  gsap.to('.hero-dish-wrap', {
    yPercent: -14,
    ease: 'none',
    scrollTrigger: {
      trigger: heroRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })

  gsap.to('.hero-display-title', {
    yPercent: 22,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: {
      trigger: heroRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
}

onMounted(() => {
  if (splashDone.value) {
    playEntrance()
  }
  else {
    gsap.set('.hero-dish-wrap', { clipPath: 'inset(100% 0 0 0)' })
    gsap.set('.cuisine-text', { opacity: 0 })
    gsap.set('.hero-display-title', { y: 300 })
    gsap.set('.scroll-cta', { opacity: 0 })
    const unwatch = watch(splashDone, (done) => {
      if (done) {
        playEntrance()
        unwatch()
      }
    })
  }

  initScrub()

  if (ctaBtn.value) {
    const update = () => {
      if (!ctaBtn.value) return
      ctaSize.value = {
        w: ctaBtn.value.offsetWidth,
        h: ctaBtn.value.offsetHeight,
      }
    }
    update()
    ctaRO = new ResizeObserver(update)
    ctaRO.observe(ctaBtn.value)
  }
})

onUnmounted(() => {
  ctaRO?.disconnect()
  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger && heroRef.value?.contains(st.trigger as Node)) st.kill()
  })
})
</script>

<template>
  <section ref="heroRef" class="hero">
    <span class="hero-watermark" aria-hidden="true">ก้านกล้วย</span>

    <div class="hero-content">
      <div class="hero-bloc">
        <div class="hero-dish-wrap">
          <picture>
            <source media="(max-width: 768px)" :srcset="`${baseURL}images/hero/responsive-mobile-img.png`" />
            <img
              :src="`${baseURL}images/hero/hero-banner-img.png`"
              alt="Khan Kluay — cuisine thaïlandaise"
              class="hero-img"
            />
          </picture>
        </div>
        <p class="cuisine-text">Cuisine thaïlandaise<img :src="`${baseURL}flag-design.svg`" alt="" class="cuisine-flag" />authentique</p>
        <button ref="ctaBtn" class="scroll-cta" @click="scrollToPhilosophy">
          <svg
            v-if="ctaSize.w > 0 && ctaSize.h > 0"
            class="cta-border"
            :viewBox="`-1 -1 ${ctaSize.w + 2} ${ctaSize.h + 2}`"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect
              class="cta-border-path"
              x="0.5"
              y="0.5"
              :width="ctaSize.w - 1"
              :height="ctaSize.h - 1"
              :rx="Math.max(0, (ctaSize.h - 1) / 2)"
              :ry="Math.max(0, (ctaSize.h - 1) / 2)"
              pathLength="100"
            />
          </svg>
          <span class="cta-text">Découvrir ↓</span>
        </button>
      </div>
    </div>

    <div class="hero-display-title">
      <img
        :src="`${baseURL}logos/logo-khan-kluay-v2.svg`"
        alt="Khan Kluay"
        class="khan-kluay-logo"
      />
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--nav-height) 32px 0;
  overflow: hidden;
  background: var(--color-cream);
}

/* Giant outlined Thai watermark behind everything */
.hero-watermark {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(7rem, 20vw, 19rem);
  font-weight: 700;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px rgba(0, 27, 149, 0.08);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  z-index: 1;
  will-change: transform;
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1;
}

.hero-bloc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 1rem 0;
}

.hero-dish-wrap {
  will-change: transform, clip-path;
  text-align: center;
}

.hero-img {
  max-width: 85%;
  height: auto;
  max-height: min(305px, 30svh);
  width: auto;
}

.cuisine-text {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 500;
  color: var(--color-blue);
}

.cuisine-flag {
  display: inline-block;
  height: calc(1em / 1.2);
  width: auto;
  vertical-align: -0.1em;
  margin: 0 0.25em;
}

.scroll-cta {
  position: relative;
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 40px;
  background: var(--color-surface);
  border: 1px solid var(--color-text);
  border-radius: 60px;
  cursor: pointer;
  transition: border-color 0.25s ease;
}

.scroll-cta:hover {
  border-color: transparent;
}

.cta-border {
  position: absolute;
  inset: -1px;
  pointer-events: none;
  overflow: visible;
}

.cta-border-path {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  /* Hidden at rest so the zero-length dash at the path seam never shows */
  visibility: hidden;
  transition: stroke-dashoffset 0.607s cubic-bezier(0.65, 0, 0.35, 1), visibility 0s linear 0.607s;
}

.scroll-cta:hover .cta-border-path {
  stroke-dashoffset: 0;
  visibility: visible;
  transition: stroke-dashoffset 0.607s cubic-bezier(0.65, 0, 0.35, 1), visibility 0s linear 0s;
}

.cta-text {
  position: relative;
  z-index: 1;
  font-family: var(--font-body);
  font-size: 36px;
  line-height: 1;
  font-weight: 500;
  color: var(--color-blue);
}

.hero-display-title {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 32px;
  height: clamp(160px, 32svh, 340px);
  will-change: transform;
}

.khan-kluay-logo {
  height: 100%;
  width: 100%;
  max-width: none;
  object-fit: fill;
  display: block;
}

@media (max-width: 1024px) {
  .cta-text {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .hero {
    height: auto;
    min-height: 100svh;
    padding: var(--nav-height) 1.25rem 0;
    gap: 1rem;
  }

  .hero-watermark {
    top: 22%;
  }

  .hero-bloc {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 1rem 0;
  }

  .hero-img {
    max-height: none;
    max-width: 82%;
  }

  .cuisine-text {
    font-size: 1rem;
    text-align: center;
    line-height: 1.3;
  }

  .scroll-cta {
    padding: 8px 28px;
  }

  .cta-text {
    font-size: 22px;
    letter-spacing: 0.04em;
  }

  .hero-display-title {
    height: auto;
    padding: 0 0 1rem;
  }

  .khan-kluay-logo {
    height: auto;
    max-height: 160px;
    width: 100%;
    object-fit: contain;
  }
}

@media (max-width: 480px) {
  .khan-kluay-logo {
    max-height: 120px;
  }

  .cta-text {
    font-size: 18px;
  }
}
</style>
