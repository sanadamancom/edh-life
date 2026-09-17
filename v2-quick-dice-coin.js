(()=>{
  const HOLD_MS=500;
  const diceButton=document.getElementById('dice');
  const diceMenu=document.getElementById('dm');
  const diceLayer=document.getElementById('dl');
  const diceWrap=diceButton?.closest('.dw');
  const tools=document.getElementById('tools');
  if(!diceButton||!diceMenu||!diceLayer||!diceWrap||!tools||typeof rollOne!=='function')return;

  /* D6 single-roll and coin are direct actions; keep only secondary dice tools
     in the long-press menu. */
  document.getElementById('one')?.remove();
  document.getElementById('coin')?.remove();
  document.getElementById('coinQuick')?.remove();

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
    #dm.dm{grid-template-columns:repeat(2,minmax(0,1fr))}
    #dm #randomPlayer{grid-column:1/-1}

    /* Coin rendering is fully independent from the D6 result box. */
    .die.coinTossResult{
      top:calc(50% - 36px)!important;
      width:clamp(150px,calc(var(--tool-size) * 3.65),190px)!important;
      height:clamp(196px,calc(var(--tool-size) * 4.65),236px)!important;
      overflow:visible!important;
      border:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
      animation:none!important;
      pointer-events:none
    }
    .coinTossScene{
      position:relative;
      width:100%;
      height:100%;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center
    }
    .coinFlight,
    .coinSettled{
      position:relative;
      z-index:2;
      width:clamp(132px,calc(var(--tool-size) * 3.18),164px);
      height:clamp(132px,calc(var(--tool-size) * 3.18),164px);
      flex:0 0 auto
    }
    .coinFlight{
      transform-origin:center;
      will-change:transform
    }
    .coinSettled{display:none}
    .coinTossResult.settled .coinFlight{display:none}
    .coinTossResult.settled .coinSettled{display:block}

    .coinFaceVisual{
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
    .coinFaceVisual::before{
      content:"";
      position:absolute;
      inset:9px;
      border:2px solid currentColor;
      border-radius:50%;
      opacity:.42
    }
    .coinFaceVisual.heads{
      color:#5a3308;
      background:
        radial-gradient(circle at 34% 27%,rgba(255,255,255,.76) 0 4%,transparent 5%),
        radial-gradient(circle at 38% 34%,#ffe7aa 0 8%,#dbaa42 36%,#a66d17 68%,#683d08 100%)
    }
    .coinFaceVisual.tails{
      color:#332d12;
      border-color:#d8c683;
      background:
        radial-gradient(circle at 34% 27%,rgba(255,255,255,.62) 0 4%,transparent 5%),
        radial-gradient(circle at 38% 34%,#e4d79c 0 8%,#b49a50 36%,#75602c 68%,#433613 100%)
    }
    .coinFaceVisual svg{
      position:relative;
      z-index:1;
      width:58%;
      height:58%;
      fill:none;
      stroke:currentColor;
      stroke-width:34;
      stroke-linecap:round;
      stroke-linejoin:round;
      filter:drop-shadow(0 2px 0 rgba(255,244,201,.42))
    }
    .coinFlight.edge-on .coinFaceVisual{
      box-shadow:
        inset 0 0 0 3px rgba(83,45,5,.62),
        inset 0 0 0 8px rgba(255,232,164,.34),
        0 0 0 2px rgba(255,224,130,.72),
        0 7px 14px rgba(0,0,0,.22)
    }
    .coinGroundShadow{
      position:absolute;
      left:50%;
      top:61%;
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
      min-width:72px;
      margin-top:10px;
      padding:5px 13px 6px;
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
    .coinResultLabel.show{opacity:1;transform:translateY(0) scale(1)}
    .coinTossResult[data-side="heads"] .coinResultLabel{border-color:#f2d57f;color:#ffe7a5}
    .coinTossResult[data-side="tails"] .coinResultLabel{border-color:#d7ca98;color:#eee4b9}
    @media (prefers-reduced-motion:reduce){.coinResultLabel{transition:none}}
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

  function coinFaceMarkup(type){
    return `<div class="coinFaceVisual ${type}">${coinArt(type)}</div>`;
  }

  function animateCoin(coin,side){
    const flight=coin.querySelector('.coinFlight');
    const settled=coin.querySelector('.coinSettled');
    const shadow=coin.querySelector('.coinGroundShadow');
    const resultLabel=coin.querySelector('.coinResultLabel');
    if(!flight||!settled)return;

    let finished=false;
    const finish=()=>{
      if(finished||!coin.isConnected)return;
      finished=true;

      /* Never reuse the animated transform for the result. The flight element is
         hidden and a separate untouched square element becomes the final coin. */
      flight.style.display='none';
      flight.style.transform='';
      flight.style.willChange='auto';
      settled.innerHTML=coinFaceMarkup(side);
      coin.classList.add('settled');

      if(shadow){
        shadow.style.transform='translate(-50%,-50%) scaleX(1)';
        shadow.style.opacity='.68';
        shadow.style.willChange='auto';
      }
      resultLabel?.classList.add('show');
    };

    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(reduced){finish();return}

    const duration=920;
    const turns=side==='heads'?4:4.5;
    const started=performance.now();
    let shownFace='heads';
    flight.innerHTML=coinFaceMarkup(shownFace);

    const frame=now=>{
      if(finished||!coin.isConnected)return;
      const t=Math.min(1,(now-started)/duration);
      const phase=t*turns*2*Math.PI;
      const cosine=Math.cos(phase);

      /* Keep a visible metallic edge instead of collapsing to a one-pixel line. */
      const projected=Math.max(.16,Math.abs(cosine));
      const nextFace=cosine>=0?'heads':'tails';
      if(nextFace!==shownFace){
        shownFace=nextFace;
        flight.innerHTML=coinFaceMarkup(shownFace);
      }
      flight.classList.toggle('edge-on',projected<.22);

      /* One simple motion: straight up from center and straight back down. */
      const arc=Math.sin(Math.PI*t);
      const y=-(122*arc);
      flight.style.transform=`translateY(${y.toFixed(1)}px) scaleY(${projected.toFixed(3)})`;

      if(shadow){
        const shadowScale=.44+(.56*(1-arc));
        shadow.style.transform=`translate(-50%,-50%) scaleX(${shadowScale.toFixed(3)})`;
        shadow.style.opacity=String((.22+.46*(1-arc)).toFixed(3));
      }

      if(t<1)requestAnimationFrame(frame);
      else finish();
    };

    requestAnimationFrame(frame);
    setTimeout(finish,duration+100);
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
        <div class="coinFlight" aria-hidden="true"></div>
        <div class="coinSettled" aria-hidden="true"></div>
        <div class="coinResultLabel">${label}</div>
      </div>`;
    diceLayer.appendChild(coin);
    requestAnimationFrame(()=>animateCoin(coin,side));
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

  /* Capture beats app.js's legacy click-to-open-menu handler. */
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