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

  function coinMarkup(side){
    if(side==='heads'){
      return `
        <div class="coinFace">
          <svg class="coinSigil" viewBox="0 0 512 512" aria-hidden="true">
            <circle cx="256" cy="256" r="78"></circle>
            <path d="M256 62v70M256 380v70M62 256h70M380 256h70M119 119l50 50M343 343l50 50M393 119l-50 50M169 343l-50 50"></path>
          </svg>
          <div class="coinSide">表</div>
        </div>`;
    }
    return `
      <div class="coinFace">
        <svg class="coinSigil" viewBox="0 0 512 512" aria-hidden="true">
          <path d="M329 91c-92 18-161 99-161 196 0 59 26 112 67 149-89-11-158-87-158-179 0-99 80-179 179-179 26 0 51 5 73 13Z"></path>
          <path d="M340 185l16 34 36 5-26 25 6 36-32-17-32 17 6-36-26-25 36-5 16-34Z"></path>
        </svg>
        <div class="coinSide">裏</div>
      </div>`;
  }

  function flipCoin(){
    clearResults();
    closeMenu();
    const side=randomInt(2)===0?'heads':'tails';
    const coin=document.createElement('div');
    coin.className=`die center mtgCoin ${side}`;
    coin.setAttribute('role','img');
    coin.setAttribute('aria-label',`コイントス ${side==='heads'?'表':'裏'}`);
    coin.innerHTML=coinMarkup(side);
    diceLayer.appendChild(coin);
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
