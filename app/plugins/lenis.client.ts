import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  // Mobile browsers resize the viewport when the address bar shows/hides during
  // scroll. With a pinned section (Philosophie), that resize shifts the pin
  // spacer and drags the sections below it (Story, Menu) out of place — the menu
  // appears "stuck halfway up". This tells ScrollTrigger to ignore those resizes.
  ScrollTrigger.config({ ignoreMobileResize: true })

  nuxtApp.hook('app:mounted', () => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // Exposed for components (scroll lock, anchor scroll) and headless verification
    ;(window as any).__lenis = lenis
  })
})
