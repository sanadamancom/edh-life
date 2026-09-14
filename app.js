const D=[['Player 1','#d35a5a'],['Player 2','#4d79d8'],['Player 3','#4da66a'],['Player 4','#c2923f']];
let S=load()||{count:4,players:D.map(x=>({name:x[0],color:x[1],life:40,cmd:[0,0,0,0]})),hist:[]};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ICON_PATHS={
  add:'M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z',
  remove:'M240-440q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h480q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H240Z'
};
const icon=n=>`<svg class="mi" viewBox="0 -960 960 960" aria-hidden="true"><path d="${ICON_PATHS[n]}"></path></svg>`;
function syncViewport(){
  const v=window.visualViewport;
  const w=Math.round(v?v.width:window.innerWidth),h=Math.round(v?v.height:window.innerHeight);
  const scale=Math.max(.72,Math.min(2.1,Math.min(w/844,h/390)));
  document.documentElement.style.setProperty('--app-w',w+'px');
  document.documentElement.style.setProperty('--app-h',h+'px');
  document.documentElement.style.setProperty('--ui-scale',scale.toFixed(3));
}
syncViewport();
window.addEventListener('resize',syncViewport);
window.addEventListener('orientationchange',()=>setTimeout(syncViewport,60));
window.addEventListener('pageshow',()=>{syncViewport();setTimeout(syncViewport,120)});
window.visualViewport?.addEventListener('resize',syncViewport);
function load(){try{return JSON.parse(localStorage.getItem('edh-life'))}catch{return null}}
function save(){localStorage.setItem('edh-life',JSON.stringify({...S,hist:S.hist.slice(-40)}))}
function snap(){return JSON.stringify({count:S.count,players:S.players})}
function push(){S.hist.push(snap());if(S.hist.length>40)S.hist.shift()}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function dead(p,i){if(p.life<=0)return'ライフ0以下';for(let j=0;j<S.count;j++)if(i!==j&&(p.cmd[j]||0)>=21)return'統率者ダメージ21+';return''}
function cards(i){let a=[];for(let j=0;j<S.count;j++){if(i===j)continue;let v=S.players[i].cmd[j]||0;a.push(`<div class="cc ${v>=18?'hot':''}" style="--c:${S.players[j].color}"><div class="cw">${esc(S.players[j].name)}</div><div class="cv">${v}</div><div class="cb"><button data-cmd="-1" data-t="${i}" data-s="${j}">−1</button><button data-cmd="1" data-t="${i}" data-s="${j}">＋1</button></div></div>`)}return a.join('')}
function render(){let app=$('#app');app.className='c'+S.count;app.innerHTML='';S.players.forEach((p,i)=>{let e=document.createElement('section');e.className='p'+(i>=S.count?' hide':'');e.style.setProperty('--pc',p.color);let d=dead(p,i);e.innerHTML=`<div class="pc"><div class="name">${esc(p.name)}</div><div class="lifeRow"><button class="quick5" aria-label="${esc(p.name)}のライフを5減らす" data-life="${i}" data-d="-5">−5</button><button class="delta" aria-label="${esc(p.name)}のライフを1減らす" data-life="${i}" data-d="-1">${icon('remove')}</button><button class="life" aria-label="${esc(p.name)}のライフを長押しして直接入力" data-life="${i}" data-d="0">${p.life}</button><button class="delta" aria-label="${esc(p.name)}のライフを1増やす" data-life="${i}" data-d="1">${icon('add')}</button><button class="quick5" aria-label="${esc(p.name)}のライフを5増やす" data-life="${i}" data-d="5">＋5</button></div><div class="cmd"><div class="cg">${cards(i)}</div></div><div class="dead">${d}</div></div>`;app.appendChild(e)});bind();renderSettings()}
function editLife(i){let v=prompt(`${S.players[i].name} のライフ`,S.players[i].life);if(v===null||Number.isNaN(+v))return;push();S.players[i].life=parseInt(v,10);save();render()}
function bind(){
  $$('[data-life]').forEach(b=>{
    const d=+b.dataset.d;
    if(!d)return;
    b.onclick=()=>{let i=+b.dataset.life;push();S.players[i].life+=d;save();render()};
  });
  $$('.life[data-life]').forEach(b=>{
    let timer=null;
    const cancel=()=>{if(timer){clearTimeout(timer);timer=null}};
    b.onpointerdown=e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      cancel();
      try{b.setPointerCapture?.(e.pointerId)}catch{}
      timer=setTimeout(()=>{timer=null;editLife(+b.dataset.life)},600);
    };
    b.onpointerup=cancel;
    b.onpointercancel=cancel;
    b.onclick=e=>e.preventDefault();
    b.oncontextmenu=e=>e.preventDefault();
  });
  $$('[data-cmd]').forEach(b=>b.onclick=()=>{let t=+b.dataset.t,s=+b.dataset.s,d=+b.dataset.cmd,c=S.players[t].cmd[s]||0,n=Math.max(0,c+d),a=n-c;if(!a)return;push();S.players[t].cmd[s]=n;S.players[t].life-=a;save();render()})
}
function renderSettings(){let x=$('#ps');x.innerHTML='';S.players.forEach((p,i)=>{let r=document.createElement('div');r.className='row';r.innerHTML=`<b>Player ${i+1}</b><div style="display:flex;gap:8px"><input type="text" data-n="${i}" value="${esc(p.name)}"><input type="color" data-c="${i}" value="${p.color}"></div>`;x.appendChild(r)});$$('[data-n]').forEach(x=>x.onchange=()=>{if(!x.value.trim())return;push();S.players[+x.dataset.n].name=x.value.trim();save();render()});$$('[data-c]').forEach(x=>x.onchange=()=>{push();S.players[+x.dataset.c].color=x.value;save();render()})}
$$('[data-count]').forEach(b=>b.onclick=()=>{let n=+b.dataset.count;if(n===S.count)return;push();S.count=n;save();render()});
$('#undo').onclick=()=>{let p=S.hist.pop();if(!p)return;let x=JSON.parse(p);S.count=x.count;S.players=x.players;save();render()};
$('#set').onclick=()=>$('#settings').classList.add('show');$('#close').onclick=()=>$('#settings').classList.remove('show');$('#settings').onclick=e=>{if(e.target.id==='settings')e.currentTarget.classList.remove('show')};
let armed=false,rt;$('#reset').onclick=()=>{if(!armed){armed=true;$('#reset').textContent='もう一度押してリセット';clearTimeout(rt);rt=setTimeout(()=>{armed=false;$('#reset').textContent='全リセット'},2500);return}armed=false;clearTimeout(rt);push();S.players.forEach(p=>{p.life=40;p.cmd=[0,0,0,0]});save();render();$('#settings').classList.remove('show')};
function d6(){if(window.crypto&&crypto.getRandomValues){let a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%6+1}return Math.floor(Math.random()*6)+1}
function face(v){return`<div class="face" data-v="${v}">${[1,2,3,4,5,6,7,8,9].map(n=>`<i class="pip p${n}"></i>`).join('')}</div>`}
function clearDice(){$$('.die').forEach(x=>x.remove())}
function path(d,big){let r=(a,z)=>Math.round(a+Math.random()*(z-a)),x=big?130:48,y=big?60:28;d.style.setProperty('--x0',r(-x,-x*.5)+'px');d.style.setProperty('--y0',r(-y,-y*.3)+'px');d.style.setProperty('--x1',r(x*.3,x)+'px');d.style.setProperty('--y1',r(-y,y*.1)+'px');d.style.setProperty('--x2',r(-x*.6,-8)+'px');d.style.setProperty('--y2',r(-4,y*.5)+'px');d.style.setProperty('--x3',r(6,x*.4)+'px');d.style.setProperty('--y3',r(-y*.3,8)+'px')}
function animate(d,final){d.classList.add('rolling');let last=0,n=0,t=setInterval(()=>{let v;do v=d6();while(v===last);last=v;d.innerHTML=face(v);if(++n>=10){clearInterval(t);setTimeout(()=>{d.innerHTML=face(final);d.classList.remove('rolling')},90)}},62)}
function mkDie(cls,final,big,host,delay=0,win=false){let d=document.createElement('div');d.className='die '+cls;path(d,big);d.innerHTML=face(d6());d.style.animationDelay=delay+'ms';host.appendChild(d);setTimeout(()=>{animate(d,final);if(win)setTimeout(()=>d.style.boxShadow='0 0 0 4px #ffcc66ad,0 18px 42px #0007',820)},delay)}
function one(){clearDice();mkDie('center',d6(),true,$('#dl'))}
function all(){clearDice();let ps=$$('#app .p:not(.hide)'),rs=ps.map(p=>({p,v:d6()})),hi=Math.max(...rs.map(r=>r.v));rs.forEach((r,i)=>mkDie('player',r.v,false,r.p,i*45,r.v===hi))}
const dm=$('#dm');$('#dice').onclick=e=>{e.stopPropagation();clearDice();dm.classList.toggle('show')};$('#one').onclick=e=>{e.stopPropagation();dm.classList.remove('show');one()};$('#all').onclick=e=>{e.stopPropagation();dm.classList.remove('show');all()};document.addEventListener('click',()=>{dm.classList.remove('show');clearDice()});
const fs=$('#fs');function full(){return document.fullscreenElement||document.webkitFullscreenElement}function updateFs(){fs.classList.toggle('active',!!full());fs.title=full()?'フルスクリーン解除':'フルスクリーン'}fs.onclick=async()=>{try{if(full())await(document.exitFullscreen?.()||document.webkitExitFullscreen?.());else await(document.documentElement.requestFullscreen?.()||document.documentElement.webkitRequestFullscreen?.())}catch{}};if(!document.documentElement.requestFullscreen&&!document.documentElement.webkitRequestFullscreen)fs.style.display='none';document.addEventListener('fullscreenchange',updateFs);document.addEventListener('webkitfullscreenchange',updateFs);
async function awake(){try{if('wakeLock'in navigator)window._wl=await navigator.wakeLock.request('screen')}catch{}}document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')awake()});awake();
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
render();