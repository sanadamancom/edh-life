(()=>{
  const HOLD_DELAY_MS=200;
  const HOLD_PROGRESS_MS=300;
  const HOLD_TOTAL_MS=HOLD_DELAY_MS+HOLD_PROGRESS_MS;
  const LEGACY_COMMANDER_HOLD_MS=360;
  const COMMANDER_PROXY_DELAY_MS=Math.max(0,HOLD_TOTAL_MS-LEGACY_COMMANDER_HOLD_MS);

  const settingsReset=document.getElementById('reset');
  const settings=document.getElementById('settings');
  const diceMenu=document.getElementById('dm');
  const randomPlayer=document.getElementById('randomPlayer');
  const app=document.getElementById('app');

  let randomDismissArmed=false;
  let lifeHold=null;
  let commanderHold=null;

  function clearRandomSelection(){
    randomDismissArmed=false;
    document.querySelectorAll('#app .p.random-selected').forEach(player=>player.classList.remove('random-selected'));
  }

  function clearLifeHold(){
    const hold=lifeHold;
    if(!hold)return;

    clearTimeout(hold.progressTimer);
    clearTimeout(hold.completeTimer);
    hold.panel?.classList.remove('life-hold-active');
    try{
      if(hold.life?.hasPointerCapture?.(hold.pointerId))hold.life.releasePointerCapture(hold.pointerId);
    }catch{}
    lifeHold=null;
  }

  function startLifeHold(event){
    const life=event.target.closest?.('#app .life[data-life]');
    if(!life)return false;
    if(event.pointerType==='mouse'&&event.button!==0)return false;

    const panel=life.closest('.p');
    const index=Number(life.dataset.life);
    if(!panel||!Number.isInteger(index))return false;

    clearLifeHold();
    const hold={
      life,
      panel,
      index,
      pointerId:event.pointerId,
      progressTimer:0,
      completeTimer:0
    };
    lifeHold=hold;

    try{life.setPointerCapture?.(event.pointerId)}catch{}

    hold.progressTimer=setTimeout(()=>{
      if(lifeHold!==hold)return;
      panel.classList.remove('life-hold-active');
      void panel.offsetWidth;
      panel.classList.add('life-hold-active');
    },HOLD_DELAY_MS);

    hold.completeTimer=setTimeout(()=>{
      if(lifeHold!==hold)return;
      panel.classList.remove('life-hold-active');
      lifeHold=null;
      navigator.vibrate?.(18);
      if(typeof openCounters==='function')openCounters(index);
    },HOLD_TOTAL_MS);

    /* v2 owns life long-press completely. Prevent the legacy app.js
       .life.holding handler from receiving this pointerdown. */
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  function commanderProxyEvent(type,hold){
    try{
      return new PointerEvent(type,{
        bubbles:true,
        cancelable:true,
        composed:true,
        pointerId:hold.pointerId,
        pointerType:hold.pointerType||'touch',
        isPrimary:true,
        button:0,
        buttons:type==='pointerdown'?1:0,
        clientX:hold.clientX,
        clientY:hold.clientY
      });
    }catch{
      return new Event(type,{bubbles:true,cancelable:true,composed:true});
    }
  }

  function clearCommanderHold(cancelLegacy=true){
    const hold=commanderHold;
    if(!hold)return;

    clearTimeout(hold.proxyTimer);
    clearTimeout(hold.progressTimer);
    clearTimeout(hold.finishTimer);
    hold.card?.classList.remove('commander-hold-active');

    if(cancelLegacy&&hold.proxyStarted){
      try{hold.card?.dispatchEvent(commanderProxyEvent('pointercancel',hold))}catch{}
    }
    commanderHold=null;
  }

  function startCommanderHold(event){
    if(event.pointerType==='mouse'&&event.button!==0)return false;
    if(event.target.closest?.('button'))return false;

    const card=event.target.closest?.('#app .cc[data-cmd-card]');
    if(!card)return false;

    clearCommanderHold();
    const hold={
      card,
      pointerId:event.pointerId,
      pointerType:event.pointerType,
      clientX:event.clientX,
      clientY:event.clientY,
      proxyStarted:false,
      proxyTimer:0,
      progressTimer:0,
      finishTimer:0
    };
    commanderHold=hold;

    /* edh-features.js still owns opening the commander detail panel with its
       360ms timer. Start that hidden timer early enough that detail opens at
       the same 500ms boundary as the v2 hold gesture. Its legacy progress
       pseudo-element is suppressed by v2-utility.css. */
    hold.proxyTimer=setTimeout(()=>{
      if(commanderHold!==hold)return;
      hold.proxyStarted=true;
      card.dispatchEvent(commanderProxyEvent('pointerdown',hold));
    },COMMANDER_PROXY_DELAY_MS);

    hold.progressTimer=setTimeout(()=>{
      if(commanderHold!==hold)return;
      card.classList.remove('commander-hold-active');
      void card.offsetWidth;
      card.classList.add('commander-hold-active');
    },HOLD_DELAY_MS);

    hold.finishTimer=setTimeout(()=>{
      if(commanderHold!==hold)return;
      card.classList.remove('commander-hold-active');
      commanderHold=null;
    },HOLD_TOTAL_MS+24);

    /* This listener now runs on #app after the commander tap capture listener.
       The tap session is already registered, while propagation is still stopped
       before the legacy 360ms app bubble listener can see the trusted event. */
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  function randomInt(max){
    if(max<=0)return 0;
    if(window.crypto?.getRandomValues){
      const value=new Uint32Array(1);
      crypto.getRandomValues(value);
      return value[0]%max;
    }
    return Math.floor(Math.random()*max);
  }

  document.addEventListener('pointerdown',event=>{
    /* Synthetic commander bridge events must pass through to edh-features.js. */
    if(!event.isTrusted)return;
    if(randomDismissArmed)clearRandomSelection();
    startLifeHold(event);
  },true);

  /* v2-compact-interactions.js is loaded before this file and registers its
     #app capture listener first. Let it record a tap, then claim the same event
     here for the 500ms hold path before the legacy bubble handler sees it. */
  app?.addEventListener('pointerdown',event=>{
    if(!event.isTrusted)return;
    startCommanderHold(event);
  },true);

  document.addEventListener('pointerup',event=>{
    if(lifeHold?.pointerId===event.pointerId)clearLifeHold();
    if(commanderHold?.pointerId===event.pointerId)clearCommanderHold();
  },true);
  document.addEventListener('pointercancel',event=>{
    if(lifeHold?.pointerId===event.pointerId)clearLifeHold();
    if(commanderHold?.pointerId===event.pointerId)clearCommanderHold();
  },true);

  function clearAllHolds(){
    clearLifeHold();
    clearCommanderHold();
  }

  window.addEventListener('blur',clearAllHolds);
  window.addEventListener('pagehide',clearAllHolds);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')clearAllHolds();
  });

  if(diceMenu){
    diceMenu.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(button&&button.id!=='randomPlayer')clearRandomSelection();
    },true);
  }

  if(randomPlayer){
    randomPlayer.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      diceMenu?.classList.remove('show');
      document.querySelectorAll('.die').forEach(die=>die.remove());
      clearRandomSelection();
      clearAllHolds();

      const players=[...document.querySelectorAll('#app .p:not(.hide)')];
      if(!players.length)return;
      const selected=players[randomInt(players.length)];
      selected.classList.add('random-selected');
      randomDismissArmed=true;
      navigator.vibrate?.(28);
    },true);
  }

  if(settingsReset){
    const rowLabel=settingsReset.closest('.row')?.querySelector('b');
    if(rowLabel)rowLabel.textContent='すべて';
    settingsReset.textContent='設定を含む全リセット';

    let armed=false;
    let timer=0;
    const restoreLabel=()=>{
      armed=false;
      clearTimeout(timer);
      settingsReset.textContent='設定を含む全リセット';
    };

    settingsReset.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();

      if(!armed){
        armed=true;
        settingsReset.textContent='もう一度押して全部リセット';
        clearTimeout(timer);
        timer=setTimeout(restoreLabel,2500);
        return;
      }

      clearTimeout(timer);
      armed=false;
      clearRandomSelection();
      clearAllHolds();
      document.querySelectorAll('.die').forEach(die=>die.remove());

      try{
        for(let i=localStorage.length-1;i>=0;i--){
          const key=localStorage.key(i);
          if(key&&(key==='edh-life'||key.startsWith('edh-life-')))localStorage.removeItem(key);
        }
      }catch{}

      if(typeof normalizeState==='function'&&typeof saveState==='function'&&typeof render==='function'){
        state=normalizeState(null);
        saveState();
        render();
      }

      settings?.classList.remove('show');
      settingsReset.textContent='設定を含む全リセット';
      navigator.vibrate?.(45);
      window.dispatchEvent(new Event('edh-v2-layout'));
    },true);
  }
})();
