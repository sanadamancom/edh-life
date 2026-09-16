(()=>{
  const app=document.getElementById('app');
  if(!app)return;

  const HOLD_DELAY=350;
  const REPEAT_INTERVAL=120;
  const ACCELERATE_AFTER=1500;
  const FAST_REPEAT_INTERVAL=80;
  const MAX_HOLD_MS=15000;

  const activePointers=new Map();
  let renderFrame=0;

  const style=document.createElement('style');
  style.textContent=`
    #app .lifeRow button,
    #app .cb button{
      touch-action:manipulation;
      -webkit-user-select:none;
      user-select:none;
      -webkit-touch-callout:none;
    }
    #app button.repeat-held{
      filter:brightness(1.16);
      box-shadow:inset 0 0 0 2px rgba(255,255,255,.22);
    }
  `;
  document.head.appendChild(style);

  function markHeldControls(){
    app.querySelectorAll('.repeat-held').forEach(button=>button.classList.remove('repeat-held'));
    activePointers.forEach(session=>{
      let selector='';
      if(session.action.kind==='life'){
        selector=`[data-life="${session.action.index}"][data-d="${session.action.delta}"]`;
      }else{
        selector=`[data-cmd="${session.action.delta}"][data-slot="${session.action.slot}"][data-t="${session.action.target}"][data-s="${session.action.source}"]`;
      }
      app.querySelector(selector)?.classList.add('repeat-held');
    });
  }

  function scheduleRender(){
    if(renderFrame)return;
    renderFrame=requestAnimationFrame(()=>{
      renderFrame=0;
      if(activePointers.size){
        markHeldControls();
        return;
      }
      render();
    });
  }

  function saveOnly(){
    saveState();
  }

  function closeTransientUi(){
    diceMenu?.classList.remove('show');
    clearDice?.();
  }

  function validPointer(event){
    return event.pointerType!=='mouse'||event.button===0;
  }

  function actionFromEvent(event){
    const lifeButton=event.target.closest('[data-life][data-d]');
    if(lifeButton&&app.contains(lifeButton)){
      const index=Number(lifeButton.dataset.life);
      const delta=Number(lifeButton.dataset.d);
      if(delta&&Number.isInteger(index)&&state.players[index]){
        return {kind:'life',index,delta};
      }
      return null;
    }

    const commanderButton=event.target.closest('[data-cmd]');
    if(!commanderButton||!app.contains(commanderButton))return null;

    const target=Number(commanderButton.dataset.t);
    const source=Number(commanderButton.dataset.s);
    const delta=Number(commanderButton.dataset.cmd);
    const slot=Number(commanderButton.dataset.slot||0);
    if(!Number.isInteger(target)||!Number.isInteger(source)||!state.players[target])return null;
    return {kind:'commander',target,source,slot:slot===1?1:0,delta};
  }

  function applyAction(action){
    if(action.kind==='life'){
      state.players[action.index].life+=action.delta;
      return true;
    }

    const player=state.players[action.target];
    if(action.slot===1&&!Array.isArray(player.cmdB))player.cmdB=[0,0,0,0];
    const store=action.slot===1?player.cmdB:player.cmd;
    const current=store[action.source]||0;
    const next=Math.max(0,current+action.delta);
    const applied=next-current;
    if(!applied)return false;

    store[action.source]=next;
    player.life-=applied;
    return true;
  }

  function syncLife(index){
    const value=app.querySelector(`.life[data-life="${index}"] .lifeValue`);
    if(value)value.textContent=String(state.players[index].life);
  }

  function syncCommander(action){
    syncLife(action.target);

    const player=state.players[action.target];
    const store=action.slot===1?player.cmdB:player.cmd;
    const value=store?.[action.source]||0;
    const selector=`[data-cmd="1"][data-slot="${action.slot}"][data-t="${action.target}"][data-s="${action.source}"]`;
    const button=app.querySelector(selector);
    if(!button)return;

    const partnerRow=button.closest('.partnerRow');
    if(partnerRow){
      const number=partnerRow.querySelector('b');
      if(number)number.textContent=String(value);
      partnerRow.classList.toggle('hot',value>=18);
      button.closest('.cc')?.classList.toggle('hot',
        (player.cmd?.[action.source]||0)>=18||(player.cmdB?.[action.source]||0)>=18
      );
      return;
    }

    const card=button.closest('.cc');
    const number=card?.querySelector('.cv');
    if(number)number.textContent=String(value);
    card?.classList.toggle('hot',value>=18);
  }

  function syncActionDisplay(action){
    if(action.kind==='life')syncLife(action.index);
    else syncCommander(action);
  }

  function clearSessionTimers(session){
    clearTimeout(session.timer);
    clearTimeout(session.guardTimer);
  }

  function stopPointer(pointerId){
    const session=activePointers.get(pointerId);
    if(!session)return;

    clearSessionTimers(session);
    activePointers.delete(pointerId);

    try{
      if(app.hasPointerCapture?.(pointerId))app.releasePointerCapture(pointerId);
    }catch{}

    if(activePointers.size===0)scheduleRender();
    else markHeldControls();
  }

  function stopAllPointers(){
    activePointers.forEach((session,pointerId)=>{
      clearSessionTimers(session);
      try{
        if(app.hasPointerCapture?.(pointerId))app.releasePointerCapture(pointerId);
      }catch{}
    });
    activePointers.clear();
    scheduleRender();
  }

  function repeatPointer(pointerId){
    const session=activePointers.get(pointerId);
    if(!session)return;

    if(!applyAction(session.action)){
      stopPointer(pointerId);
      return;
    }

    if(!session.repeating){
      session.repeating=true;
      navigator.vibrate?.(10);
    }

    saveOnly();
    syncActionDisplay(session.action);

    const elapsed=performance.now()-session.startedAt;
    const delay=elapsed>=ACCELERATE_AFTER?FAST_REPEAT_INTERVAL:REPEAT_INTERVAL;
    session.timer=setTimeout(()=>repeatPointer(pointerId),delay);
  }

  app.addEventListener('pointerdown',event=>{
    if(!validPointer(event))return;

    const action=actionFromEvent(event);
    if(!action)return;

    event.preventDefault();
    closeTransientUi();

    /* Mobile browsers may reuse a pointerId quickly. Never leave the old timer alive. */
    if(activePointers.has(event.pointerId))stopPointer(event.pointerId);

    pushHistory();
    if(!applyAction(action)){
      state.hist.pop();
      return;
    }

    const session={
      action,
      startedAt:performance.now(),
      repeating:false,
      timer:0,
      guardTimer:0
    };

    activePointers.set(event.pointerId,session);

    /* Capture on #app, which survives player re-renders, so pointerup cannot be lost with a child node. */
    try{app.setPointerCapture?.(event.pointerId)}catch{}

    saveOnly();
    syncActionDisplay(action);
    markHeldControls();

    session.timer=setTimeout(()=>repeatPointer(event.pointerId),HOLD_DELAY);
    session.guardTimer=setTimeout(()=>stopPointer(event.pointerId),MAX_HOLD_MS);
  });

  app.addEventListener('lostpointercapture',event=>stopPointer(event.pointerId));
  document.addEventListener('pointerup',event=>stopPointer(event.pointerId),true);
  document.addEventListener('pointercancel',event=>stopPointer(event.pointerId),true);
  window.addEventListener('blur',stopAllPointers);
  window.addEventListener('pagehide',stopAllPointers);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')stopAllPointers();
  });

  app.addEventListener('contextmenu',event=>{
    if(actionFromEvent(event))event.preventDefault();
  });

  app.addEventListener('click',event=>{
    if(event.detail===0)return;

    const lifeButton=event.target.closest('[data-life][data-d]');
    const isLifeDelta=lifeButton&&Number(lifeButton.dataset.d)!==0;
    const isCommander=Boolean(event.target.closest('[data-cmd]'));
    if(!isLifeDelta&&!isCommander)return;

    event.preventDefault();
    event.stopImmediatePropagation();
  },true);
})();
