<script setup lang="ts">
import { gsap } from 'gsap'

const baseURL = useRuntimeConfig().app.baseURL

// Plays on hard refresh only — persists across client-side navigation
const splashPlayed = useState('splashPlayed', () => false)
// Flipped at the START of the curtain reveal so the hero animates underneath
const splashDone = useState('splashDone', () => false)

const show = ref(!splashPlayed.value)
const root = ref<HTMLElement | null>(null)

// Grapheme-safe split — Thai combining vowels (ั, ี) must stay attached to their base char
const greetingChars = typeof Intl !== 'undefined' && 'Segmenter' in Intl
  ? Array.from(new Intl.Segmenter('th', { granularity: 'grapheme' }).segment('สวัสดี'), s => s.segment)
  : ['ส', 'วั', 'ส', 'ดี']

let failsafe: ReturnType<typeof setTimeout> | null = null

function finish() {
  splashDone.value = true
  splashPlayed.value = true
  show.value = false
  document.body.style.overflow = ''
  ;(window as any).__lenis?.start()
}

onMounted(() => {
  if (!show.value) {
    splashDone.value = true
    return
  }

  // Intro is a homepage ritual — deep links (réserver, commander…) go straight in
  const onHome = useRoute().path === '/'
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!onHome || reduced) {
    finish()
    return
  }

  document.body.style.overflow = 'hidden'

  // Failsafe independent of the GSAP ticker: the splash can never strand the page
  failsafe = setTimeout(() => {
    if (show.value) finish()
  }, 5200)

  const el = root.value!
  const chars = el.querySelectorAll('.greet-char')
  const fr = el.querySelector('.greet-fr')
  const rule = el.querySelector('.splash-rule')
  const logo = el.querySelector('.splash-logo-wrap')

  gsap.set(chars, { yPercent: 110, opacity: 0 })
  gsap.set(fr, { y: 16, opacity: 0 })
  gsap.set(rule, { scaleX: 0 })
  gsap.set(logo, { y: 90, opacity: 0 })

  const tl = gsap.timeline()

  // 1. Thai greeting rises char by char
  tl.to(chars, {
    yPercent: 0,
    opacity: 1,
    duration: 0.55,
    stagger: 0.07,
    ease: 'power3.out',
  })
  // 2. French line + rule draw, overlapped
  tl.to(fr, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.25')
  tl.to(rule, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, '<')

  // 3. Wordmark rises with the brand's back.out signature
  tl.to(logo, {
    y: 0,
    opacity: 1,
    duration: 0.85,
    ease: 'back.out(1.4)',
  }, '+=0.15')

  // 4. Breath, then the greeting drifts up and away
  tl.to([chars, fr, rule], {
    y: -24,
    opacity: 0,
    duration: 0.45,
    stagger: 0.012,
    ease: 'power2.in',
  }, '+=0.45')

  // 5. Curtain reveal — hero starts its entrance underneath at the same moment
  tl.add(() => { splashDone.value = true })
  tl.to(el, {
    clipPath: 'inset(0 0 100% 0)',
    duration: 0.85,
    ease: 'power3.inOut',
  }, '<+0.1')
  tl.to(logo, { y: -60, duration: 0.85, ease: 'power3.inOut' }, '<')
  tl.add(() => {
    if (failsafe) clearTimeout(failsafe)
    finish()
  })
})

onBeforeUnmount(() => {
  if (failsafe) clearTimeout(failsafe)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="show" ref="root" class="splash" aria-hidden="true">
    <div class="splash-inner">
      <p class="greeting">
        <span class="greet-thai">
          <span v-for="(c, i) in greetingChars" :key="i" class="greet-char">{{ c }}</span>
        </span>
        <span class="greet-fr">Bienvenue chez</span>
      </p>
      <span class="splash-rule"></span>
      <div class="splash-logo-wrap">
        <img
          :src="`${baseURL}logos/logo-khan-kluay-v2.svg`"
          alt=""
          class="splash-logo"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--color-cream);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  clip-path: inset(0 0 0 0);
}

.splash-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 0 16px;
}

.greeting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.greet-thai {
  display: inline-flex;
  overflow: hidden;
  font-size: clamp(3rem, 9vw, 6rem);
  line-height: 1.25;
  color: var(--color-thai);
  font-weight: 400;
}

.greet-char {
  display: inline-block;
  will-change: transform, opacity;
}

.greet-fr {
  font-size: clamp(0.75rem, 1.6vw, 0.95rem);
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--color-blue);
  font-weight: 500;
}

.splash-rule {
  display: block;
  width: clamp(120px, 22vw, 260px);
  height: 1px;
  background: var(--color-text);
  opacity: 0.35;
  transform: scaleX(0);
  transform-origin: center;
}

/* No width on the wrap — the img drives sizing (playbook: splash centering) */
.splash-logo-wrap {
  position: relative;
  will-change: transform, opacity;
}

.splash-logo {
  display: block;
  width: clamp(260px, 56vw, 820px);
  max-width: calc(100vw - 32px);
  height: auto;
}
</style>
