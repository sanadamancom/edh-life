(()=>{
  const settingsReset=document.getElementById('reset');
  const settings=document.getElementById('settings');
  const diceMenu=document.getElementById('dm');
  const randomPlayer=document.getElementById('randomPlayer');
  let randomDismissArmed=false;

  function clearRandomSelection(){
    randomDismissArmed=false;
    document.querySelectorAll('#app .p.random-selected').forEach(player=>player.classList.remove('random-selected'));
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

  /* A random-player highlight is only a temporary result indicator. The next tap
     anywhere clears it without consuming or blocking that tap's normal action. */
  document.addEventListener('pointerdown',()=>{
    if(randomDismissArmed)clearRandomSelection();
  },true);

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
