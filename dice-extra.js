(()=>{
  const menu=document.getElementById('dm');
  const diceLayer=document.getElementById('dl');
  if(!menu||!diceLayer)return;

  const one=document.getElementById('one');
  const all=document.getElementById('all');
  if(one)one.textContent='D6 1個';
  if(all)all.textContent='D6 全員';

  const style=document.createElement('style');
  style.textContent=`
    #dm.dm{
      width:176px;
      grid-template-columns:repeat(2,minmax(0,1fr));
      align-items:stretch;
    }
    #dm.dm.show{display:grid}
    #dm.dm button{
      min-width:0;
      padding:0 8px;
      white-space:nowrap;
    }
    #randomPlayer{grid-column:1/-1}
    .extraDie{
      display:flex!important;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:2px;
      width:118px!important;
      height:92px!important;
      border:1px solid rgba(255,255,255,.5)!important;
      border-radius:24px!important;
      background:rgba(248,250,253,.96)!important;
      color:#10141b;
      box-shadow:0 18px 42px rgba(0,0,0,.42)!important;
      animation:extra-result-in .34s cubic-bezier(.2,.8,.25,1)!important;
    }
    .extraDie .extraLabel{
      font-size:12px;
      font-weight:800;
      letter-spacing:.08em;
      opacity:.55;
      line-height:1;
    }
    .extraDie .extraValue{
      font-size:42px;
      font-weight:900;
      letter-spacing:-.05em;
      line-height:1;
      font-variant-numeric:tabular-nums;
    }
    .extraDie.coin .extraValue{font-size:34px;letter-spacing:0}
    .extraDie.playerPick{
      width:150px!important;
      height:76px!important;
      background:rgba(18,22,31,.94)!important;
      color:#fff;
      border-color:rgba(255,255,255,.35)!important;
      box-shadow:0 0 0 3px color-mix(in srgb,var(--pick-color,#fff) 65%,transparent),0 16px 36px rgba(0,0,0,.42)!important;
    }
    .extraDie.playerPick .extraValue{
      max-width:132px;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      font-size:20px;
      letter-spacing:-.02em;
    }
    @keyframes extra-result-in{
      from{opacity:0;transform:translate(-50%,-50%) scale(.82)}
      to{opacity:1;transform:translate(-50%,-50%) scale(1)}
    }
    @media (prefers-reduced-motion:reduce){
      .extraDie{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  const addButton=(id,label)=>{
    const button=document.createElement('button');
    button.type='button';
    button.id=id;
    button.textContent=label;
    menu.appendChild(button);
    return button;
  };

  const d20Button=addButton('d20','D20');
  const coinButton=addButton('coin','コイン');
  const playerButton=addButton('randomPlayer','プレイヤー');

  function randomInt(max){
    if(window.crypto?.getRandomValues){
      const value=new Uint32Array(1);
      crypto.getRandomValues(value);
      return value[0]%max;
    }
    return Math.floor(Math.random()*max);
  }

  function clearResults(){
    document.querySelectorAll('.die').forEach(die=>die.remove());
  }

  function closeMenu(){
    menu.classList.remove('show');
  }

  function makeCenterResult(label,value,className=''){
    clearResults();
    const die=document.createElement('div');
    die.className=`die center extraDie ${className}`.trim();
    die.innerHTML=`<div class="extraLabel">${label}</div><div class="extraValue">${value}</div>`;
    diceLayer.appendChild(die);
  }

  d20Button.addEventListener('click',event=>{
    event.stopPropagation();
    closeMenu();
    makeCenterResult('D20',randomInt(20)+1);
  });

  coinButton.addEventListener('click',event=>{
    event.stopPropagation();
    closeMenu();
    makeCenterResult('COIN',randomInt(2)===0?'表':'裏','coin');
  });

  playerButton.addEventListener('click',event=>{
    event.stopPropagation();
    closeMenu();
    clearResults();
    const players=[...document.querySelectorAll('#app .p:not(.hide)')];
    if(!players.length)return;
    const player=players[randomInt(players.length)];
    const name=player.querySelector('.name')?.textContent?.trim()||'PLAYER';
    const color=getComputedStyle(player).getPropertyValue('--pc').trim()||'#fff';
    const die=document.createElement('div');
    die.className='die player extraDie playerPick';
    die.style.setProperty('--pick-color',color);
    die.innerHTML=`<div class="extraLabel">SELECTED</div><div class="extraValue"></div>`;
    die.querySelector('.extraValue').textContent=name;
    player.appendChild(die);
    navigator.vibrate?.(24);
  });
})();
