// Verify mobile sticky category tabs in La carte (kk-v1 device, ported)
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9229
const OUT = new URL('../_shots/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=390,844',
  '--no-first-run', '--user-data-dir=/tmp/kk-v5-chrome-tabs', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
async function getWs(){for(let i=0;i<30;i++){try{const t=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();const p=t.find(x=>x.type==='page');if(p)return p.webSocketDebuggerUrl}catch{}await sleep(300)}throw new Error('no cdp')}
let id=0;const pend=new Map();let ws
function send(m,p={}){return new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:p}))})}
async function ev(e){const r=await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result?.value}
async function shot(n){const{data}=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${OUT}${n}.png`,Buffer.from(data,'base64'));console.log(`✓ ${n}.png`)}
async function scrollTo(y){await ev(`window.__lenis?window.__lenis.scrollTo(${y},{immediate:true}):window.scrollTo(0,${y});true`);await sleep(800)}
const tabsState = `(()=>{const t=document.querySelector('.menu-tabs');if(!t)return null;const r=t.getBoundingClientRect();const cs=getComputedStyle(t);return {display:cs.display,top:Math.round(r.top),active:document.querySelector('.tab.active .tab-latin')?.textContent}})()`
try {
  ws=new WebSocket(await getWs())
  ws.onmessage=(e)=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m.result??m);pend.delete(m.id)}}
  await new Promise(r=>ws.onopen=r)
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true})
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true})
  await send('Page.navigate',{url:'http://localhost:3005/'})
  await sleep(7000)

  console.log('overflow check:', await ev(`JSON.stringify({client:document.documentElement.clientWidth,scrollW:document.documentElement.scrollWidth})`))
  const menuTop = await ev(`document.querySelector('#menu').getBoundingClientRect().top + window.scrollY`)
  const menuH = await ev(`document.querySelector('#menu').offsetHeight`)

  await scrollTo(menuTop + 60)
  console.log('at menu top:   ', JSON.stringify(await ev(tabsState)))
  await shot('tabs-1-top')

  await scrollTo(menuTop + menuH * 0.45)
  console.log('mid (plats):   ', JSON.stringify(await ev(tabsState)))
  await shot('tabs-2-mid')

  await scrollTo(menuTop + menuH * 0.78)
  console.log('late (dessert):', JSON.stringify(await ev(tabsState)))
  await shot('tabs-3-late')

  // jump via tab click: tap "Boissons" (last tab)
  await ev(`[...document.querySelectorAll('.tab')].at(-1).click(); true`)
  await sleep(1400)
  console.log('after tap Boissons:', JSON.stringify(await ev(tabsState)))
  await shot('tabs-4-jump')

  // desktop check: tabs hidden at 1440
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false})
  await sleep(800)
  console.log('desktop display:', await ev(`getComputedStyle(document.querySelector('.menu-tabs')).display`))
  console.log('TABS-END')
} catch(e){console.error('FAIL',e);process.exitCode=1} finally { ws?.close(); chrome.kill() }
