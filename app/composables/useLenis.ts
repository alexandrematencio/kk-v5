import type Lenis from 'lenis'

export function useLenis() {
  function get(): Lenis | null {
    if (typeof window === 'undefined') return null
    return (window as any).__lenis ?? null
  }

  function stop() {
    get()?.stop()
    document.documentElement.classList.add('lenis-stopped')
  }

  function start() {
    get()?.start()
    document.documentElement.classList.remove('lenis-stopped')
  }

  function scrollTo(target: string | number | HTMLElement, opts: Record<string, unknown> = {}) {
    const lenis = get()
    if (lenis) {
      lenis.scrollTo(target as any, { offset: 0, ...opts })
    }
    else if (typeof target !== 'number') {
      const el = typeof target === 'string' ? document.querySelector(target) : target
      el?.scrollIntoView({ behavior: 'smooth' })
    }
    else {
      window.scrollTo({ top: target, behavior: 'smooth' })
    }
  }

  return { get, stop, start, scrollTo }
}
