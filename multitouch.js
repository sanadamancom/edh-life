(()=>{
  const app=document.getElementById('app');
  if(!app)return;

  const HOLD_DELAY=350;
  const REPEAT_INTERVAL=120;
  const ACCELERATE_AFTER=1500;
  const FAST_REPEAT_INTERVAL=80;

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
    activePointers.forEach(session=>{
      let selector='';
      if(session.action.kind==='life'){
        selector=`[data-life="${session.action.index}"][data-d="${session.action.delta}"]`;
      }else{
        selector=`[data-cmd="${session.action.delta}"][data-t="${session.action.target}"][data-s="${session.action.source}"]`;
      }
      app.querySelector(selector)?.classList.add('repeat-held');
    });
  }

  function scheduleRender(){
    if(renderFrame)return;
    renderFrame=requestAnimationFrame(()=>{
      renderFrame=0;
      render();
      markHeldControls();
    });
  }

  function saveAndRender(){
    saveState();
    scheduleRender();
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
    if(!Number.isInteger(target)||!Number.isInteger(source)||!state.players[target])return null;
    return {kind:'commander',target,source,delta};
  }

  function applyAction(action){
    if(action.kind==='life'){
      state.players[action.index].life+=action.delta;
      return true;
    }

    const current=state.players[action.target].cmd[action.source]||0;
    const next=Math.max(0,current+action.delta);
    const applied=next-current;
    if(!applied)return false;

    state.players[action.target].cmd[action.source]=next;
    state.players[action.target].life-=applied;
    return true;
  }

  function stopPointer(pointerId){
    const session=activePointers.get(pointerId);
    if(!session)return;
    clearTimeout(session.timer);
    activePointers.delete(pointerId);
    scheduleRender();
  }

  function stopAllPointers(){
    activePointers.forEach(session=>clearTimeout(session.timer));
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

    saveAndRender();

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

    /* One history entry per press/hold gesture, not one per repeat tick. */
    pushHistory();
    if(!applyAction(action)){
      state.hist.pop();
      return;
    }

    saveAndRender();

    const session={
      action,
      startedAt:performance.now(),
      repeating:false,
      timer:0
    };
    session.timer=setTimeout(()=>repeatPointer(event.pointerId),HOLD_DELAY);
    activePointers.set(event.pointerId,session);
  });

  document.addEventListener('pointerup',event=>stopPointer(event.pointerId),true);
  document.addEventListener('pointercancel',event=>stopPointer(event.pointerId),true);
  window.addEventListener('blur',stopAllPointers);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')stopAllPointers();
  });

  app.addEventListener('contextmenu',event=>{
    if(actionFromEvent(event))event.preventDefault();
  });

  /*
   * Pointer input is committed on pointerdown above. Suppress the compatibility
   * click so the original click handler in app.js cannot apply the change twice.
   * Keyboard/assistive clicks (detail === 0) are intentionally left alone.
   */
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
