(()=>{
  const HOLD_MS=500;
  const diceButton=document.getElementById('dice');
  const diceMenu=document.getElementById('dm');
  const diceLayer=document.getElementById('dl');
  const diceWrap=diceButton?.closest('.dw');
  const tools=document.getElementById('tools');
  if(!diceButton||!diceMenu||!diceLayer||!diceWrap||!tools||typeof rollOne!=='function')return;

  /* D6 single-roll and coin are now direct actions, so remove their duplicate
     entries from the long-press dice menu. */
  document.getElementById('one')?.remove();
  document.getElementById('coin')?.remove();

  const style=document.createElement('style');
  style.id='v2-quick-dice-coin-style';
  style.textContent=`
    #dice{position:relative}
    #dice::after{
      content:"";
      position:absolute;
      right:5px;
      bottom:5px;
      width:4px;
      height:4px;
      border-radius:50%;
      background:currentColor;
      opacity:.46;
      pointer-events:none
    }
    #coinQuick .coinQuickIcon{
      width:100%;
      height:100%;
      fill:none;
      stroke:currentColor;
      stroke-width:72;
      stroke-linecap:round;
      stroke-linejoin:round
    }
    #dm.dm{
      grid-template-columns:repeat(2,minmax(0,1fr));
    }
    #dm #randomPlayer{grid-column:1/-1}

    /* Coin result is intentionally independent from the D6 result geometry. */
    .die.coinTossResult{
      width:clamp(150px,calc(var(--tool-size) * 3.65),190px)!important;
      height:clamp(196px,calc(var(--tool-size) * 4.65),236px)!important;
      overflow:visible!important;
      border:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
      animation:none!important;
      perspective:760px;
      pointer-events:none
    }
    .coinTossScene{
      position:relative;
      width:100%;
      height:100%;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      perspective:760px;
      transform-style:preserve-3d
    }
    .coinRotor{
      position:relative;
      z-index:2;
      width:clamp(132px,calc(var(--tool-size) * 3.18),164px);
      height:clamp(132px,calc(var(--tool-size) * 3.18),164px);
      transform-style:preserve-3d;
      will-change:transform
    }
    .coinFace3d,
    .coinStaticFace{
      position:absolute;
      inset:0;
      display:grid;
      place-items:center;
      overflow:hidden;
      border:4px solid #f1d47e;
      border-radius:50%;
      box-shadow:
        inset 0 0 0 3px rgba(83,45,5,.62),
        inset 0 0 0 8px rgba(255,232,164,.34),
        inset 0 0 22px rgba(61,31,2,.62),
        0 7px 14px rgba(0,0,0,.26)
    }
    .coinFace3d{
      backface-visibility:hidden;
      -webkit-backface-visibility:hidden
    }
    .coinFace3d::before,
    .coinStaticFace::before{
      content:"";
      position:absolute;
      inset:9px;
      border:2px solid currentColor;
      border-radius:50%;
      opacity:.42
    }
    .coinFace3d.heads,
    .coinStaticFace.heads{
      color:#5a3308;
      background:
        radial-gradient(circle at 34% 27%,rgba(255,255,255,.76) 0 4%,transparent 5%),
        radial-gradient(circle at 38% 34%,#ffe7aa 0 8%,#dbaa42 36%,#a66d17 68%,#683d08 100%)
    }
    .coinFace3d.heads{transform:translateZ(4px)}
    .coinFace3d.tails,
    .coinStaticFace.tails{
      color:#332d12;
      border-color:#d8c683;
      background:
        radial-gradient(circle at 34% 27%,rgba(255,255,255,.62) 0 4%,transparent 5%),
        radial-gradient(circle at 38% 34%,#e4d79c 0 8%,#b49a50 36%,#75602c 68%,#433613 100%)
    }
    .coinFace3d.tails{transform:rotateX(180deg) translateZ(4px)}
    .coinFace3d svg,
    .coinStaticFace svg{
      position:relative;
      z-index:1;
      width:57%;
      height:57%;
      fill:none;
      stroke:currentColor;
      stroke-width:34;
      stroke-linecap:round;
      stroke-linejoin:round;
      filter:drop-shadow(0 2px 0 rgba(255,244,201,.42))
    }
    .coinFaceWord{
      position:absolute;
      left:50%;
      bottom:17%;
      z-index:2;
      min-width:46px;
      padding:3px 9px 4px;
      transform:translateX(-50%);
      border:1px solid currentColor;
      border-radius:999px;
      background:rgba(255,242,194,.28);
      font-size:clamp(17px,calc(var(--tool-size) * .46),22px);
      font-weight:950;
      line-height:1;
      text-align:center;
      text-shadow:0 1px 0 rgba(255,255,255,.42)
    }
    .coinGroundShadow{
      position:absolute;
      left:50%;
      top:62%;
      z-index:0;
      width:clamp(96px,calc(var(--tool-size) * 2.4),126px);
      height:22px;
      transform:translate(-50%,-50%);
      border-radius:50%;
      background:rgba(0,0,0,.46);
      filter:blur(8px);
      opacity:.68;
      will-change:transform,opacity
    }
    .coinResultLabel{
      position:relative;
      z-index:3;
      min-width:80px;
      margin-top:10px;
      padding:5px 14px 6px;
      border:2px solid rgba(255,255,255,.72);
      border-radius:999px;
      background:rgba(8,11,16,.92);
      box-shadow:0 7px 18px rgba(0,0,0,.42);
      color:#fff;
      font-size:clamp(20px,calc(var(--tool-size) * .58),28px);
      font-weight:950;
      line-height:1;
      letter-spacing:.08em;
      text-align:center;
      opacity:0;
      transform:translateY(-3px) scale(.94);
      transition:opacity 150ms ease-out,transform 150ms ease-out
    }
    .coinResultLabel.show{
      opacity:1;
      transform:translateY(0) scale(1)
    }
    .coinTossResult[data-side="heads"] .coinResultLabel{
      border-color:#f2d57f;
      color:#ffe7a5
    }
    .coinTossResult[data-side="tails"] .coinResultLabel{
      border-color:#d7ca98;
      color:#eee4b9
    }
    @media (prefers-reduced-motion:reduce){
      .coinResultLabel{transition:none}
    }
  `;
  document.head.appendChild(style);

  const coinButton=document.createElement('button');
  coinButton.type='button';
  coinButton.id='coinQuick';
  coinButton.title='コイントス';
  coinButton.setAttribute('aria-label','コイントス');
  coinButton.innerHTML=`
    <svg class="coinQuickIcon" viewBox="0 0 960 960" aria-hidden="true">
      <circle cx="480" cy="480" r="310"></circle>
      <circle cx="480" cy="480" r="174"></circle>
      <path d="M480 306v348"></path>
    </svg>`;
  diceWrap.insertAdjacentElement('afterend',coinButton);

  const randomInt=max=>{
    if(max<=0)return 0;
    if(window.crypto?.getRandomValues){
      const value=new Uint32Array(1);
      crypto.getRandomValues(value);
      return value[0]%max;
    }
    return Math.floor(Math.random()*max);
  };

  const clearResults=()=>document.querySelectorAll('.die').forEach(die=>die.remove());
  const closeMenu=()=>diceMenu.classList.remove('show');

  function coinArt(type){
    if(type==='heads'){
      return `
        <svg viewBox="0 0 512 512" aria-hidden="true">
          <circle cx="256" cy="220" r="72"></circle>
          <path d="M256 43v55M256 342v55M79 220h55M378 220h55M131 95l39 39M342 306l39 39M381 95l-39 39M170 306l-39 39"></path>
        </svg>`;
    }
    return `
      <svg viewBox="0 0 512 512" aria-hidden="true">
        <path d="M329 77c-96 19-168 103-168 204 0 61 27 117 70 155-93-12-165-91-165-187 0-103 83-186 186-186 28 0 54 5 77 14Z"></path>
        <path d="M341 181l17 36 39 6-28 27 7 39-35-18-35 18 7-39-28-27 39-6 17-36Z"></path>
      </svg>`;
  }

  function coinFaceMarkup(type,label,staticFace=false){
    return `
      <div class="${staticFace?'coinStaticFace':'coinFace3d'} ${type}">
        ${coinArt(type)}
        <span class="coinFaceWord">${label}</span>
      </div>`;
  }

  function animateCoin(coin,side,label){
    const rotor=coin.querySelector('.coinRotor');
    const shadow=coin.querySelector('.coinGroundShadow');
    const resultLabel=coin.querySelector('.coinResultLabel');
    if(!rotor)return;

    let settled=false;
    let motion=null;
    let shadowMotion=null;
    const settle=()=>{
      if(settled)return;
      settled=true;
      try{motion?.cancel()}catch{}
      try{shadowMotion?.cancel()}catch{}
      rotor.style.transform='none';
      rotor.style.willChange='auto';
      rotor.innerHTML=coinFaceMarkup(side,label,true);
      if(shadow){
        shadow.style.transform='translate(-50%,-50%) scale(1)';
        shadow.style.opacity='.68';
        shadow.style.willChange='auto';
      }
      resultLabel?.classList.add('show');
    };

    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(reduced||typeof rotor.animate!=='function'){
      settle();
      return;
    }

    const end=side==='heads'?1440:1620;
    const rotation=value=>Math.round(end*value);
    motion=rotor.animate([
      {transform:'translate3d(0,34px,0) rotateX(0deg) rotateZ(-6deg) scale(.78)',offset:0},
      {transform:`translate3d(0,-66px,26px) rotateX(${rotation(.25)}deg) rotateZ(7deg) scale(.92)`,offset:.22},
      {transform:`translate3d(0,-112px,44px) rotateX(${rotation(.55)}deg) rotateZ(-5deg) scale(1.02)`,offset:.50},
      {transform:`translate3d(0,-52px,20px) rotateX(${rotation(.82)}deg) rotateZ(3deg) scale(.98)`,offset:.78},
      {transform:`translate3d(0,9px,0) rotateX(${rotation(.96)}deg) rotateZ(-1deg) scale(1.01)`,offset:.93},
      {transform:`translate3d(0,0,0) rotateX(${end}deg) rotateZ(0deg) scale(1)`,offset:1}
    ],{
      duration:900,
      easing:'cubic-bezier(.18,.76,.24,1)',
      fill:'none'
    });

    shadowMotion=shadow?.animate([
      {transform:'translate(-50%,-50%) scale(1.05)',opacity:.68,offset:0},
      {transform:'translate(-50%,-50%) scale(.48)',opacity:.22,offset:.48},
      {transform:'translate(-50%,-50%) scale(.72)',opacity:.36,offset:.78},
      {transform:'translate(-50%,-50%) scale(1.08)',opacity:.78,offset:.94},
      {transform:'translate(-50%,-50%) scale(1)',opacity:.68,offset:1}
    ],{
      duration:900,
      easing:'cubic-bezier(.18,.76,.24,1)',
      fill:'none'
    });

    motion.onfinish=settle;
    motion.oncancel=()=>{};
    setTimeout(settle,980);
  }

  function flipCoin(){
    clearResults();
    closeMenu();
    const side=randomInt(2)===0?'heads':'tails';
    const label=side==='heads'?'表':'裏';
    const coin=document.createElement('div');
    coin.className='die center coinTossResult';
    coin.dataset.side=side;
    coin.setAttribute('role','img');
    coin.setAttribute('aria-label',`コイントス ${label}`);
    coin.innerHTML=`
      <div class="coinTossScene">
        <div class="coinGroundShadow" aria-hidden="true"></div>
        <div class="coinRotor" aria-hidden="true">
          ${coinFaceMarkup('heads','表')}
          ${coinFaceMarkup('tails','裏')}
        </div>
        <div class="coinResultLabel">${label}</div>
      </div>`;
    diceLayer.appendChild(coin);
    requestAnimationFrame(()=>animateCoin(coin,side,label));
    navigator.vibrate?.(18);
  }

  let holdTimer=0;
  let holdPointer=null;
  let holdTriggered=false;
  let startX=0;
  let startY=0;

  function clearHold(){
    if(holdTimer){
      clearTimeout(holdTimer);
      holdTimer=0;
    }
    holdPointer=null;
  }

  diceButton.title='ダイス：タップでD6 / 長押しでその他';
  diceButton.setAttribute('aria-label','ダイス。タップでD6、長押しでその他のダイスメニュー');

  diceButton.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    clearHold();
    holdTriggered=false;
    holdPointer=event.pointerId;
    startX=event.clientX;
    startY=event.clientY;
    holdTimer=setTimeout(()=>{
      holdTimer=0;
      if(holdPointer!==event.pointerId)return;
      holdTriggered=true;
      clearResults();
      diceMenu.classList.add('show');
      navigator.vibrate?.(16);
    },HOLD_MS);
  },true);

  diceButton.addEventListener('pointermove',event=>{
    if(holdPointer!==event.pointerId)return;
    if(Math.hypot(event.clientX-startX,event.clientY-startY)>12)clearHold();
  },true);

  document.addEventListener('pointerup',event=>{
    if(holdPointer===event.pointerId)clearHold();
  },true);
  document.addEventListener('pointercancel',event=>{
    if(holdPointer===event.pointerId){holdTriggered=false;clearHold()}
  },true);
  window.addEventListener('blur',()=>{holdTriggered=false;clearHold()});

  /* Capture beats app.js's legacy click-to-open-menu handler. A normal tap rolls
     one D6 immediately; the click generated after a long press is consumed. */
  diceButton.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    if(holdTriggered){
      holdTriggered=false;
      return;
    }
    closeMenu();
    rollOne();
    navigator.vibrate?.(12);
  },true);

  diceButton.addEventListener('contextmenu',event=>event.preventDefault());

  coinButton.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    flipCoin();
  });
})();
