const STORAGE_KEY='edh-life';
const HISTORY_LIMIT=40;
const PLAYER_DEFAULTS=[
  ['Player 1','#d35a5a'],
  ['Player 2','#4d79d8'],
  ['Player 3','#4da66a'],
  ['Player 4','#c2923f']
];

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];

const ICON_PATHS={
  add:'M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z',
  remove:'M240-440q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h480q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H240Z',
  skull:'M240-80v-170q-39-17-68.5-45.5t-50-64.5q-20.5-36-31-77T80-520q0-158 112-259t288-101q176 0 288 101t112 259q0 42-10.5 83t-31 77q-20.5 36-50 64.5T720-250v170H240Zm80-80h40v-80h80v80h80v-80h80v80h40v-142q38-9 67.5-30t50-50q20.5-29 31.5-64t11-74q0-125-88.5-202.5T480-800q-143 0-231.5 77.5T160-520q0 39 11 74t31.5 64q20.5 29 50.5 50t67 30v142Zm100-200h120l-60-120-60 120Zm-80-80q33 0 56.5-23.5T420-520q0-33-23.5-56.5T340-600q-33 0-56.5 23.5T260-520q0 33 23.5 56.5T340-440Zm280 0q33 0 56.5-23.5T700-520q0-33-23.5-56.5T620-600q-33 0-56.5 23.5T540-520q0 33 23.5 56.5T620-440ZM480-160Z',
  experience:'m480-174-74 56q-12 9-24 .5t-7-22.5l29-92-73-52q-12-8-7-22t19-14h89l28-92-142-84q-18-11-28-29t-10-41v-234q0-33 23.5-56.5T360-880h240q33 0 56.5 23.5T680-800v234q0 23-10 41t-28 29l-142 84 28 92h89q14 0 19 14t-7 22l-73 52 29 92q5 14-7 22.5t-24-.5l-74-56ZM360-800v234l80 48v-282h-80Zm240 0h-80v282l80-48v-234Z',
  speed:'M418-340q24 24 62 23.5t56-27.5l169-253q9-14-2.5-25.5T677-625L424-456q-27 18-28.5 55t22.5 61Zm62-460q36 0 71 6t68 19q16 6 34 22.5t10 31.5q-8 15-36 20t-45-1q-25-9-50.5-13.5T480-720q-133 0-226.5 93.5T160-400q0 42 11.5 83t32.5 77h552q23-38 33.5-79t10.5-85q0-26-4.5-51T782-504q-6-17-2-33t18-27q13-10 28.5-6t21.5 18q15 35 23 71.5t9 74.5q1 57-13 109t-41 99q-11 18-30 28t-40 10H204q-21 0-40-10t-30-28q-26-45-40-95.5T80-400q0-83 31.5-155.5t86-127Q252-737 325-768.5T480-800Z'
};

const app=$('#app');
const settings=$('#settings');
const settingsPlayers=$('#ps');
const diceLayer=$('#dl');
const diceMenu=$('#dm');
const counterOverlay=$('#counters');
const counterPlayer=$('#counterPlayer');
const counterInputs={
  poison:$('#poisonInput'),
  experience:$('#experienceInput'),
  speed:$('#speedInput')
};

function createPlayer(index){
  const [name,color]=PLAYER_DEFAULTS[index];
  return {name,color,life:40,cmd:[0,0,0,0],poison:0,experience:0,speed:0};
}

function normalizeCounter(value,max=Infinity){
  const number=Number(value);
  if(!Number.isFinite(number))return 0;
  return Math.min(max,Math.max(0,Math.trunc(number)));
}

function normalizePlayer(player,index){
  const base=createPlayer(index);
  const life=Number(player?.life);
  return {
    name:typeof player?.name==='string'&&player.name.trim()?player.name:base.name,
    color:typeof player?.color==='string'?player.color:base.color,
    life:Number.isFinite(life)?life:40,
    cmd:Array.from({length:4},(_,i)=>normalizeCounter(player?.cmd?.[i])),
    poison:normalizeCounter(player?.poison),
    experience:normalizeCounter(player?.experience),
    speed:normalizeCounter(player?.speed,4)
  };
}

function normalizeState(raw){
  return {
    count:[2,3,4].includes(Number(raw?.count))?Number(raw.count):4,
    players:Array.from({length:4},(_,i)=>normalizePlayer(raw?.players?.[i],i)),
    hist:Array.isArray(raw?.hist)?raw.hist.slice(-HISTORY_LIMIT):[]
  };
}

function loadState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY));
    return raw?normalizeState(raw):normalizeState(null);
  }catch{
    return normalizeState(null);
  }
}

let state=loadState();

function saveState(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify({
    count:state.count,
    players:state.players,
    hist:state.hist.slice(-HISTORY_LIMIT)
  }));
}

function snapshot(){
  return JSON.stringify({count:state.count,players:state.players});
}

function pushHistory(){
  state.hist.push(snapshot());
  if(state.hist.length>HISTORY_LIMIT)state.hist.shift();
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[char]));
}

function icon(name,className='mi'){
  return `<svg class="${className}" viewBox="0 -960 960 960" aria-hidden="true"><path d="${ICON_PATHS[name]}"></path></svg>`;
}

function defeatState(player,index){
  for(let source=0;source<state.count;source++){
    if(source!==index&&(player.cmd[source]||0)>=21){
      return {defeated:true,reason:`COMMANDER DAMAGE 21 — ${state.players[source].name}`};
    }
  }
  if(player.poison>=10)return {defeated:true,reason:'POISON 10'};
  if(player.life<=0)return {defeated:true,reason:'LIFE 0'};
  return {defeated:false,reason:''};
}

function commanderCards(playerIndex){
  const cards=[];
  for(let source=0;source<state.count;source++){
    if(source===playerIndex)continue;
    const value=state.players[playerIndex].cmd[source]||0;
    const sourcePlayer=state.players[source];
    cards.push(`
      <div class="cc ${value>=18?'hot':''}" style="--c:${sourcePlayer.color}">
        <div class="cw">${escapeHtml(sourcePlayer.name)}</div>
        <div class="cv">${value}</div>
        <div class="cb">
          <button type="button" data-cmd="-1" data-t="${playerIndex}" data-s="${source}">−1</button>
          <button type="button" data-cmd="1" data-t="${playerIndex}" data-s="${source}">＋1</button>
        </div>
      </div>`);
  }
  return cards.join('');
}

function counterBadges(player){
  const badges=[];
  if(player.poison>0){
    badges.push(`<span class="counterBadge poison ${player.poison>=8?'hot':''}" aria-label="毒カウンター ${player.poison}">${icon('skull','counterIcon')}<b>${player.poison}</b></span>`);
  }
  if(player.experience>0){
    badges.push(`<span class="counterBadge experience" aria-label="経験カウンター ${player.experience}">${icon('experience','counterIcon')}<b>${player.experience}</b></span>`);
  }
  if(player.speed>0){
    badges.push(`<span class="counterBadge speed" aria-label="速度 ${player.speed}">${icon('speed','counterIcon')}<b>${player.speed}</b></span>`);
  }
  return badges.length?`<div class="counterBadges">${badges.join('')}</div>`:'';
}

function renderPlayers(){
  app.className=`c${state.count}`;
  app.innerHTML='';

  state.players.forEach((player,index)=>{
    const defeat=defeatState(player,index);
    const section=document.createElement('section');
    section.className=[
      'p',
      index>=state.count?'hide':'',
      defeat.defeated?'defeated':''
    ].filter(Boolean).join(' ');
    section.style.setProperty('--pc',player.color);
    section.innerHTML=`
      <div class="pc">
        <div class="name">${escapeHtml(player.name)}</div>
        ${counterBadges(player)}
        <div class="lifeRow">
          <button type="button" class="quick5" aria-label="${escapeHtml(player.name)}のライフを5減らす" data-life="${index}" data-d="-5">−5</button>
          <button type="button" class="delta" aria-label="${escapeHtml(player.name)}のライフを1減らす" data-life="${index}" data-d="-1">${icon('remove')}</button>
          <button type="button" class="life" aria-label="${escapeHtml(player.name)}の特殊カウンターを長押しして開く" data-life="${index}" data-d="0"><span class="lifeValue">${player.life}</span></button>
          <button type="button" class="delta" aria-label="${escapeHtml(player.name)}のライフを1増やす" data-life="${index}" data-d="1">${icon('add')}</button>
          <button type="button" class="quick5" aria-label="${escapeHtml(player.name)}のライフを5増やす" data-life="${index}" data-d="5">＋5</button>
        </div>
        <div class="cmd"><div class="cg">${commanderCards(index)}</div></div>
        <div class="dead">${escapeHtml(defeat.reason)}</div>
      </div>`;
    app.appendChild(section);
  });
}

function renderSettings(){
  settingsPlayers.innerHTML=state.players.map((player,index)=>`
    <div class="row">
      <b>Player ${index+1}</b>
      <div style="display:flex;gap:8px">
        <input type="text" data-n="${index}" value="${escapeHtml(player.name)}">
        <input type="color" data-c="${index}" value="${player.color}">
      </div>
    </div>`).join('');
}

function render(){
  renderPlayers();
  renderSettings();
}

function mutate(action){
  pushHistory();
  action();
  saveState();
  render();
}

app.addEventListener('click',event=>{
  const lifeButton=event.target.closest('[data-life]');
  if(lifeButton){
    const delta=Number(lifeButton.dataset.d);
    if(delta){
      const index=Number(lifeButton.dataset.life);
      mutate(()=>{state.players[index].life+=delta});
    }
    return;
  }

  const commanderButton=event.target.closest('[data-cmd]');
  if(!commanderButton)return;

  const target=Number(commanderButton.dataset.t);
  const source=Number(commanderButton.dataset.s);
  const delta=Number(commanderButton.dataset.cmd);
  const current=state.players[target].cmd[source]||0;
  const next=Math.max(0,current+delta);
  const applied=next-current;
  if(!applied)return;

  mutate(()=>{
    state.players[target].cmd[source]=next;
    state.players[target].life-=applied;
  });
});

let counterIndex=null;

function playerFacesOpposite(index){
  if(state.count===4)return index===0||index===1;
  if(state.count===3)return index===0;
  return index===0;
}

function syncCounterInputs(){
  if(counterIndex===null)return;
  const player=state.players[counterIndex];
  counterInputs.poison.value=String(player.poison);
  counterInputs.experience.value=String(player.experience);
  counterInputs.speed.value=String(player.speed);
}

function openCounters(index){
  counterIndex=index;
  const player=state.players[index];
  counterPlayer.textContent=player.name;
  syncCounterInputs();
  counterOverlay.classList.toggle('counter-flipped',playerFacesOpposite(index));
  counterOverlay.classList.add('show');
}

function closeCounters(){
  counterOverlay.classList.remove('show','counter-flipped');
  counterIndex=null;
}

function setCounter(type,next){
  if(counterIndex===null)return;
  const max=type==='speed'?4:Infinity;
  const value=normalizeCounter(next,max);
  if(value===state.players[counterIndex][type]){
    counterInputs[type].value=String(value);
    return;
  }
  mutate(()=>{state.players[counterIndex][type]=value});
  syncCounterInputs();
}

$$('[data-counter-minus]').forEach(button=>{
  button.addEventListener('click',()=>{
    if(counterIndex===null)return;
    const type=button.dataset.counterMinus;
    setCounter(type,state.players[counterIndex][type]-1);
  });
});
$$('[data-counter-plus]').forEach(button=>{
  button.addEventListener('click',()=>{
    if(counterIndex===null)return;
    const type=button.dataset.counterPlus;
    setCounter(type,state.players[counterIndex][type]+1);
  });
});
Object.entries(counterInputs).forEach(([type,input])=>{
  input.addEventListener('change',()=>setCounter(type,input.value));
});
$('#counterClose').addEventListener('click',closeCounters);
counterOverlay.addEventListener('click',event=>{
  if(event.target===counterOverlay)closeCounters();
});

let holdTarget=null;
let holdTimer=null;

function clearHold(){
  if(holdTimer){
    clearTimeout(holdTimer);
    holdTimer=null;
  }
  if(holdTarget)holdTarget.classList.remove('holding');
  holdTarget=null;
}

app.addEventListener('pointerdown',event=>{
  const life=event.target.closest('.life[data-life]');
  if(!life)return;
  if(event.pointerType==='mouse'&&event.button!==0)return;

  clearHold();
  holdTarget=life;
  life.classList.remove('holding');
  void life.offsetWidth;
  life.classList.add('holding');
  try{life.setPointerCapture?.(event.pointerId)}catch{}

  holdTimer=setTimeout(()=>{
    const index=Number(life.dataset.life);
    clearHold();
    openCounters(index);
  },300);
});

document.addEventListener('pointerup',clearHold,true);
document.addEventListener('pointercancel',clearHold,true);
window.addEventListener('blur',clearHold);
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible')clearHold();
});
app.addEventListener('contextmenu',event=>{
  if(event.target.closest('.life'))event.preventDefault();
});

settingsPlayers.addEventListener('change',event=>{
  const nameInput=event.target.closest('[data-n]');
  if(nameInput){
    const name=nameInput.value.trim();
    if(!name){renderSettings();return}
    const index=Number(nameInput.dataset.n);
    mutate(()=>{state.players[index].name=name});
    return;
  }

  const colorInput=event.target.closest('[data-c]');
  if(colorInput){
    const index=Number(colorInput.dataset.c);
    mutate(()=>{state.players[index].color=colorInput.value});
  }
});

$$('[data-count]').forEach(button=>{
  button.addEventListener('click',()=>{
    const count=Number(button.dataset.count);
    if(count===state.count)return;
    mutate(()=>{state.count=count});
  });
});

$('#undo').addEventListener('click',()=>{
  const previous=state.hist.pop();
  if(!previous)return;
  try{
    state=normalizeState({...JSON.parse(previous),hist:state.hist});
    saveState();
    render();
  }catch{}
});

$('#set').addEventListener('click',()=>settings.classList.add('show'));
$('#close').addEventListener('click',()=>settings.classList.remove('show'));
settings.addEventListener('click',event=>{
  if(event.target===settings)settings.classList.remove('show');
});

function resetGame(){
  mutate(()=>{
    state.players.forEach(player=>{
      player.life=40;
      player.cmd=[0,0,0,0];
      player.poison=0;
      player.experience=0;
      player.speed=0;
    });
  });
}

let resetArmed=false;
let resetTimer=null;
const resetButton=$('#reset');
resetButton.addEventListener('click',()=>{
  if(!resetArmed){
    resetArmed=true;
    resetButton.textContent='もう一度押してリセット';
    clearTimeout(resetTimer);
    resetTimer=setTimeout(()=>{
      resetArmed=false;
      resetButton.textContent='全リセット';
    },2500);
    return;
  }

  resetArmed=false;
  clearTimeout(resetTimer);
  resetGame();
  settings.classList.remove('show');
  resetButton.textContent='全リセット';
});

const quickReset=$('#quickReset');
let quickResetTimer=null;

function clearQuickReset(){
  if(quickResetTimer){
    clearTimeout(quickResetTimer);
    quickResetTimer=null;
  }
  quickReset.classList.remove('holding');
}

quickReset.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  clearQuickReset();
  quickReset.classList.add('holding');
  try{quickReset.setPointerCapture?.(event.pointerId)}catch{}
  quickResetTimer=setTimeout(()=>{
    quickResetTimer=null;
    quickReset.classList.remove('holding');
    resetGame();
    navigator.vibrate?.(35);
  },850);
});
quickReset.addEventListener('click',event=>{
  event.preventDefault();
  event.stopPropagation();
});
quickReset.addEventListener('contextmenu',event=>event.preventDefault());
document.addEventListener('pointerup',clearQuickReset,true);
document.addEventListener('pointercancel',clearQuickReset,true);
window.addEventListener('blur',clearQuickReset);

function d6(){
  if(window.crypto?.getRandomValues){
    const value=new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0]%6+1;
  }
  return Math.floor(Math.random()*6)+1;
}

function diceFace(value){
  const pips=Array.from({length:9},(_,index)=>`<i class="pip p${index+1}"></i>`).join('');
  return `<div class="face" data-v="${value}">${pips}</div>`;
}

function clearDice(){
  $$('.die').forEach(die=>die.remove());
}

function setRollPath(die,big){
  const random=(min,max)=>Math.round(min+Math.random()*(max-min));
  const x=big?130:48;
  const y=big?60:28;
  die.style.setProperty('--x0',`${random(-x,-x*.5)}px`);
  die.style.setProperty('--y0',`${random(-y,-y*.3)}px`);
  die.style.setProperty('--x1',`${random(x*.3,x)}px`);
  die.style.setProperty('--y1',`${random(-y,y*.1)}px`);
  die.style.setProperty('--x2',`${random(-x*.6,-8)}px`);
  die.style.setProperty('--y2',`${random(-4,y*.5)}px`);
  die.style.setProperty('--x3',`${random(6,x*.4)}px`);
  die.style.setProperty('--y3',`${random(-y*.3,8)}px`);
}

function animateDie(die,finalValue){
  die.classList.add('rolling');
  let previous=0;
  let frames=0;
  const timer=setInterval(()=>{
    let value;
    do value=d6(); while(value===previous);
    previous=value;
    die.innerHTML=diceFace(value);
    frames++;
    if(frames>=10){
      clearInterval(timer);
      setTimeout(()=>{
        die.innerHTML=diceFace(finalValue);
        die.classList.remove('rolling');
      },90);
    }
  },62);
}

function createDie({className,finalValue,big,host,delay=0,winner=false}){
  const die=document.createElement('div');
  die.className=`die ${className}`;
  setRollPath(die,big);
  die.innerHTML=diceFace(d6());
  die.style.animationDelay=`${delay}ms`;
  host.appendChild(die);

  setTimeout(()=>{
    animateDie(die,finalValue);
    if(winner){
      setTimeout(()=>{
        die.style.boxShadow='0 0 0 4px #ffcc66ad,0 18px 42px #0007';
      },820);
    }
  },delay);
}

function rollOne(){
  clearDice();
  createDie({className:'center',finalValue:d6(),big:true,host:diceLayer});
}

function rollAll(){
  clearDice();
  const players=$$('#app .p:not(.hide)');
  const rolls=players.map(player=>({player,value:d6()}));
  const highest=Math.max(...rolls.map(roll=>roll.value));
  rolls.forEach((roll,index)=>{
    createDie({
      className:'player',
      finalValue:roll.value,
      big:false,
      host:roll.player,
      delay:index*45,
      winner:roll.value===highest
    });
  });
}

$('#dice').addEventListener('click',event=>{
  event.stopPropagation();
  clearDice();
  diceMenu.classList.toggle('show');
});
$('#one').addEventListener('click',event=>{
  event.stopPropagation();
  diceMenu.classList.remove('show');
  rollOne();
});
$('#all').addEventListener('click',event=>{
  event.stopPropagation();
  diceMenu.classList.remove('show');
  rollAll();
});
document.addEventListener('click',()=>{
  diceMenu.classList.remove('show');
  clearDice();
});

const fullscreenButton=$('#fs');
const fullscreenElement=()=>document.fullscreenElement||document.webkitFullscreenElement;
function syncFullscreenButton(){
  const active=Boolean(fullscreenElement());
  fullscreenButton.classList.toggle('active',active);
  fullscreenButton.title=active?'フルスクリーン解除':'フルスクリーン';
}
fullscreenButton.addEventListener('click',async()=>{
  try{
    if(fullscreenElement()){
      await (document.exitFullscreen?.()||document.webkitExitFullscreen?.());
    }else{
      await (document.documentElement.requestFullscreen?.()||document.documentElement.webkitRequestFullscreen?.());
    }
  }catch{}
});
if(!document.documentElement.requestFullscreen&&!document.documentElement.webkitRequestFullscreen){
  fullscreenButton.style.display='none';
}
document.addEventListener('fullscreenchange',syncFullscreenButton);
document.addEventListener('webkitfullscreenchange',syncFullscreenButton);

async function requestWakeLock(){
  try{
    if('wakeLock' in navigator)window._edhWakeLock=await navigator.wakeLock.request('screen');
  }catch{}
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')requestWakeLock();
});
requestWakeLock();

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}

render();
