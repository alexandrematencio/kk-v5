// Verify the pinned menu preview: frame stays viewport-centered through the
// list, image follows the row crossing center, releases after the last dish.
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9224
const OUT = new URL('../_shots/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=1440,900',
  '--no-first-run', '--user-data-dir=/tmp/kk-v5-chrome-menu', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
      const page = targets.find(t => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    }
    catch {}
    await sleep(300)
  }
  throw new Error('CDP unreachable')
}

let msgId = 0
const pending = new Map()
let ws

function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++msgId
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  return res.result?.value
}

async function shot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`${OUT}${name}.png`, Buffer.from(data, 'base64'))
  console.log(`✓ ${name}.png`)
}

async function scrollTo(y) {
  await evaluate(`window.__lenis.scrollTo(${y}, { immediate: true }); true`)
  await sleep(900)
}

async function frameState() {
  return evaluate(`(() => {
    const f = document.querySelector('.preview-frame')
    if (!f) return null
    const r = f.getBoundingClientRect()
    const img = document.querySelector('.preview-img')
    return {
      centerY: Math.round(r.top + r.height / 2),
      viewportCenter: Math.round(innerHeight / 2),
      img: img ? img.src.split('/').pop() : null,
      caption: document.querySelector('.preview-name')?.textContent,
    }
  })()`)
}

try {
  ws = new WebSocket(await getWsUrl())
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result ?? m)
      pending.delete(m.id)
    }
  }
  await new Promise(r => ws.onopen = r)
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })

  await send('Page.navigate', { url: 'http://localhost:3005/' })
  await sleep(7000) // splash + entrance

  const menuTop = await evaluate(`document.querySelector('#menu').getBoundingClientRect().top + window.scrollY`)
  const menuH = await evaluate(`document.querySelector('#menu').offsetHeight`)

  const stops = [0.12, 0.3, 0.5, 0.7, 0.88]
  for (const [i, frac] of stops.entries()) {
    await scrollTo(menuTop + menuH * frac - 300)
    console.log(`stop ${frac}:`, JSON.stringify(await frameState()))
    await shot(`menu-pin-${i + 1}`)
  }

  console.log('DONE')
}
catch (e) {
  console.error('FAIL', e)
  process.exitCode = 1
}
finally {
  ws?.close()
  chrome.kill()
}
