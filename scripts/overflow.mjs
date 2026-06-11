// Find horizontal overflow culprits on mobile homepage
import { spawn } from 'node:child_process'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9226
const W = 390, H = 844
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--window-size=${W},${H}`,
  '--no-first-run', '--user-data-dir=/tmp/kk-v5-chrome-of', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
async function getWs() { for (let i=0;i<30;i++){ try { const t=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); const p=t.find(x=>x.type==='page'); if(p) return p.webSocketDebuggerUrl } catch{} await sleep(300) } throw new Error('no cdp') }
let id=0; const pend=new Map(); let ws
function send(m,p={}){return new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:p}))})}
async function ev(e){const r=await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result?.value}
try {
  ws = new WebSocket(await getWs())
  ws.onmessage = (e)=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m.result??m);pend.delete(m.id)}}
  await new Promise(r=>ws.onopen=r)
  await send('Page.enable'); await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true })
  await send('Page.navigate', { url: 'http://localhost:3005/' })
  await sleep(7000)
  const report = await ev(`(() => {
    const dw = document.documentElement.scrollWidth, iw = window.innerWidth
    const offenders = []
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.right > iw + 1 || r.left < -1) {
        offenders.push({ tag: el.tagName.toLowerCase(), cls: el.className?.toString().slice(0,40), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) })
      }
    })
    return { scrollWidth: dw, innerWidth: iw, overflowX: dw - iw, offenders: offenders.slice(0, 25) }
  })()`)
  console.log(JSON.stringify(report, null, 2))
  console.log('OF-END')
} catch(e){ console.error('FAIL', e); process.exitCode=1 } finally { ws?.close(); chrome.kill() }
