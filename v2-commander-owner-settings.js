(()=>{
  if(typeof state==='undefined'||typeof openCounters!=='function'||typeof render!=='function'||typeof saveState!=='function')return;

  const commanderDetail=document.getElementById('commanderDetail');
  const counterOverlay=document.getElementById('counters');
  const counterPanel=counterOverlay?.querySelector('.counterPanel');
  const counterGrid=counterPanel?.querySelector('.counterGrid');
  const counterTitle=counterPanel?.querySelector('#counterTitle');
  const counterPlayer=counterPanel?.querySelector('#counterPlayer');
  const settingsPlayers=document.getElementById('ps');
  const app=document.getElementById('app');
  if(!commanderDetail||!counterPanel||!counterGrid||!app)return;

  if(counterTitle)counterTitle.textContent='プレイヤー設定';
  counterGrid.style.display='none';
  if(settingsPlayers)settingsPlayers.style.display='none';

  /* Retired features stay readable in old localStorage payloads for compatibility,
     but no longer participate in gameplay, rendering, or defeat checks. */
  defeatState=function(player,index){
    for(let source=0;source<state.count;source++){
      if(source===index)continue;
      const sourcePlayer=state.players[source];
      const first=player.cmd?.[source]||0;
      if(first>=21){
        const label=sourcePlayer.partner?'COMMANDER A 21':'COMMANDER DAMAGE 21';
        return {defeated:true,reason:`${label} — ${sourcePlayer.name}`};
      }
      if(sourcePlayer.partner&&(player.cmdB?.[source]||0)>=21){
        return {defeated:true,reason:`COMMANDER B 21 — ${sourcePlayer.name}`};
      }
    }
    if(player.life<=0)return {defeated:true,reason:'LIFE 0'};
    return {defeated:false,reason:''};
  };
  counterBadges=()=>'';

  const style=document.createElement('style');
  style.id='v2-core-player-settings-style';
  style.textContent=`
    #commanderDetail .commanderMode{display:none!important}
    #commanderDetail .commanderStat:has(.commanderTaxValue){display:none!important}
    #commanderDetail .commanderDetailGrid:has(.commanderUnit.hidden){grid-template-columns:1fr!important}

    #counters .playerCoreSettings{
      display:grid;
      gap:12px;
      margin-top:2px;
      padding:12px;
      border:1px solid rgba(255,255,255,.10);
      border-radius:14px;
      background:rgba(10,14,20,.72)
    }
    #counters .playerCoreRow{
      display:grid;
      grid-template-columns:92px minmax(0,1fr);
      gap:10px;
      align-items:center
    }
    #counters .playerCoreLabel{
      color:var(--mut);
      font-size:12px;
      font-weight:900
    }
    #counters .playerNameInput{
      width:100%;
      min-width:0;
      height:44px;
      padding:0 11px;
      border:1px solid var(--line);
      border-radius:10px;
      outline:none;
      background:#090c11;
      color:var(--txt);
      font-size:16px;
      font-weight:800;
      -webkit-user-select:text;
      user-select:text
    }
    #counters .playerColorWrap{
      min-height:44px;
      display:flex;
      align-items:center;
      gap:10px
    }
    #counters .playerColorInput{
      width:58px;
      height:40px;
      padding:0;
      border:0;
      border-radius:10px;
      background:transparent
    }
    #counters .playerColorHint{
      color:var(--mut);
      font-size:11px;
      font-weight:800
    }
    #counters .playerPartnerMode{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:7px
    }
    #counters .playerPartnerMode button{
      min-height:44px;
      white-space:nowrap
    }
    #counters .playerPartnerMode button.active{
      background:rgba(255,255,255,.16);
      box-shadow:inset 0 0 0 2px var(--warn)
    }
    @media (max-width:430px){
      #counters .playerCoreRow{grid-template-columns:1fr;gap:6px}
      #counters .playerCoreLabel{text-align:left}
    }
  `;
  document.head.appendChild(style);

  const profilePanel=document.createElement('section');
  profilePanel.className='playerCoreSettings';
  counterGrid.insertAdjacentElement('afterend',profilePanel);

  let playerIndex=null;

  function syncPlayerPanel(index=playerIndex){
    if(index===null||!state.players[index])return;
    playerIndex=index;
    const player=state.players[index];
    const partner=Boolean(player.partner);
    if(counterPlayer)counterPlayer.textContent=player.name;
    profilePanel.innerHTML=`
      <label class="playerCoreRow">
        <span class="playerCoreLabel">名前</span>
        <input class="playerNameInput" type="text" maxlength="32" enterkeyhint="done" value="${escapeHtml(player.name)}" aria-label="プレイヤー名">
      </label>
      <label class="playerCoreRow">
        <span class="playerCoreLabel">カラー</span>
        <span class="playerColorWrap">
          <input class="playerColorInput" type="color" value="${player.color}" aria-label="プレイヤーカラー">
          <span class="playerColorHint">プレイヤー枠の色</span>
        </span>
      </label>
      <div class="playerCoreRow">
        <span class="playerCoreLabel">統率者</span>
        <div class="playerPartnerMode">
          <button type="button" data-player-mode="single" class="${partner?'':'active'}">単一統率者</button>
          <button type="button" data-player-mode="partner" class="${partner?'active':''}">Partner</button>
        </div>
      </div>`;
  }

  function saveProfileChange(action){
    action();
    saveState();
    render();
    syncPlayerPanel(playerIndex);
  }

  const baseOpenCounters=openCounters;
  openCounters=function(index){
    baseOpenCounters(index);
    syncPlayerPanel(index);
  };

  const baseRender=render;
  render=function(){
    baseRender();
    app.querySelectorAll('.life[data-life]').forEach(button=>{
      const index=Number(button.dataset.life);
      const player=state.players[index];
      if(player)button.setAttribute('aria-label',`${player.name}のプレイヤー設定を長押しして開く`);
    });
    app.querySelectorAll('.counterBadges,.ownerStatusBadges').forEach(element=>element.remove());
  };

  profilePanel.addEventListener('change',event=>{
    if(playerIndex===null||!state.players[playerIndex])return;
    const player=state.players[playerIndex];
    const nameInput=event.target.closest('.playerNameInput');
    if(nameInput){
      const next=nameInput.value.trim();
      if(!next){syncPlayerPanel(playerIndex);return}
      if(next===player.name)return;
      saveProfileChange(()=>{player.name=next});
      return;
    }
    const colorInput=event.target.closest('.playerColorInput');
    if(colorInput&&colorInput.value!==player.color){
      saveProfileChange(()=>{player.color=colorInput.value});
    }
  });

  profilePanel.addEventListener('click',event=>{
    if(playerIndex===null||!state.players[playerIndex])return;
    const mode=event.target.closest('[data-player-mode]');
    if(!mode)return;
    event.preventDefault();
    const player=state.players[playerIndex];
    const partner=mode.dataset.playerMode==='partner';
    if(Boolean(player.partner)===partner)return;
    saveProfileChange(()=>{player.partner=partner});
  });

  const detailTitle=commanderDetail.querySelector('#commanderDetailTitle');
  if(detailTitle)detailTitle.textContent='統率者ダメージ';

  render();
})();
