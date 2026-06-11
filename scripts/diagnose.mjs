// Diagnostic: mobile burger button position (closed vs open) + menu scroll behavior
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9225
const OUT = new URL('../_shots/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const W = 390, H = 844
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--window-size=${W},${H}`,
  '--no-first-run', '--user-data-dir=/tmp/kk-v5-chrome-diag', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const t = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
      const p = t.find(x => x.type === 'page')
      if (p) return p.webSocketDebuggerUrl
    } catch {}
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
  if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails))
  return res.result?.value
}
async function shot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`${OUT}${name}.png`, Buffer.from(data, 'base64'))
  console.log(`  shot ${name}.png`)
}
async function scrollTo(y) {
  await evaluate(`window.__lenis ? (window.__lenis.scrollTo(${y}, { immediate: true }), true) : (window.scrollTo(0, ${y}), true)`)
  await sleep(800)
}

try {
  ws = new WebSocket(await getWsUrl())
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id) }
  }
  await new Promise(r => ws.onopen = r)
  await send('Page.enable'); await send('Runtime.enable')
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true })
  await send('Page.navigate', { url: 'http://localhost:3005/' })
  await sleep(7000)

  // ---- BURGER closed rect ----
  const burgerClosed = await evaluate(`(() => {
    const b = document.querySelector('.burger'); const r = b.getBoundingClientRect()
    const lines = [...document.querySelectorAll('.burger-line')].map(l => { const lr = l.getBoundingClientRect(); return { cx: +(lr.left+lr.width/2).toFixed(1), cy: +(lr.top+lr.height/2).toFixed(1) } })
    return { btn: { left:+r.left.toFixed(1), top:+r.top.toFixed(1), right:+r.right.toFixed(1), w:+r.width.toFixed(1), h:+r.height.toFixed(1), cx:+(r.left+r.width/2).toFixed(1), cy:+(r.top+r.height/2).toFixed(1) }, lines }
  })()`)
  console.log('BURGER CLOSED:', JSON.stringify(burgerClosed))

  // open
  await evaluate(`document.querySelector('.burger').click(); true`)
  await sleep(1500)
  const burgerOpen = await evaluate(`(() => {
    const b = document.querySelector('.burger'); const r = b.getBoundingClientRect()
    const lines = [...document.querySelectorAll('.burger-line')].map(l => { const lr = l.getBoundingClientRect(); return { cx: +(lr.left+lr.width/2).toFixed(1), cy: +(lr.top+lr.height/2).toFixed(1) } })
    return { btn: { left:+r.left.toFixed(1), top:+r.top.toFixed(1), right:+r.right.toFixed(1), w:+r.width.toFixed(1), h:+r.height.toFixed(1), cx:+(r.left+r.width/2).toFixed(1), cy:+(r.top+r.height/2).toFixed(1) }, lines }
  })()`)
  console.log('BURGER OPEN:  ', JSON.stringify(burgerOpen))
  console.log('  btn shift  dx=', (burgerOpen.btn.cx - burgerClosed.btn.cx).toFixed(1), ' dy=', (burgerOpen.btn.cy - burgerClosed.btn.cy).toFixed(1))
  // close
  await evaluate(`document.querySelector('.burger').click(); true`)
  await sleep(1200)

  // ---- MENU scroll-through ----
  console.log('\nMENU SECTION (mobile):')
  const previewDisplay = await evaluate(`(() => { const c = document.querySelector('.menu-preview-col'); return c ? getComputedStyle(c).display : 'none-el' })()`)
  console.log('  .menu-preview-col display =', previewDisplay)
  const stickyInfo = await evaluate(`(() => { const s = document.querySelector('.preview-sticky'); if(!s) return 'no-el'; const cs = getComputedStyle(s); return { position: cs.position, height: cs.height, visible: s.offsetParent !== null } })()`)
  console.log('  .preview-sticky =', JSON.stringify(stickyInfo))

  const menuTop = await evaluate(`document.querySelector('#menu').getBoundingClientRect().top + window.scrollY`)
  const menuH = await evaluate(`document.querySelector('#menu').offsetHeight`)
  console.log('  menuTop=', Math.round(menuTop), ' menuH=', menuH)

  for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
    await scrollTo(menuTop + menuH * frac - 200)
    const state = await evaluate(`(() => {
      const m = document.querySelector('#menu'); const r = m.getBoundingClientRect()
      // any element pinned/stuck above the fold inside menu?
      const sticky = document.querySelector('.preview-sticky')
      const sr = sticky ? sticky.getBoundingClientRect() : null
      return { menuTopRel: Math.round(r.top), stickyTopRel: sr ? Math.round(sr.top) : null, scrollY: Math.round(window.scrollY) }
    })()`)
    console.log('  frac', frac, JSON.stringify(state))
  }
  await scrollTo(menuTop + menuH * 0.4)
  await shot('diag-menu-mid')

  console.log('DONE')
} catch (e) {
  console.error('FAIL', e)
  process.exitCode = 1
} finally {
  ws?.close(); chrome.kill()
}
