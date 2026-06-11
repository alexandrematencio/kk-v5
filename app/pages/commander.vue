<script setup lang="ts">
import { gsap } from 'gsap'
import type { MenuCategory } from '../composables/useMenu'

const baseURL = useRuntimeConfig().app.baseURL
const { menuData, categories, categoryMeta } = useMenu()

const activeCategory = ref<MenuCategory>('plats')
const cart = ref<Array<{ title: string, price: number, qty: number }>>([])

const currentItems = computed(() => menuData[activeCategory.value])

const total = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.qty, 0),
)

const totalQty = computed(() =>
  cart.value.reduce((sum, item) => sum + item.qty, 0),
)

function setCategory(cat: MenuCategory) {
  activeCategory.value = cat
}

function addToCart(item: { title: string, price: number }, event: MouseEvent) {
  const existing = cart.value.find(c => c.title === item.title)
  if (existing) {
    existing.qty++
  } else {
    cart.value.push({ ...item, qty: 1 })
  }

  const btn = event.currentTarget as HTMLElement
  gsap.fromTo(btn,
    { scale: 1 },
    { scale: 1.25, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' },
  )
  spawnPlusOne(btn)
}

function spawnPlusOne(btn: HTMLElement) {
  const indicator = document.createElement('span')
  indicator.textContent = '+1'
  indicator.className = 'plus-one-indicator'
  btn.appendChild(indicator)
  gsap.fromTo(indicator,
    { y: 0, opacity: 1 },
    {
      y: -32,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      onComplete: () => indicator.remove(),
    },
  )
}

function decrementCart(itemTitle: string) {
  const existing = cart.value.find(c => c.title === itemTitle)
  if (!existing) return
  if (existing.qty > 1) {
    existing.qty--
  } else {
    removeFromCart(itemTitle)
  }
}

function removeFromCart(itemTitle: string) {
  cart.value = cart.value.filter(c => c.title !== itemTitle)
}

function callToOrder() {
  window.location.href = 'tel:+33123456789'
}

onMounted(() => {
  nextTick(() => {
    gsap.fromTo('.order-page',
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' },
    )
  })
})
</script>

<template>
  <section class="order-page">
    <PageHeader
      eyebrow="Livraison ou a emporter"
      thai="สั่งอาหาร"
      latin="Commander"
    />

    <!-- Process steps -->
    <div class="process-section">
      <div class="process-step">
        <span class="step-number">01</span>
        <h3>Choisissez vos plats</h3>
        <p>Parcourez la carte et ajoutez ce qui vous tente.</p>
      </div>
      <div class="process-step">
        <span class="step-number">02</span>
        <h3>Appelez-nous</h3>
        <p>Composez le <strong>01 23 45 67 89</strong> pour confirmer.</p>
      </div>
      <div class="process-step">
        <span class="step-number">03</span>
        <h3>On s'occupe du reste</h3>
        <p>A emporter sous 20 min ou livraison dans Villejuif.</p>
      </div>
    </div>

    <!-- Quick call CTA -->
    <div class="cta-section">
      <button class="call-btn" @click="callToOrder">
        Appeler pour commander
      </button>
      <p class="cta-note">ou composez votre commande ci-dessous</p>
    </div>

    <!-- Category tabs (bilingual, like La carte) -->
    <nav class="menu-tabs">
      <button
        v-for="cat in categories"
        :key="cat"
        class="tab"
        :class="{ active: activeCategory === cat }"
        @click="setCategory(cat)"
      >
        <span class="tab-thai">{{ categoryMeta[cat].thai }}</span>
        <span class="tab-latin">{{ categoryMeta[cat].latin }}</span>
      </button>
    </nav>

    <!-- Editorial menu rows with dish photos -->
    <ul class="order-items">
      <li v-for="item in currentItems" :key="item.title" class="order-item">
        <div class="item-img-wrapper">
          <img :src="`${baseURL}images/plats/${item.img}`" :alt="item.title" class="item-img" />
        </div>
        <div class="item-text">
          <h4 class="item-name">{{ item.title }}</h4>
          <p class="item-thai-price">
            <span class="item-thai">{{ item.thai }}</span>
            <span class="dot">·</span>
            <span class="item-price">{{ item.price }} €</span>
            <span v-if="item.spicy" class="spicy">{{ '🌶'.repeat(item.spicy) }}</span>
          </p>
        </div>
        <button class="add-btn" aria-label="Ajouter au panier" @click="addToCart(item, $event)">
          +
        </button>
      </li>
    </ul>

    <!-- Cart bar -->
    <div class="cart-bar" :class="{ visible: cart.length > 0 }">
      <div class="cart-items">
        <div v-for="item in cart" :key="item.title" class="cart-item">
          <span class="cart-item-name">{{ item.title }} ×{{ item.qty }}</span>
          <div class="cart-item-controls">
            <button class="qty-btn" aria-label="Diminuer" @click="decrementCart(item.title)">−</button>
            <span class="cart-item-price">{{ item.price * item.qty }} €</span>
            <button class="remove-btn" aria-label="Supprimer" @click="removeFromCart(item.title)">×</button>
          </div>
        </div>
      </div>
      <div class="cart-total">
        <span class="total-label">Total</span>
        <span class="total-amount">{{ total }} €</span>
      </div>
      <button class="cart-checkout" @click="callToOrder">
        <svg class="cart-checkout-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M13.5 0.5H11L10.13 9.15C10.0938 9.38845 9.97272 9.6058 9.78896 9.762C9.60519 9.9182 9.37117 10.0027 9.13001 10H2.83001C2.61194 10.0114 2.39614 9.95107 2.21557 9.82829C2.035 9.7055 1.89959 9.52698 1.83001 9.32L0.500006 5.32C0.450418 5.16962 0.437251 5.0096 0.461591 4.85314C0.48593 4.69667 0.54708 4.54822 0.640006 4.42C0.736814 4.28368 0.866258 4.17381 1.0165 4.10043C1.16674 4.02706 1.33297 3.99253 1.50001 4H10.65" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M3 13.5C3.27614 13.5 3.5 13.2761 3.5 13C3.5 12.7239 3.27614 12.5 3 12.5C2.72386 12.5 2.5 12.7239 2.5 13C2.5 13.2761 2.72386 13.5 3 13.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M9.5 13.5C9.77614 13.5 10 13.2761 10 13C10 12.7239 9.77614 12.5 9.5 12.5C9.22386 12.5 9 12.7239 9 13C9 13.2761 9.22386 13.5 9.5 13.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Commander · {{ totalQty }} {{ totalQty > 1 ? 'plats' : 'plat' }}
      </button>
    </div>

    <footer class="page-footer">
      <p>12 avenue de la Republique, Villejuif</p>
      <p class="hours">Ouvert 7j/7 · 11h30-14h30 · 18h30-22h30</p>
    </footer>
  </section>
</template>

<style scoped>
.order-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 140px;
}

/* Process section — editorial steps */
.process-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto 4rem;
  padding: 0 2rem;
}

.process-step {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--color-border);
}

.step-number {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #001B95;
  letter-spacing: 0.1em;
}

.process-step h3 {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  margin: 0;
}

.process-step p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
}

.process-step strong {
  color: #001B95;
  font-weight: 600;
}

/* CTA */
.cta-section {
  text-align: center;
  margin-bottom: 4rem;
}

.call-btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: transparent;
  border: 1px solid #000000;
  border-radius: 60px;
  color: #001B95;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.call-btn:hover {
  background: #001B95;
  border-color: #001B95;
  color: #fff;
}

.cta-note {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
}

/* Tabs (sticky bilingual, same as La carte) — anchored below the fixed SiteNav */
.menu-tabs {
  position: sticky;
  top: var(--nav-height);
  z-index: 20;
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  padding: 1.25rem 1rem;
  margin-bottom: 3rem;
  background: rgba(247, 247, 247, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  background: transparent;
  border: none;
  padding: 0.5rem 0;
  cursor: pointer;
  position: relative;
  font-family: 'Inter', sans-serif;
  transition: opacity 0.2s ease;
}

.tab-thai {
  font-size: 0.75rem;
  color: #E22B02;
  font-weight: 400;
}

.tab-latin {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: capitalize;
  transition: color 0.2s ease;
}

.tab:hover .tab-latin {
  color: #001B95;
}

.tab.active .tab-latin {
  color: #001B95;
  font-weight: 700;
}

.tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1.25rem;
  height: 2px;
  background: #001B95;
}

/* Editorial item rows */
.order-items {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 800px;
  padding-left: 2rem;
  padding-right: 2rem;
}

.order-item {
  display: grid;
  grid-template-columns: 96px 1fr auto;
  gap: 1.25rem;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid var(--color-border-light);
}

.order-item:first-child {
  border-top: none;
}

.item-img-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-surface-alt);
  flex-shrink: 0;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.order-item:hover .item-img {
  transform: scale(1.05);
}

.item-text {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.item-name {
  font-family: 'Inter', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.1;
  margin: 0;
}

.item-thai-price {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin: 0;
}

.item-thai {
  color: #001B95;
  font-weight: 500;
}

.dot {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.item-price {
  color: var(--color-accent);
  font-weight: 600;
}

.spicy {
  font-size: 0.85rem;
  margin-left: 0.25rem;
}

.add-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #001B95;
  color: #fff;
  border: none;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-family: 'Inter', sans-serif;
}

.add-btn:hover {
  transform: scale(1.1);
}

.plus-one-indicator {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 700;
  color: #001B95;
  pointer-events: none;
  background: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 27, 149, 0.25);
}

/* Cart bar */
.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 -4px 20px rgba(0, 27, 149, 0.08);
  border-top: 1px solid var(--color-border);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 30;
}

.cart-bar.visible {
  transform: translateY(0);
}

.cart-items {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-width: 0;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  background: var(--color-surface-alt);
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}

.cart-item-name {
  font-weight: 500;
  color: var(--color-text);
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-item-controls .qty-btn,
.cart-item-controls .remove-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0;
  transition: all 0.15s ease;
  font-family: 'Inter', sans-serif;
}

.cart-item-controls .qty-btn:hover {
  border-color: #001B95;
  color: #001B95;
}

.cart-item-controls .remove-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.cart-item-price {
  font-weight: 600;
  color: #001B95;
}

.cart-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.total-label {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.total-amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: #001B95;
  font-family: 'Inter', sans-serif;
}

.cart-checkout {
  padding: 0.85rem 1.5rem;
  background: #001B95;
  color: #fff;
  border: none;
  border-radius: 60px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
}

.cart-checkout-icon {
  flex-shrink: 0;
  stroke-width: 1.25;
  transform: translateY(-1px);
}

.cart-checkout:hover {
  opacity: 0.9;
}

/* Footer */
.page-footer {
  text-align: center;
  padding: 4rem 2rem 2rem;
  border-top: 1px solid var(--color-border-light);
  margin-top: 4rem;
}

.page-footer p {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-muted);
}

.page-footer .hours {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

@media (max-width: 768px) {
  .process-section {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .menu-tabs {
    gap: 1.25rem;
    overflow-x: auto;
    justify-content: flex-start;
    flex-wrap: nowrap;
    scrollbar-width: none;
  }

  .menu-tabs::-webkit-scrollbar { display: none; }

  .tab { flex-shrink: 0; }

  .order-items {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .order-item {
    grid-template-columns: 72px 1fr auto;
    gap: 1rem;
    padding: 1.25rem 0;
  }

  .item-img-wrapper {
    width: 72px;
    height: 72px;
    border-radius: 8px;
  }

  .item-name {
    font-size: 1.15rem;
  }
}

@media (max-width: 600px) {
  .cart-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .cart-items {
    max-height: 30vh;
    overflow-y: auto;
  }

  .cart-total {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .cart-checkout {
    width: 100%;
  }
}
</style>
