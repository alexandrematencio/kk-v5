// Headless verification via CDP — drives real scroll through Lenis (see creative-dev playbook)
// Usage: node scripts/verify.mjs <width> <height> <outPrefix>
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9223
const [width = 1440, height = 900, prefix = 'desktop'] = process.argv.slice(2)
const OUT = new URL('../_shots/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--window-size=${width},${height}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=/tmp/kk-v5-chrome-profile',
  '--hide-scrollbars',
  'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`)
      const targets = await res.json()
      const page = targets.find(t => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    }
    catch {}
    await sleep(300)
  }
  throw new Error('Chrome CDP not reachable')
}

let msgId = 0
const pending = new Map()
let ws

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails))
  return res.result?.value
}

async function shot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`${OUT}${prefix}-${name}.png`, Buffer.from(data, 'base64'))
  console.log(`✓ ${prefix}-${name}.png`)
}

async function scrollTo(y) {
  await evaluate(`window.__lenis ? (window.__lenis.scrollTo(${y}, { immediate: true }), true) : window.scrollTo(0, ${y})`)
  await sleep(900)
}

try {
  ws = new WebSocket(await getWsUrl())
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id).resolve(msg.result ?? msg)
      pending.delete(msg.id)
    }
  }
  await new Promise(r => ws.onopen = r)

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })
  await send('Emulation.setDeviceMetricsOverride', {
    width: Number(width), height: Number(height), deviceScaleFactor: 1, mobile: Number(width) < 600,
  })

  await send('Page.navigate', { url: 'http://localhost:3005/' })
  await sleep(2500)
  await shot('1-splash')

  await sleep(4500) // let the splash finish
  await shot('2-hero')

  const vh = Number(height)
  await scrollTo(vh * 1.5)
  await shot('3-philosophie')

  await scrollTo(vh * 4.2)
  await shot('4-story')

  // Menu section — resolve its real offset (after the pin spacer)
  const menuTop = await evaluate(`(() => { const el = document.querySelector('#menu'); return el ? el.getBoundingClientRect().top + window.scrollY : 0 })()`)
  await scrollTo(menuTop + 100)
  await shot('5-menu')

  const docH = await evaluate('document.body.scrollHeight')
  await scrollTo(docH)
  await shot('6-footer')

  // Burger menu open
  await scrollTo(0)
  await evaluate(`document.querySelector('.burger').click(); true`)
  await sleep(1600)
  await shot('7-burger-open')

  // Burger menu closed again
  await evaluate(`document.querySelector('.burger').click(); true`)
  await sleep(1200)
  await shot('8-burger-closed')

  // Overlay must be gone (v-show display:none)
  const overlayVisible = await evaluate(`(() => { const o = document.querySelector('.menu-overlay'); return o ? getComputedStyle(o).display !== 'none' : false })()`)
  console.log('overlay visible after close:', overlayVisible)

  console.log('DONE')
}
catch (err) {
  console.error('FAIL', err)
  process.exitCode = 1
}
finally {
  ws?.close()
  chrome.kill()
}
