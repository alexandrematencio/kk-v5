<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const baseURL = useRuntimeConfig().app.baseURL
const { menuData, categories, categoryMeta } = useMenu()

const menuSectionRef = ref<HTMLElement | null>(null)
const activeDish = ref({ img: 'pad-thai-1.jpg', title: 'Pad Thai', plate: 4 })

// Global plate numbers across categories for the "Pl. 0X" captions
const plateNumbers = computed(() => {
  const map = new Map<string, number>()
  let n = 0
  for (const cat of categories) {
    for (const item of menuData[cat]) {
      n += 1
      map.set(item.title, n)
    }
  }
  return map
})

function setActive(item: { img: string, title: string }) {
  activeDish.value = {
    img: item.img,
    title: item.title,
    plate: plateNumbers.value.get(item.title) ?? 1,
  }
}

onMounted(() => {
  nextTick(setupAnimations)
})

onBeforeUnmount(() => {
  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger && menuSectionRef.value?.contains(st.trigger as Node)) st.kill()
  })
})

function setupAnimations() {
  const root = menuSectionRef.value
  if (!root) return

  gsap.fromTo('.menu-title, .menu-eyebrow',
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: root,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    },
  )

  // Chapter heading reveal — Thai first, then Latin (brand device)
  root.querySelectorAll('.chapter-header').forEach((header) => {
    const thai = header.querySelector('.chapter-thai')
    const latin = header.querySelector('.chapter-latin')
    if (!thai || !latin) return
    gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
      .fromTo(thai, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .fromTo(latin, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.15')
  })

  // Rows rise in with stagger per chapter
  root.querySelectorAll('.chapter').forEach((chapter) => {
    const rows = chapter.querySelectorAll('.dish-row')
    if (!rows.length) return
    gsap.fromTo(rows,
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: chapter,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      },
    )
  })

  // Preview frame curtain reveal
  gsap.fromTo('.preview-frame',
    { clipPath: 'inset(100% 0 0 0)' },
    {
      clipPath: 'inset(0% 0 0 0)',
      duration: 0.9,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: root,
        start: 'top 60%',
        toggleActions: 'play none none none',
      },
    },
  )

  // Mobile thumbs curtain reveal
  root.querySelectorAll('.dish-thumb').forEach((thumb) => {
    gsap.fromTo(thumb,
      { clipPath: 'inset(50% 0 50% 0)' },
      {
        clipPath: 'inset(0% 0 0% 0)',
        duration: 0.7,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: thumb,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      },
    )
  })
}
</script>

<template>
  <section id="menu" ref="menuSectionRef" class="menu-section">
    <header class="menu-header">
      <p class="menu-eyebrow">Chaque plat raconte une histoire</p>
      <h2 class="menu-title">La carte</h2>
    </header>

    <div class="menu-layout">
      <div class="menu-index">
        <article
          v-for="cat in categories"
          :id="`chapter-${cat}`"
          :key="cat"
          class="chapter"
        >
          <header class="chapter-header">
            <span class="chapter-thai">{{ categoryMeta[cat].thai }}</span>
            <h3 class="chapter-latin">{{ categoryMeta[cat].latin }}</h3>
          </header>

          <ul class="dish-list">
            <li
              v-for="item in menuData[cat]"
              :key="item.title"
              class="dish-row"
              :class="{ active: activeDish.title === item.title }"
              @mouseenter="setActive(item)"
              @focusin="setActive(item)"
            >
              <span class="dish-plate">Pl. {{ String(plateNumbers.get(item.title)).padStart(2, '0') }}</span>
              <div class="dish-main">
                <div class="dish-name-line">
                  <h4 class="dish-name">{{ item.title }}</h4>
                  <span class="dish-leader" aria-hidden="true"></span>
                  <span class="dish-price">{{ item.price }} €</span>
                </div>
                <p class="dish-sub">
                  <span class="dish-thai">{{ item.thai }}</span>
                  <span v-if="item.spicy" class="dish-spicy">{{ '🌶'.repeat(item.spicy) }}</span>
                  <span v-if="item.featured" class="dish-featured">Best-seller</span>
                </p>
                <p class="dish-desc">{{ item.description }}</p>
              </div>
              <div class="dish-thumb">
                <img :src="`${baseURL}images/plats/${item.img}`" :alt="item.title" loading="lazy" />
              </div>
            </li>
          </ul>
        </article>
      </div>

      <aside class="menu-preview-col" aria-hidden="true">
        <div class="preview-sticky">
          <div class="preview-frame">
            <Transition name="dish-fade" mode="default">
              <img
                :key="activeDish.img"
                :src="`${baseURL}images/plats/${activeDish.img}`"
                alt=""
                class="preview-img"
              />
            </Transition>
          </div>
          <p class="preview-caption">
            <span class="preview-plate">Pl. {{ String(activeDish.plate).padStart(2, '0') }}</span>
            <span class="preview-sep">·</span>
            <span class="preview-name">{{ activeDish.title }}</span>
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.menu-section {
  padding: 8rem 2rem 6rem;
  background: var(--color-bg);
  color: var(--color-text);
}

.menu-header {
  text-align: center;
  margin-bottom: 4rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.menu-eyebrow {
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-blue);
  font-weight: 500;
  opacity: 0.45;
  margin-bottom: 1rem;
}

.menu-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

/* Editorial index layout: list left, fixed preview right */
.menu-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 5rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
}

.chapter {
  padding: 3rem 0 4rem;
}

.chapter-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 2.5rem;
}

.chapter-thai {
  font-size: clamp(1.25rem, 3vw, 1.9rem);
  font-weight: 400;
  color: var(--color-thai);
  line-height: 1.1;
}

.chapter-latin {
  font-size: clamp(2.25rem, 5.5vw, 3.75rem);
  font-weight: 700;
  color: var(--color-blue);
  letter-spacing: 0.02em;
  line-height: 1;
}

/* Dish rows */
.dish-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}

.dish-row {
  position: relative;
  display: flex;
  gap: 1.25rem;
  padding: 1.6rem 0;
  border-top: 1px solid var(--color-border-light);
  cursor: default;
}

.dish-row:first-child {
  border-top: none;
  padding-top: 0;
}

.dish-plate {
  flex-shrink: 0;
  width: 3.2rem;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  font-weight: 500;
  color: var(--color-accent);
  opacity: 0.7;
  padding-top: 0.45em;
  transition: opacity 0.3s ease;
}

.dish-main {
  flex: 1;
  min-width: 0;
  transition: transform 0.45s var(--ease-out-expo);
}

.dish-row:hover .dish-main,
.dish-row.active .dish-main {
  transform: translateX(10px);
}

.dish-row:hover .dish-plate,
.dish-row.active .dish-plate {
  opacity: 1;
}

.dish-name-line {
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
}

.dish-name {
  font-size: clamp(1.3rem, 2.6vw, 1.8rem);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.15;
  margin: 0;
  transition: color 0.3s ease;
}

.dish-row:hover .dish-name,
.dish-row.active .dish-name {
  color: var(--color-blue);
}

.dish-leader {
  flex: 1;
  border-bottom: 1px dotted var(--color-border);
  transform: translateY(-0.25em);
  min-width: 1.5rem;
}

.dish-price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-accent);
  white-space: nowrap;
}

.dish-sub {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
}

.dish-thai {
  color: var(--color-thai);
  font-weight: 400;
}

.dish-spicy {
  font-size: 0.8rem;
}

.dish-featured {
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-blue);
  font-weight: 600;
}

.dish-desc {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  line-height: 1.55;
  max-width: 48ch;
  margin: 0.4rem 0 0;
}

/* Mobile thumbnail — hidden on desktop where the preview frame lives */
.dish-thumb {
  display: none;
}

/* Sticky preview */
.menu-preview-col {
  min-width: 0;
}

.preview-sticky {
  position: sticky;
  top: calc(var(--nav-height) + 2.5rem);
}

.preview-frame {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid var(--color-text);
  background: var(--color-surface-alt);
}

.preview-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-fade-enter-active {
  transition: opacity 0.45s ease, transform 1.4s ease;
}

.dish-fade-leave-active {
  transition: opacity 0.45s ease;
}

.dish-fade-enter-from {
  opacity: 0;
  transform: scale(1.05);
}

.dish-fade-leave-to {
  opacity: 0;
}

.preview-caption {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 0.8rem;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.preview-plate {
  color: var(--color-accent);
  font-weight: 600;
}

.preview-sep { opacity: 0.5; }

.preview-name {
  color: var(--color-text);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 900px) {
  .menu-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .menu-preview-col {
    display: none;
  }

  .dish-row {
    align-items: center;
  }

  .dish-thumb {
    display: block;
    flex-shrink: 0;
    width: 86px;
    height: 86px;
    overflow: hidden;
    will-change: clip-path;
  }

  .dish-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .dish-plate {
    display: none;
  }
}

@media (max-width: 768px) {
  .menu-section {
    padding: 5rem 1.25rem 4rem;
  }

  .chapter {
    padding: 2.5rem 0 3rem;
  }

  .chapter-header {
    margin-bottom: 1.75rem;
  }

  .dish-row {
    padding: 1.25rem 0;
  }
}
</style>
