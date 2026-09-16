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

    /* D20 intentionally shares the same body, size, shadow and roll animation as D6. */
    .d20Die .face{
      display:grid;
      grid-template:1fr/1fr;
      place-items:center;
      color:#11151c;
      font-size:48px;
      font-weight:900;
      line-height:1;
      letter-spacing:-.055em;
      font-variant-numeric:tabular-nums;
    }
    .d20Die .face.is-one{color:#d32f2f}

    /* Fantasy metal coin inspired by tabletop MTG accessories, without copying card art. */
    .mtgCoin{
      width:108px!important;
      height:108px!important;
      padding:0!important;
      overflow:hidden;
      border:3px solid #f3d27a!important;
      border-radius:50%!important;
      background:
        radial-gradient(circle at 34% 28%,rgba(255,255,255,.70) 0 4%,transparent 5%),
        radial-gradient(circle at 36% 32%,#f9dfa0 0 8%,#d6a83d 34%,#a86f18 66%,#70430d 100%)!important;
      box-shadow:
        0 18px 42px #0008,
        inset 0 0 0 3px rgba(84,45,4,.55),
        inset 0 0 0 7px rgba(255,226,151,.48),
        inset 0 0 18px rgba(66,31,0,.60)!important;
      color:#5a3308;
      animation:coin-toss .82s cubic-bezier(.18,.78,.26,1.08)!important;
      transform-style:preserve-3d;
    }
    .mtgCoin::before{
      content:"";
      position:absolute;
      inset:9px;
      border:2px solid rgba(91,50,8,.55);
      border-radius:50%;
      box-shadow:
        inset 0 0 0 2px rgba(255,235,177,.32),
        0 0 0 1px rgba(255,245,205,.20);
      pointer-events:none;
    }
    .mtgCoin::after{
      content:"";
      position:absolute;
      inset:4px;
      border:1px dashed rgba(94,51,8,.36);
      border-radius:50%;
      pointer-events:none;
    }
    .coinFace{
      position:relative;
      z-index:1;
      width:100%;
      height:100%;
      display:grid;
      grid-template-rows:1fr auto;
      place-items:center;
      padding:17px 12px 12px;
      text-shadow:0 1px 0 rgba(255,240,187,.75),0 -1px 0 rgba(77,37,2,.30);
    }
    .coinSigil{
      width:55px;
      height:55px;
      fill:none;
      stroke:currentColor;
      stroke-width:42;
      stroke-linecap:round;
      stroke-linejoin:round;
      filter:drop-shadow(0 1px 0 rgba(255,240,187,.7));
    }
    .coinSide{
      margin-top:-2px;
      padding:2px 8px;
      border:1px solid rgba(91,50,8,.40);
      border-radius:999px;
      background:rgba(255,235,177,.22);
      font-size:12px;
      font-weight:900;
      line-height:1.25;
      letter-spacing:.12em;
    }
    .mtgCoin.tails{
      background:
        radial-gradient(circle at 34% 28%,rgba(255,255,255,.58) 0 4%,transparent 5%),
        radial-gradient(circle at 36% 32%,#dbc783 0 8%,#ad9147 36%,#75602c 68%,#433613 100%)!important;
      border-color:#dccb8d!important;
      color:#413713;
    }

    .extraDie.playerPick{
      display:flex!important;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:2px;
      width:150px!important;
      height:76px!important;
      border:1px solid rgba(255,255,255,.35)!important;
      border-radius:24px!important;
      background:rgba(18,22,31,.94)!important;
      color:#fff;
      box-shadow:0 0 0 3px color-mix(in srgb,var(--pick-color,#fff) 65%,transparent),0 16px 36px rgba(0,0,0,.42)!important;
      animation:extra-result-in .34s cubic-bezier(.2,.8,.25,1)!important;
    }
    .extraDie .extraLabel{
      font-size:12px;
      font-weight:800;
      letter-spacing:.08em;
      opacity:.55;
      line-height:1;
    }
    .extraDie.playerPick .extraValue{
      max-width:132px;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      font-size:20px;
      font-weight:900;
      letter-spacing:-.02em;
      line-height:1;
    }
    @keyframes extra-result-in{
      from{opacity:0;transform:translate(-50%,-50%) scale(.82)}
      to{opacity:1;transform:translate(-50%,-50%) scale(1)}
    }
    @keyframes coin-toss{
      0%{opacity:0;transform:translate(-50%,-50%) translate(-78px,-48px) rotate(-18deg) rotateY(0deg) scale(.62)}
      24%{opacity:1;transform:translate(-50%,-50%) translate(52px,-42px) rotate(14deg) rotateY(360deg) scale(1.03)}
      52%{transform:translate(-50%,-50%) translate(-24px,10px) rotate(-8deg) rotateY(720deg) scale(.94)}
      78%{transform:translate(-50%,-50%) translate(12px,-5px) rotate(4deg) rotateY(990deg) scale(1.02)}
      100%{transform:translate(-50%,-50%) rotate(0deg) rotateY(1080deg) scale(1)}
    }
    @media (prefers-reduced-motion:reduce){
      .extraDie,.mtgCoin{animation:none!important}
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

  function d20Face(value){
    return `<div class="face${value===1?' is-one':''}">${value}</div>`;
  }

  function createD20(){
    clearResults();
    const finalValue=randomInt(20)+1;
    const die=document.createElement('div');
    die.className='die center d20Die rolling';
    if(typeof setRollPath==='function')setRollPath(die,true);
    die.innerHTML=d20Face(randomInt(20)+1);
    diceLayer.appendChild(die);

    let previous=0;
    let frames=0;
    const timer=setInterval(()=>{
      let value;
      do value=randomInt(20)+1; while(value===previous);
      previous=value;
      die.innerHTML=d20Face(value);
      frames++;
      if(frames>=10){
        clearInterval(timer);
        setTimeout(()=>{
          die.innerHTML=d20Face(finalValue);
          die.classList.remove('rolling');
        },90);
      }
    },62);
  }

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
    const side=randomInt(2)===0?'heads':'tails';
    const coin=document.createElement('div');
    coin.className=`die center mtgCoin ${side}`;
    coin.setAttribute('role','img');
    coin.setAttribute('aria-label',`コイントス ${side==='heads'?'表':'裏'}`);
    coin.innerHTML=coinMarkup(side);
    diceLayer.appendChild(coin);
    navigator.vibrate?.(18);
  }

  d20Button.addEventListener('click',event=>{
    event.stopPropagation();
    closeMenu();
    createD20();
  });

  coinButton.addEventListener('click',event=>{
    event.stopPropagation();
    closeMenu();
    flipCoin();
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

(()=>{
  const script=document.createElement('script');
  script.src='./table-state-hub.js?v=1';
  document.body.appendChild(script);
})();
