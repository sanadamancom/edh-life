(()=>{
  const app=document.getElementById('app');
  if(!app)return;

  let renderFrame=0;

  function scheduleRender(){
    if(renderFrame)return;
    renderFrame=requestAnimationFrame(()=>{
      renderFrame=0;
      render();
    });
  }

  function mutateDeferred(action){
    pushHistory();
    action();
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

  app.addEventListener('pointerdown',event=>{
    if(!validPointer(event))return;

    const lifeButton=event.target.closest('[data-life][data-d]');
    if(lifeButton&&app.contains(lifeButton)){
      const delta=Number(lifeButton.dataset.d);
      if(delta){
        event.preventDefault();
        const index=Number(lifeButton.dataset.life);
        if(Number.isInteger(index)&&state.players[index]){
          closeTransientUi();
          mutateDeferred(()=>{state.players[index].life+=delta});
        }
        return;
      }
    }

    const commanderButton=event.target.closest('[data-cmd]');
    if(!commanderButton||!app.contains(commanderButton))return;

    event.preventDefault();
    const target=Number(commanderButton.dataset.t);
    const source=Number(commanderButton.dataset.s);
    const delta=Number(commanderButton.dataset.cmd);
    if(!Number.isInteger(target)||!Number.isInteger(source)||!state.players[target])return;

    const current=state.players[target].cmd[source]||0;
    const next=Math.max(0,current+delta);
    const applied=next-current;
    if(!applied)return;

    closeTransientUi();
    mutateDeferred(()=>{
      state.players[target].cmd[source]=next;
      state.players[target].life-=applied;
    });
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
