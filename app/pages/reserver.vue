<script setup lang="ts">
const partySize = ref(2)
const selectedTime = ref('')
const name = ref('')
const phone = ref('')
const email = ref('')

const feedback = ref<{ type: 'error' | 'success', message: string } | null>(null)

const timeSlots = {
  lunch: ['11h30', '12h00', '12h30', '13h00', '13h30', '14h00'],
  dinner: ['18h30', '19h00', '19h30', '20h00', '20h30', '21h00', '21h30', '22h00'],
}

function selectTimeSlot(slot: string) {
  selectedTime.value = slot
}

function submitReservation() {
  if (!selectedTime.value || !name.value || !phone.value) {
    feedback.value = { type: 'error', message: 'Veuillez remplir tous les champs obligatoires' }
    return
  }
  feedback.value = {
    type: 'success',
    message: `Demande envoyee pour ${partySize.value} personnes a ${selectedTime.value}. Nous vous confirmerons par telephone, ${name.value} !`,
  }
}
</script>

<template>
  <section class="reservation-page">
    <PageHeader
      eyebrow="Choisissez votre moment"
      thai="จอง"
      latin="Reserver"
    />

    <div class="form-shell">
      <div class="form-group">
        <span class="form-eyebrow">Nombre de personnes</span>
        <div class="party-size-selector">
          <button
            v-for="n in 8"
            :key="n"
            class="party-btn"
            :class="{ active: partySize === n }"
            @click="partySize = n"
          >
            {{ n }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <span class="form-eyebrow">Service</span>
        <div class="time-slots">
          <div class="time-group">
            <span class="time-label">
              <span class="time-thai">มื้อกลางวัน</span>
              <span class="time-latin">Dejeuner</span>
            </span>
            <div class="time-options">
              <button
                v-for="slot in timeSlots.lunch"
                :key="'l-' + slot"
                class="time-btn"
                :class="{ active: selectedTime === slot }"
                @click="selectTimeSlot(slot)"
              >
                {{ slot }}
              </button>
            </div>
          </div>
          <div class="time-group">
            <span class="time-label">
              <span class="time-thai">มื้อค่ำ</span>
              <span class="time-latin">Diner</span>
            </span>
            <div class="time-options">
              <button
                v-for="slot in timeSlots.dinner"
                :key="'d-' + slot"
                class="time-btn"
                :class="{ active: selectedTime === slot }"
                @click="selectTimeSlot(slot)"
              >
                {{ slot }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <span class="form-eyebrow">Nom</span>
        <input v-model="name" type="text" class="form-input" placeholder="Votre nom" />
      </div>

      <div class="form-group">
        <span class="form-eyebrow">Telephone</span>
        <input v-model="phone" type="tel" class="form-input" placeholder="06 XX XX XX XX" />
      </div>

      <div class="form-group">
        <span class="form-eyebrow">Email <em>(facultatif)</em></span>
        <input v-model="email" type="email" class="form-input" placeholder="vous@email.com" />
      </div>

      <p class="form-note">La table vous sera attribuee par le restaurant a votre arrivee.</p>

      <button
        class="submit-btn"
        :disabled="!selectedTime || !name || !phone"
        @click="submitReservation"
      >
        Reserver
      </button>

      <Transition name="feedback">
        <div v-if="feedback" class="feedback-banner" :class="feedback.type">
          {{ feedback.message }}
        </div>
      </Transition>
    </div>

    <footer class="page-footer">
      <p>12 avenue de la Republique, Villejuif</p>
      <p class="hours">Ouvert 7j/7 · 11h30-14h30 · 18h30-22h30</p>
    </footer>
  </section>
</template>

<style scoped>
.reservation-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.form-shell {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 2rem 4rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem 0;
  border-top: 1px solid var(--color-border-light);
}

.form-group:first-of-type {
  border-top: none;
  padding-top: 0;
}

.form-eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #001B95;
  font-weight: 500;
  opacity: 0.7;
}

.form-eyebrow em {
  font-style: normal;
  text-transform: none;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  opacity: 0.7;
  font-size: 0.7rem;
  margin-left: 0.25rem;
}

/* Party size */
.party-size-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.party-btn {
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  color: var(--color-text);
}

.party-btn:hover {
  border-color: #001B95;
  color: #001B95;
}

.party-btn.active {
  background: #001B95;
  border-color: #001B95;
  color: #fff;
}

/* Time slots */
.time-slots {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.time-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.time-label {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.time-thai {
  font-size: 0.85rem;
  color: #E22B02;
  font-weight: 400;
}

.time-latin {
  font-size: 0.95rem;
  color: var(--color-text);
  font-weight: 600;
}

.time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.time-btn {
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.time-btn:hover {
  border-color: #001B95;
  color: #001B95;
}

.time-btn.active {
  background: #001B95;
  border-color: #001B95;
  color: #fff;
}

/* Inputs */
.form-input {
  width: 100%;
  padding: 0.75rem 0;
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  font-size: 1.1rem;
  font-family: 'Inter', sans-serif;
  background: transparent;
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-bottom-color: #001B95;
}

.form-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.5;
}

/* Note + submit */
.form-note {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-align: center;
  margin: 2rem 0 1rem;
  font-style: italic;
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 1.1rem 2rem;
  background: #001B95;
  color: #fff;
  border: none;
  border-radius: 60px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.1em;
  font-family: 'Inter', sans-serif;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Feedback */
.feedback-banner {
  margin-top: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 500;
  line-height: 1.4;
}

.feedback-banner.success {
  background: #e8f5e9;
  color: #1b5e20;
  border: 1px solid #a5d6a7;
}

.feedback-banner.error {
  background: #ffebee;
  color: #b71c1c;
  border: 1px solid #ef9a9a;
}

.feedback-enter-active,
.feedback-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.feedback-enter-from,
.feedback-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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

@media (max-width: 600px) {
  .form-shell {
    padding: 1rem 1.25rem 3rem;
  }
}
</style>
