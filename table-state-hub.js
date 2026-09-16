(()=>{
  if(typeof state==='undefined'||typeof render!=='function'||typeof mutate!=='function')return;

  const STORAGE_KEY_TABLE_HUB='edh-life-table-state-hub-enabled';
  const GOLD='#d7a82c';
  const PURPLE='#9a72d7';
  const NEUTRAL='rgba(255,255,255,.07)';

  let hubEnabled=localStorage.getItem(STORAGE_KEY_TABLE_HUB)!=='0';
  let pickType=null;

  /* Replace the previous two-circle table-state UI but keep its stored state values. */
  document.getElementById('tableStateHub')?.remove();

  const style=document.createElement('style');
  style.textContent=`
    #unifiedTableStateHub{
      position:absolute;
      z-index:16;
      width:62px;
      height:62px;
      transform:translate(-50%,-50%);
      border:1px solid rgba(255,255,255,.18);
      border-radius:50%;
      background:#080b10;
      box-shadow:0 5px 16px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08);
      touch-action:manipulation;
    }
    #unifiedTableStateHub[hidden]{display:none!important}
    .tableStateRing{
      position:absolute;
      inset:3px;
      border-radius:50%;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);
      transition:filter 140ms ease;
      pointer-events:none;
    }
    .tableStateCenter{
      position:absolute;
      left:50%;
      top:50%;
      display:grid;
      grid-template-columns:1fr 1fr;
      width:48px;
      height:28px;
      padding:2px;
      transform:translate(-50%,-50%);
      overflow:hidden;
      border:1px solid rgba(255,255,255,.18);
      border-radius:999px;
      background:#111722f2;
      box-shadow:0 2px 8px rgba(0,0,0,.55);
    }
    .tableStateChoice{
      min-width:0;
      min-height:0;
      padding:0;
      border:0;
      border-radius:999px;
      background:transparent;
      font-size:14px;
      font-weight:900;
      line-height:1;
      touch-action:manipulation;
    }
    .tableStateChoice[data-state-type="monarch"]{color:#ffd76d}
    .tableStateChoice[data-state-type="initiative"]{color:#d9c2ff}
    .tableStateChoice.active{
      background:rgba(255,255,255,.16);
      box-shadow:inset 0 0 0 1px currentColor;
    }
    #unifiedTableStateHub.is-selecting{
      box-shadow:0 0 0 3px rgba(255,255,255,.72),0 5px 18px rgba(0,0,0,.52);
    }
    #unifiedTableStateHint{
      position:absolute;
      left:50%;
      top:calc(100% + 5px);
      transform:translateX(-50%);
      min-width:max-content;
      padding:2px 7px;
      border-radius:999px;
      background:#080b10ed;
      color:#fff;
      font-size:8px;
      font-weight:800;
      line-height:1.4;
      opacity:0;
      pointer-events:none;
      transition:opacity 120ms ease;
    }
    #unifiedTableStateHub.is-selecting #unifiedTableStateHint{opacity:1}
    #app .p.table-state-pick-target{box-shadow:inset 0 0 0 4px rgba(255,255,255,.60);cursor:pointer}
    #app .p.table-state-pick-current{box-shadow:inset 0 0 0 4px rgba(255,204,102,.90)}
    #tableStateToggle[aria-pressed="true"]{
      border-color:rgba(126,220,143,.55);
      background:rgba(83,166,105,.18);
    }
    @media (prefers-reduced-motion:reduce){
      .tableStateRing,#unifiedTableStateHint{transition:none}
    }
  `;
  document.head.appendChild(style);

  const stage=document.getElementById('stage');
  const app=document.getElementById('app');
  if(!stage||!app)return;

  const hub=document.createElement('div');
  hub.id='unifiedTableStateHub';
  hub.innerHTML=`
    <div class="tableStateRing" aria-hidden="true"></div>
    <div class="tableStateCenter">
      <button type="button" class="tableStateChoice" data-state-type="monarch" aria-label="Monarchの移動先を選ぶ">♛</button>
      <button type="button" class="tableStateChoice" data-state-type="initiative" aria-label="Initiativeの移動先を選ぶ">◆</button>
    </div>
    <div id="unifiedTableStateHint">移動先をタップ</div>`;
  stage.appendChild(hub);

  function segmentFor(type,owner){
    if(owner===null||owner===undefined||owner<0||owner>=state.count)return null;
    const slot=type==='monarch'?0:1;
    if(state.count===4){
      const pairs=[[6,7],[0,1],[4,5],[2,3]];
      return pairs[owner]?.[slot]??null;
    }
    if(state.count===3){
      const pairs=[[7,0],[4,5],[2,3]];
      return pairs[owner]?.[slot]??null;
    }
    if(state.count===2){
      const pairs=[[7,0],[3,4]];
      return pairs[owner]?.[slot]??null;
    }
    return null;
  }

  function ringBackground(){
    const segments=Array(8).fill(NEUTRAL);
    const monarchSegment=segmentFor('monarch',state.monarch);
    const initiativeSegment=segmentFor('initiative',state.initiative);
    if(monarchSegment!==null)segments[monarchSegment]=GOLD;
    if(initiativeSegment!==null)segments[initiativeSegment]=PURPLE;
    const stops=segments.map((color,index)=>`${color} ${index*45}deg ${(index+1)*45}deg`).join(',');
    return `repeating-conic-gradient(from 0deg,rgba(255,255,255,.18) 0deg 1deg,transparent 1deg 45deg),conic-gradient(from 0deg,${stops})`;
  }

  function syncSettingsButton(){
    const button=document.getElementById('tableStateToggle');
    if(!button)return;
    button.setAttribute('aria-pressed',String(hubEnabled));
    button.textContent=hubEnabled?'ON':'OFF';
  }

  function syncHub(){
    const centerX=app.offsetLeft+app.offsetWidth/2;
    const centerY=app.offsetTop+app.offsetHeight/2;
    hub.style.left=`${centerX}px`;
    hub.style.top=`${centerY}px`;
    hub.hidden=!hubEnabled;
    hub.classList.toggle('is-selecting',Boolean(pickType));
    hub.querySelector('.tableStateRing').style.background=ringBackground();
    hub.querySelectorAll('[data-state-type]').forEach(button=>{
      button.classList.toggle('active',button.dataset.stateType===pickType);
    });

    const hint=document.getElementById('unifiedTableStateHint');
    if(hint)hint.textContent=pickType==='monarch'?'Monarch → 移動先':pickType==='initiative'?'Initiative → 移動先':'移動先をタップ';

    const players=[...app.querySelectorAll('.p')];
    players.forEach((player,index)=>{
      const target=hubEnabled&&Boolean(pickType)&&index<state.count&&!player.classList.contains('hide');
      player.classList.toggle('table-state-pick-target',target);
      player.classList.toggle('table-state-pick-current',target&&state[pickType]===index);
    });
    syncSettingsButton();
  }

  function cancelPick(){
    if(!pickType)return;
    pickType=null;
    syncHub();
  }

  function setEnabled(enabled){
    hubEnabled=Boolean(enabled);
    localStorage.setItem(STORAGE_KEY_TABLE_HUB,hubEnabled?'1':'0');
    pickType=null;
    if(!hubEnabled){
      state.monarch=null;
      state.initiative=null;
      saveState();
      render();
      return;
    }
    syncHub();
  }

  function installSetting(){
    if(document.getElementById('tableStateSettingRow'))return;
    const panel=document.querySelector('#settings .modal');
    const acts=panel?.querySelector('.acts');
    if(!panel||!acts)return;
    const row=document.createElement('div');
    row.id='tableStateSettingRow';
    row.className='row';
    row.innerHTML=`<b>Monarch / Initiative</b><div><button type="button" id="tableStateToggle" aria-pressed="true">ON</button></div>`;
    panel.insertBefore(row,acts);
    row.querySelector('#tableStateToggle').addEventListener('click',event=>{
      event.stopPropagation();
      setEnabled(!hubEnabled);
    });
    syncSettingsButton();
  }

  hub.addEventListener('click',event=>{
    const button=event.target.closest('[data-state-type]');
    if(!button||!hubEnabled)return;
    event.preventDefault();
    event.stopPropagation();
    const type=button.dataset.stateType;
    pickType=pickType===type?null:type;
    syncHub();
    navigator.vibrate?.(12);
  });

  app.addEventListener('pointerdown',event=>{
    if(!pickType||!hubEnabled)return;
    const player=event.target.closest('.p');
    if(!player||player.classList.contains('hide'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);

  app.addEventListener('click',event=>{
    if(!pickType||!hubEnabled)return;
    const player=event.target.closest('.p');
    if(!player||player.classList.contains('hide'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const index=[...app.children].indexOf(player);
    if(index<0||index>=state.count)return;
    const type=pickType;
    pickType=null;
    mutate(()=>{state[type]=state[type]===index?null:index});
    navigator.vibrate?.(18);
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')cancelPick();
  });

  window.__edhTableStatePickActive=()=>hubEnabled&&Boolean(pickType);

  const baseRender=render;
  render=function(){
    baseRender();
    syncHub();
    installSetting();
  };

  window.addEventListener('resize',()=>requestAnimationFrame(syncHub));

  installSetting();
  syncHub();
})();
