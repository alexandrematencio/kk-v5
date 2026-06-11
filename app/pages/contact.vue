<script setup lang="ts">
import { gsap } from 'gsap'

function callRestaurant() {
  window.location.href = 'tel:+33123456789'
}

function openMaps() {
  window.open('https://maps.google.com/?q=12+Avenue+de+la+Republique+Villejuif', '_blank')
}

onMounted(() => {
  nextTick(() => {
    gsap.fromTo('.contact-card',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 },
    )
  })
})
</script>

<template>
  <section class="contact-page">
    <PageHeader
      eyebrow="Reservez · commandez · visitez"
      thai="ติดต่อ"
      latin="Contact"
    />

    <div class="contact-grid">
      <article class="contact-card">
        <header class="card-header">
          <span class="card-thai">ที่อยู่</span>
          <h3 class="card-title">Adresse</h3>
        </header>
        <p class="card-value">12 avenue de la Republique</p>
        <p class="card-sub">94800 Villejuif</p>
        <button class="card-action" @click="openMaps">
          Voir sur la carte
        </button>
      </article>

      <article class="contact-card">
        <header class="card-header">
          <span class="card-thai">โทรศัพท์</span>
          <h3 class="card-title">Telephone</h3>
        </header>
        <p class="card-value phone-value">01 23 45 67 89</p>
        <button class="card-action" @click="callRestaurant">
          Appeler
        </button>
      </article>

      <article class="contact-card">
        <header class="card-header">
          <span class="card-thai">เวลาทำการ</span>
          <h3 class="card-title">Horaires</h3>
        </header>
        <div class="hours-list">
          <div class="hours-row">
            <span class="day">Lundi - Dimanche</span>
            <div class="time-stack">
              <span class="time">11h30 - 14h30</span>
              <span class="time">18h30 - 22h30</span>
            </div>
          </div>
        </div>
      </article>

      <article class="contact-card">
        <header class="card-header">
          <span class="card-thai">การเดินทาง</span>
          <h3 class="card-title">Acces</h3>
        </header>
        <ul class="access-list">
          <li><span class="access-mode">Metro</span> Ligne 7 · Villejuif - Louis Aragon</li>
          <li><span class="access-mode">Bus</span> 131 · 162 · 185</li>
          <li><span class="access-mode">Voiture</span> Boulevard Maxime Gorki</li>
        </ul>
      </article>
    </div>

    <!-- Action blocks -->
    <div class="action-section">
      <div class="action-eyebrow">Et aussi</div>

      <div class="action-blocks">
        <NuxtLink to="/reserver" class="action-card">
          <div class="action-text">
            <span class="action-thai">จอง</span>
            <h3 class="action-title">Reserver une table</h3>
            <p class="action-desc">Indiquez votre creneau, on vous confirme par telephone.</p>
          </div>
          <span class="action-arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/commander" class="action-card">
          <div class="action-text">
            <span class="action-thai">สั่งอาหาร</span>
            <h3 class="action-title">Commander a emporter</h3>
            <p class="action-desc">Composez votre commande, on s'occupe du reste.</p>
          </div>
          <span class="action-arrow">→</span>
        </NuxtLink>
      </div>
    </div>

    <footer class="page-footer">
      <p>12 avenue de la Republique, Villejuif</p>
      <p class="hours">Ouvert 7j/7 · 11h30-14h30 · 18h30-22h30</p>
    </footer>
  </section>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--color-bg);
}

/* Contact grid */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  max-width: 900px;
  margin: 0 auto 5rem;
  padding: 0 2rem;
  background: var(--color-border-light);
  border: 1px solid var(--color-border-light);
}

.contact-card {
  background: #fff;
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-bottom: 0.5rem;
}

.card-thai {
  font-size: 0.95rem;
  font-weight: 400;
  color: #E22B02;
  line-height: 1;
}

.card-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #001B95;
  letter-spacing: 0.01em;
  line-height: 1.1;
  margin: 0;
}

.card-value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
}

.card-sub {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0;
}

.phone-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #001B95;
  letter-spacing: 0.02em;
}

.card-action {
  align-self: flex-start;
  margin-top: 0.5rem;
  padding: 0.5rem 1.1rem;
  border: 1px solid #000;
  background: transparent;
  border-radius: 60px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #001B95;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
}

.card-action:hover {
  background: #001B95;
  border-color: #001B95;
  color: #fff;
}

/* Hours */
.hours-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hours-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  font-size: 0.9rem;
}

.hours-row .day {
  color: var(--color-text-muted);
}

.time-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.hours-row .time {
  font-weight: 600;
  color: var(--color-text);
}

/* Access list */
.access-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.access-mode {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #001B95;
  font-weight: 600;
  margin-right: 0.6rem;
}

/* Action section */
.action-section {
  max-width: 900px;
  margin: 0 auto 4rem;
  padding: 0 2rem;
}

.action-eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #001B95;
  font-weight: 500;
  opacity: 0.5;
  text-align: center;
  margin-bottom: 2rem;
}

.action-blocks {
  display: flex;
  flex-direction: column;
}

.action-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 2rem 0;
  border-top: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;
}

.action-card:last-child {
  border-bottom: 1px solid var(--color-border);
}

.action-card:hover {
  transform: translateX(8px);
}

.action-card:hover .action-arrow {
  color: #001B95;
  transform: translateX(6px);
}

.action-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.action-thai {
  font-size: 0.95rem;
  color: #E22B02;
  font-weight: 400;
}

.action-title {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.1;
}

.action-desc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
  line-height: 1.4;
}

.action-arrow {
  font-size: 2rem;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

/* Footer */
.page-footer {
  text-align: center;
  padding: 4rem 2rem 2rem;
  border-top: 1px solid var(--color-border-light);
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
  .contact-grid {
    grid-template-columns: 1fr;
    padding: 0 1.25rem;
  }

  .action-section {
    padding: 0 1.25rem;
  }

  .action-card {
    gap: 1rem;
    padding: 1.5rem 0;
  }
}
</style>
