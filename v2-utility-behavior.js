(()=>{
  const HOLD_MS=300;
  const settingsReset=document.getElementById('reset');
  const settings=document.getElementById('settings');
  const diceMenu=document.getElementById('dm');
  const randomPlayer=document.getElementById('randomPlayer');

  let randomDismissArmed=false;
  let lifeHold=null;

  function clearRandomSelection(){
    randomDismissArmed=false;
    document.querySelectorAll('#app .p.random-selected').forEach(player=>player.classList.remove('random-selected'));
  }

  function clearLifeHold(){
    const hold=lifeHold;
    if(!hold)return;

    clearTimeout(hold.timer);
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
    panel.classList.remove('life-hold-active');
    void panel.offsetWidth;
    panel.classList.add('life-hold-active');

    const hold={life,panel,index,pointerId:event.pointerId,timer:0};
    lifeHold=hold;

    try{life.setPointerCapture?.(event.pointerId)}catch{}

    hold.timer=setTimeout(()=>{
      if(lifeHold!==hold)return;
      panel.classList.remove('life-hold-active');
      lifeHold=null;
      navigator.vibrate?.(18);
      if(typeof openCounters==='function')openCounters(index);
    },HOLD_MS);

    /* v2 owns life long-press completely. Prevent the legacy app.js
       .life.holding handler from receiving this pointerdown. */
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
    if(randomDismissArmed)clearRandomSelection();
    startLifeHold(event);
  },true);

  document.addEventListener('pointerup',event=>{
    if(lifeHold?.pointerId===event.pointerId)clearLifeHold();
  },true);
  document.addEventListener('pointercancel',event=>{
    if(lifeHold?.pointerId===event.pointerId)clearLifeHold();
  },true);
  window.addEventListener('blur',clearLifeHold);
  window.addEventListener('pagehide',clearLifeHold);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')clearLifeHold();
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
      clearLifeHold();

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
      clearLifeHold();
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
