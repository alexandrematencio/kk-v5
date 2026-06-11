// Clean diagnostic on a real mobile-sized window (NO device emulation).
import { spawn } from 'node:child_process'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9228
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--window-size=390,844',
  '--no-first-run', '--user-data-dir=/tmp/kk-v5-chrome-d2', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
async function getWs(){for(let i=0;i<30;i++){try{const t=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();const p=t.find(x=>x.type==='page');if(p)return p.webSocketDebuggerUrl}catch{}await sleep(300)}throw new Error('no cdp')}
let id=0;const pend=new Map();let ws
function send(m,p={}){return new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:p}))})}
async function ev(e){const r=await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result?.value}
async function scrollTo(y){await ev(`window.__lenis?window.__lenis.scrollTo(${y},{immediate:true}):window.scrollTo(0,${y});true`);await sleep(700)}
try {
  ws=new WebSocket(await getWs())
  ws.onmessage=(e)=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m.result??m);pend.delete(m.id)}}
  await new Promise(r=>ws.onopen=r)
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true})
  await send('Page.navigate',{url:'http://localhost:3005/'})
  await sleep(7000)

  console.log('=== WIDTHS ===')
  console.log(await ev(`JSON.stringify({inner:innerWidth, client:document.documentElement.clientWidth, scrollW:document.documentElement.scrollWidth})`))
  console.log('=== H-OVERFLOW offenders (right>clientWidth) ===')
  console.log(await ev(`JSON.stringify([...document.querySelectorAll('body *')].map(el=>{const r=el.getBoundingClientRect();return {c:el.className?.toString().slice(0,30),l:Math.round(r.left),r:Math.round(r.right)}}).filter(o=>o.r>document.documentElement.clientWidth+1||o.l<-1).slice(0,12))`))

  console.log('=== NAV when scrolled 700px ===')
  await scrollTo(700)
  console.log(await ev(`(()=>{const n=document.querySelector('.site-nav');const r=n.getBoundingClientRect();const cs=getComputedStyle(n);return JSON.stringify({top:Math.round(r.top),height:Math.round(r.height),transform:cs.transform,backdrop:cs.backdropFilter||cs.webkitBackdropFilter,opacity:cs.opacity,scrolledClass:n.classList.contains('scrolled')})})()`))

  console.log('=== BURGER closed vs body-overflow-hidden ===')
  await scrollTo(0)
  const closed = await ev(`(()=>{const b=document.querySelector('.burger');const r=b.getBoundingClientRect();return JSON.stringify({right:Math.round(r.right),cx:Math.round(r.left+r.width/2),clientW:document.documentElement.clientWidth})})()`)
  console.log('closed:', closed)
  await ev(`document.body.style.overflow='hidden';true`); await sleep(300)
  const locked = await ev(`(()=>{const b=document.querySelector('.burger');const r=b.getBoundingClientRect();return JSON.stringify({right:Math.round(r.right),cx:Math.round(r.left+r.width/2),clientW:document.documentElement.clientWidth})})()`)
  console.log('overflow:hidden:', locked)
  await ev(`document.body.style.overflow='';true`)
  console.log('D2-END')
} catch(e){console.error('FAIL',e);process.exitCode=1} finally { ws?.close(); chrome.kill() }
