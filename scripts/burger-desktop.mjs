// Verify burger does NOT shift between closed/open on a real desktop viewport
// (classic scrollbar present, scrollbar-gutter:stable honored — no emulation).
import { spawn } from 'node:child_process'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9227
// NOTE: no --hide-scrollbars and no device emulation → a real scrollbar exists
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=1440,900',
  '--no-first-run', '--user-data-dir=/tmp/kk-v5-chrome-bd', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
async function getWs() { for (let i=0;i<30;i++){ try { const t=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); const p=t.find(x=>x.type==='page'); if(p) return p.webSocketDebuggerUrl } catch{} await sleep(300) } throw new Error('no cdp') }
let id=0; const pend=new Map(); let ws
function send(m,p={}){return new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:p}))})}
async function ev(e){const r=await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result?.value}
const rect = `(() => { const b=document.querySelector('.burger'); const r=b.getBoundingClientRect(); return { right:+r.right.toFixed(1), cx:+(r.left+r.width/2).toFixed(1), cy:+(r.top+r.height/2).toFixed(1) } })()`
try {
  ws = new WebSocket(await getWs())
  ws.onmessage = (e)=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m.result??m);pend.delete(m.id)}}
  await new Promise(r=>ws.onopen=r)
  await send('Page.enable'); await send('Runtime.enable')
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })
  await send('Page.navigate', { url: 'http://localhost:3005/' })
  await sleep(7000)
  const gutter = await ev(`getComputedStyle(document.documentElement).scrollbarGutter`)
  const sbw = await ev(`window.innerWidth - document.documentElement.clientWidth`)
  console.log('scrollbar-gutter =', gutter, '| live scrollbar width =', sbw)
  const closed = await ev(rect)
  await ev(`document.querySelector('.burger').click(); true`); await sleep(1500)
  const open = await ev(rect)
  console.log('CLOSED', JSON.stringify(closed))
  console.log('OPEN  ', JSON.stringify(open))
  console.log('dx =', (open.cx - closed.cx).toFixed(1), ' dy =', (open.cy - closed.cy).toFixed(1))
  console.log('BD-END')
} catch(e){ console.error('FAIL', e); process.exitCode=1 } finally { ws?.close(); chrome.kill() }
