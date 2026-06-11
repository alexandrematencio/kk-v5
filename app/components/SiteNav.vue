<script setup lang="ts">
import { gsap } from 'gsap'

const baseURL = useRuntimeConfig().app.baseURL
const route = useRoute()
const router = useRouter()
const { stop: lenisStop, start: lenisStart, scrollTo } = useLenis()

const splashDone = useState('splashDone', () => false)

const isOpen = ref(false)
const isScrolled = ref(false)
const activePreview = ref(0)

let menuTl: gsap.core.Timeline | null = null

const barRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)

const links = [
  { label: 'Accueil', thai: 'หน้าแรก', to: '/', img: 'images/hero/hero-banner-img.png' },
  { label: 'La carte', thai: 'เมนู', to: '/#menu', img: 'images/plats/pad-thai-1.jpg' },
  { label: 'Réserver', thai: 'จอง', to: '/reserver', img: 'images/plats/tom-yum.jpg' },
  { label: 'Commander', thai: 'สั่งอาหาร', to: '/commander', img: 'images/plats/satay-gai.jpg' },
  { label: 'Contact', thai: 'ติดต่อ', to: '/contact', img: 'images/plats/gaeng-daeng.jpg' },
]

function onScroll() {
  isScrolled.value = window.scrollY > 24
}

function openMenu() {
  if (isOpen.value) return
  menuTl?.kill()
  isOpen.value = true
  lenisStop()
  document.body.style.overflow = 'hidden'

  nextTick(() => {
    const overlay = overlayRef.value!
    const panels = overlay.querySelectorAll('.menu-panel')
    const items = overlay.querySelectorAll('.menu-link-inner')
    const thais = overlay.querySelectorAll('.menu-link-thai')
    const indices = overlay.querySelectorAll('.menu-link-index')
    const preview = overlay.querySelector('.menu-preview')
    const foot = overlay.querySelectorAll('.menu-foot > *')

    gsap.set(panels, { yPercent: -101 })
    gsap.set(items, { yPercent: 120 })
    gsap.set([thais, indices], { opacity: 0, y: 12 })
    gsap.set(preview, { clipPath: 'inset(100% 0 0 0)' })
    gsap.set(foot, { opacity: 0, y: 18 })

    const tl = gsap.timeline()
    menuTl = tl

    // Double curtain: accent panel leads, blue panel lands
    tl.to(panels, {
      yPercent: 0,
      duration: 0.72,
      stagger: 0.09,
      ease: 'power4.inOut',
    })
    tl.to(items, {
      yPercent: 0,
      duration: 0.65,
      stagger: 0.07,
      ease: 'power3.out',
    }, '-=0.28')
    tl.to([indices, thais], {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.04,
      ease: 'power2.out',
    }, '-=0.45')
    tl.to(preview, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 0.7,
      ease: 'power3.inOut',
    }, '-=0.65')
    tl.to(foot, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power2.out',
    }, '-=0.4')

    const first = overlay.querySelector<HTMLElement>('.menu-link')
    first?.focus({ preventScroll: true })
  })
}

function closeMenu(after?: () => void) {
  if (!isOpen.value) {
    after?.()
    return
  }
  // Kill any in-flight open animation — a close request always wins
  menuTl?.kill()

  const overlay = overlayRef.value!
  const panels = overlay.querySelectorAll('.menu-panel')
  const content = overlay.querySelector('.menu-content')

  const tl = gsap.timeline({
    onComplete: () => {
      isOpen.value = false
      document.body.style.overflow = ''
      lenisStart()
      gsap.set(content, { opacity: 1 })
      after?.()
    },
  })
  menuTl = tl

  tl.to(content, { opacity: 0, duration: 0.25, ease: 'power2.in' })
  tl.to(panels, {
    yPercent: -101,
    duration: 0.6,
    stagger: -0.08,
    ease: 'power4.inOut',
  }, '-=0.05')
}

function toggleMenu() {
  isOpen.value ? closeMenu() : openMenu()
}

async function handleLink(link: typeof links[number], e: MouseEvent) {
  e.preventDefault()
  if (link.to === '/#menu') {
    closeMenu(async () => {
      if (route.path !== '/') {
        await router.push('/')
        requestAnimationFrame(() => {
          requestAnimationFrame(() => scrollTo('#menu'))
        })
      }
      else {
        scrollTo('#menu')
      }
    })
    return
  }
  closeMenu(() => {
    if (route.path !== link.to) router.push(link.to)
  })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) closeMenu()
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)

  // Bar entrance — waits for the splash curtain on hard refresh
  const showBar = () => {
    if (!barRef.value) return
    gsap.fromTo(barRef.value,
      { y: -80, opacity: 0 },
      // clearProps strips the leftover transform so the fixed nav sits with no
      // matrix() — avoids iOS compositing quirks on a position:fixed element.
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', clearProps: 'transform' },
    )
  }
  if (splashDone.value) {
    showBar()
  }
  else {
    const unwatch = watch(splashDone, (done) => {
      if (done) {
        showBar()
        unwatch()
      }
    })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header ref="barRef" class="site-nav" :class="{ scrolled: isScrolled, open: isOpen }">
    <NuxtLink to="/" class="nav-brand" aria-label="Khan Kluay — Accueil" @click="isOpen && closeMenu()">
      <img :src="`${baseURL}logos/logo-khan-kluay-v2.svg`" alt="Khan Kluay" class="nav-brand-logo" />
    </NuxtLink>

    <div class="nav-right">
      <NuxtLink to="/reserver" class="nav-cta" @click="isOpen && closeMenu()">
        <span class="nav-cta-label">Réserver</span>
        <span class="nav-cta-thai" aria-hidden="true">จอง</span>
      </NuxtLink>

      <button
        class="burger"
        :class="{ open: isOpen }"
        :aria-expanded="isOpen"
        aria-controls="site-menu"
        :aria-label="isOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
        @click="toggleMenu"
      >
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </button>
    </div>
  </header>

  <div
    v-show="isOpen"
    id="site-menu"
    ref="overlayRef"
    class="menu-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Menu principal"
  >
    <div class="menu-panel menu-panel-accent"></div>
    <div class="menu-panel menu-panel-main"></div>

    <div class="menu-content">
      <nav class="menu-links">
        <a
          v-for="(link, i) in links"
          :key="link.to"
          :href="link.to"
          class="menu-link"
          @click="handleLink(link, $event)"
          @mouseenter="activePreview = i"
          @focus="activePreview = i"
        >
          <span class="menu-link-index">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="menu-link-mask">
            <span class="menu-link-inner">{{ link.label }}</span>
          </span>
          <span class="menu-link-thai" aria-hidden="true">{{ link.thai }}</span>
        </a>
      </nav>

      <div class="menu-preview" aria-hidden="true">
        <div class="menu-preview-frame">
          <img
            v-for="(link, i) in links"
            :key="link.img"
            :src="`${baseURL}${link.img}`"
            alt=""
            class="menu-preview-img"
            :class="{ active: activePreview === i }"
          />
        </div>
        <p class="menu-preview-caption">
          <span class="caption-thai">ครัวไทย</span>
          <span class="caption-sep">·</span>
          <span>{{ links[activePreview]?.label }}</span>
        </p>
      </div>

      <div class="menu-foot">
        <p class="menu-foot-item">12 avenue de la République, Villejuif</p>
        <p class="menu-foot-item">Ouvert 7j/7 · 11h30–14h30 · 18h30–22h30</p>
        <p class="menu-foot-item menu-foot-thai">ก้านกล้วย — cuisine thaïlandaise authentique</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- Fixed bar ---------- */
.site-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--nav-height);
  padding: 0 32px;
  opacity: 0;
  transition: background 0.35s ease, border-color 0.35s ease;
  border-bottom: 1px solid transparent;
}

.site-nav.scrolled:not(.open) {
  background: rgba(250, 244, 239, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: var(--color-border);
}

.nav-brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-brand-logo {
  height: 38px;
  width: auto;
  display: block;
  transition: filter 0.35s ease;
}

/* Wordmark turns cream when the blue overlay is open */
.site-nav.open .nav-brand-logo {
  filter: brightness(0) saturate(100%) invert(96%) sepia(4%) saturate(589%) hue-rotate(322deg) brightness(103%);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Réserver pill — border-draw colors from kk-v1 */
.nav-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 26px;
  border: 1px solid currentColor;
  border-radius: 60px;
  text-decoration: none;
  color: var(--color-blue);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
  overflow: hidden;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.nav-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-blue);
  transform: translateY(101%);
  transition: transform 0.45s var(--ease-out-expo);
  border-radius: 60px;
}

.nav-cta:hover::before { transform: translateY(0); }
.nav-cta:hover { color: var(--color-cream); }

.nav-cta-label { position: relative; z-index: 1; }

.nav-cta-thai {
  position: relative;
  z-index: 1;
  margin-left: 0.5em;
  font-size: 0.8em;
  font-weight: 400;
  opacity: 0.7;
}

.site-nav.open .nav-cta {
  color: var(--color-cream);
}

.site-nav.open .nav-cta::before { background: var(--color-thai-on-blue); }

/* Burger — two lines morphing to a cross */
.burger {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: var(--color-surface);
  border: 1px solid var(--color-text);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.35s ease, border-color 0.35s ease;
}

.burger-line {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--color-blue);
  border-radius: 1px;
  transition: transform 0.4s var(--ease-out-expo), background 0.35s ease;
}

.burger:hover .burger-line:nth-child(1) { transform: translateY(-1.5px); }
.burger:hover .burger-line:nth-child(2) { transform: translateY(1.5px); }

.burger.open {
  background: transparent;
  border-color: var(--color-cream);
}

.burger.open .burger-line {
  background: var(--color-cream);
}

.burger.open .burger-line:nth-child(1) {
  transform: translateY(4.5px) rotate(45deg);
}

.burger.open .burger-line:nth-child(2) {
  transform: translateY(-4.5px) rotate(-45deg);
}

/* ---------- Full-screen overlay ---------- */
.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 600;
  overflow: hidden;
}

.menu-panel {
  position: absolute;
  inset: 0;
  will-change: transform;
}

.menu-panel-accent { background: var(--color-accent); }
.menu-panel-main { background: var(--color-blue); }

.menu-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  grid-template-rows: 1fr auto;
  gap: 0 4rem;
  padding: calc(var(--nav-height) + 2rem) clamp(24px, 6vw, 96px) 2.5rem;
  max-width: 1500px;
  margin: 0 auto;
}

/* Links */
.menu-links {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(0.4rem, 1.6vh, 1.1rem);
  min-width: 0;
}

.menu-link {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 1.1rem;
  text-decoration: none;
  width: fit-content;
  max-width: 100%;
}

.menu-link-index {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--color-thai-on-blue);
  opacity: 0.8;
  transform: translateY(-0.3em);
}

.menu-link-mask {
  display: block;
  overflow: hidden;
}

.menu-link-inner {
  display: block;
  font-size: clamp(2.4rem, 6.5vh, 4.4rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: 0.01em;
  color: var(--color-cream);
  transition: transform 0.45s var(--ease-out-expo), color 0.3s ease;
  will-change: transform;
}

.menu-link:hover .menu-link-inner,
.menu-link:focus-visible .menu-link-inner {
  transform: translateX(12px);
  color: #fff;
}

.menu-link:focus-visible {
  outline: 1px dashed rgba(250, 244, 239, 0.5);
  outline-offset: 8px;
}

.menu-link-thai {
  font-size: clamp(1rem, 2.2vh, 1.4rem);
  font-weight: 400;
  color: var(--color-thai-on-blue);
  white-space: nowrap;
  transition: opacity 0.3s ease, transform 0.45s var(--ease-out-expo);
}

.menu-link:hover .menu-link-thai {
  transform: translateX(8px);
}

/* Preview frame (desktop) */
.menu-preview {
  align-self: center;
  justify-self: end;
  width: min(100%, 380px);
  will-change: clip-path;
}

.menu-preview-frame {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid rgba(250, 244, 239, 0.4);
}

.menu-preview-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.06);
  transition: opacity 0.55s ease, transform 1.6s ease;
}

.menu-preview-img.active {
  opacity: 1;
  transform: scale(1);
}

.menu-preview-caption {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 0.8rem;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-cream);
  opacity: 0.75;
}

.caption-thai {
  color: var(--color-thai-on-blue);
  text-transform: none;
  letter-spacing: 0.04em;
}

.caption-sep { opacity: 0.5; }

/* Footer line */
.menu-foot {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1.5rem;
  flex-wrap: wrap;
  border-top: 1px solid rgba(250, 244, 239, 0.2);
  padding-top: 1.4rem;
}

.menu-foot-item {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  color: var(--color-cream);
  opacity: 0.7;
}

.menu-foot-thai {
  color: var(--color-thai-on-blue);
  opacity: 0.9;
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .menu-content {
    grid-template-columns: 1fr;
    gap: 0;
    padding: calc(var(--nav-height) + 1rem) 24px 1.5rem;
  }

  .menu-preview { display: none; }

  .menu-link-inner {
    /* vw-capped so the longest label (Commander) never clips on narrow screens */
    font-size: clamp(1.8rem, min(7vh, 9.5vw), 3.4rem);
  }

  .menu-link-thai {
    font-size: clamp(0.85rem, 3.4vw, 1.2rem);
  }

  .menu-foot {
    flex-direction: column;
    gap: 0.4rem;
  }
}

@media (max-width: 768px) {
  .site-nav { padding: 0 16px; }

  /* iOS Safari clips/detaches a position:fixed element that has backdrop-filter
     during scroll — the nav appears stuck half off the top. Use a solid cream
     background on mobile instead (the frosted blur stays on desktop). */
  .site-nav.scrolled:not(.open) {
    background: rgba(250, 244, 239, 0.98);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .nav-brand-logo { height: 30px; }

  .nav-cta {
    padding: 7px 18px;
    font-size: 13px;
  }

  .nav-cta-thai { display: none; }
}

@media (max-width: 380px) {
  .nav-cta { display: none; }
}
</style>
