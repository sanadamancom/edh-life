(()=>{
  if(typeof state==='undefined'||typeof render!=='function')return;

  const persisted=(()=>{
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||null}catch{return null}
  })();
  const baseNormalizeState=normalizeState;
  const baseOpenCounters=openCounters;

  function clampOwner(value,count){
    const n=Number(value);
    return Number.isInteger(n)&&n>=0&&n<count?n:null;
  }

  normalizeState=function(raw){
    const base=baseNormalizeState(raw);
    base.players=base.players.map((player,index)=>{
      const source=raw?.players?.[index]||{};
      return {
        ...player,
        partner:Boolean(source.partner),
        cmdB:Array.from({length:4},(_,i)=>normalizeCounter(source.cmdB?.[i])),
        tax:[normalizeCounter(source.tax?.[0]),normalizeCounter(source.tax?.[1])]
      };
    });
    base.monarch=clampOwner(raw?.monarch,base.count);
    base.initiative=clampOwner(raw?.initiative,base.count);
    return base;
  };

  state=normalizeState(persisted||state);

  saveState=function(){
    localStorage.setItem(STORAGE_KEY,JSON.stringify({
      count:state.count,
      players:state.players,
      monarch:state.monarch,
      initiative:state.initiative,
      hist:state.hist.slice(-HISTORY_LIMIT)
    }));
  };

  snapshot=function(){
    return JSON.stringify({
      count:state.count,
      players:state.players,
      monarch:state.monarch,
      initiative:state.initiative
    });
  };

  defeatState=function(player,index){
    for(let source=0;source<state.count;source++){
      if(source===index)continue;
      const sourcePlayer=state.players[source];
      const first=player.cmd[source]||0;
      if(first>=21){
        const label=sourcePlayer.partner?'COMMANDER A 21':'COMMANDER DAMAGE 21';
        return {defeated:true,reason:`${label} — ${sourcePlayer.name}`};
      }
      if(sourcePlayer.partner&&(player.cmdB?.[source]||0)>=21){
        return {defeated:true,reason:`COMMANDER B 21 — ${sourcePlayer.name}`};
      }
    }
    if(player.poison>=10)return {defeated:true,reason:'POISON 10'};
    if(player.life<=0)return {defeated:true,reason:'LIFE 0'};
    return {defeated:false,reason:''};
  };

  function commanderButtons(target,source,slot){
    return `
      <button type="button" data-cmd="-1" data-slot="${slot}" data-t="${target}" data-s="${source}">−1</button>
      <button type="button" data-cmd="1" data-slot="${slot}" data-t="${target}" data-s="${source}">＋1</button>`;
  }

  commanderCards=function(playerIndex){
    const cards=[];
    for(let source=0;source<state.count;source++){
      if(source===playerIndex)continue;
      const sourcePlayer=state.players[source];
      const first=state.players[playerIndex].cmd[source]||0;
      const second=state.players[playerIndex].cmdB?.[source]||0;
      if(!sourcePlayer.partner){
        cards.push(`
          <div class="cc ${first>=18?'hot':''}" data-cmd-card data-t="${playerIndex}" data-s="${source}" style="--c:${sourcePlayer.color}" title="長押しで統率者設定">
            <div class="cw">${escapeHtml(sourcePlayer.name)}</div>
            <div class="cv">${first}</div>
            <div class="cb">${commanderButtons(playerIndex,source,0)}</div>
          </div>`);
        continue;
      }
      cards.push(`
        <div class="cc partnerCc ${(first>=18||second>=18)?'hot':''}" data-cmd-card data-t="${playerIndex}" data-s="${source}" style="--c:${sourcePlayer.color}" title="長押しでPartner設定">
          <div class="cw">${escapeHtml(sourcePlayer.name)} · Partner</div>
          <div class="partnerRows">
            <div class="partnerRow ${first>=18?'hot':''}">
              <span class="partnerMark">A</span><b>${first}</b><div class="cb">${commanderButtons(playerIndex,source,0)}</div>
            </div>
            <div class="partnerRow ${second>=18?'hot':''}">
              <span class="partnerMark">B</span><b>${second}</b><div class="cb">${commanderButtons(playerIndex,source,1)}</div>
            </div>
          </div>
        </div>`);
    }
    return cards.join('');
  };

  counterBadges=function(player){
    const badges=[];
    const index=state.players.indexOf(player);
    if(player.poison>0){
      badges.push(`<span class="counterBadge poison ${player.poison>=8?'hot':''}" aria-label="毒カウンター ${player.poison}">${icon('skull','counterIcon')}<b>${player.poison}</b></span>`);
    }
    if(player.experience>0){
      badges.push(`<span class="counterBadge experience" aria-label="経験カウンター ${player.experience}">${icon('experience','counterIcon')}<b>${player.experience}</b></span>`);
    }
    if(player.speed>0){
      badges.push(`<span class="counterBadge speed" aria-label="速度 ${player.speed}">${icon('speed','counterIcon')}<b>${player.speed}</b></span>`);
    }
    if(state.monarch===index){
      badges.push('<span class="counterBadge monarch" aria-label="Monarch"><b>♛</b></span>');
    }
    if(state.initiative===index){
      badges.push('<span class="counterBadge initiative" aria-label="Initiative"><b>◆</b></span>');
    }
    return badges.length?`<div class="counterBadges">${badges.join('')}</div>`:'';
  };

  resetGame=function(){
    mutate(()=>{
      state.players.forEach(player=>{
        player.life=40;
        player.cmd=[0,0,0,0];
        player.cmdB=[0,0,0,0];
        player.tax=[0,0];
        player.poison=0;
        player.experience=0;
        player.speed=0;
      });
      state.monarch=null;
      state.initiative=null;
    });
  };

  const style=document.createElement('style');
  style.textContent=`
    .counterBadge.monarch{color:#ffd46d;border-color:#ffd46d70;background:#241b08e8}
    .counterBadge.initiative{color:#cfb4ff;border-color:#cfb4ff70;background:#160e24e8}
    .cc{position:relative}
    .cc.commander-holding::after{
      content:"";position:absolute;inset:2px;z-index:5;padding:2px;pointer-events:none;border-radius:inherit;
      background:conic-gradient(from -90deg,var(--warn) var(--hold-angle),rgba(255,255,255,.12) 0deg);
      -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
      animation:commander-hold-progress 360ms linear forwards
    }
    @keyframes commander-hold-progress{from{--hold-angle:0deg}to{--hold-angle:360deg}}
    .partnerCc{padding:calc(3px * var(--ui-scale)) calc(4px * var(--ui-scale))}
    .partnerRows{display:grid;gap:2px;margin-top:2px}
    .partnerRow{display:grid;grid-template-columns:14px 22px 1fr;gap:2px;align-items:center;min-width:0}
    .partnerRow b{font-size:calc(14px * var(--ui-scale));font-variant-numeric:tabular-nums;line-height:1}
    .partnerRow.hot b{color:var(--danger)}
    .partnerMark{font-size:9px;font-weight:900;color:var(--mut)}
    .partnerRow .cb{gap:2px}
    .partnerRow .cb button{min-height:calc(19px * var(--ui-scale));font-size:calc(10px * var(--ui-scale));border-radius:5px}
    .tableStateSection{grid-column:1/-1;padding-top:2px}
    .tableStateTitle{margin:1px 0 7px;text-align:center;color:var(--mut);font-size:11px;font-weight:800;letter-spacing:.05em}
    .tableStateGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .tableStateButton{min-height:44px;border-radius:12px!important;font-weight:800!important}
    .tableStateButton.active{box-shadow:inset 0 0 0 2px currentColor!important;background:rgba(255,255,255,.13)!important}
    #monarchToggle{color:#ffd46d}#initiativeToggle{color:#cfb4ff}
    .commanderPanel{width:min(590px,92%);padding:14px 16px}
    .commanderPanel h2{text-align:center;margin:0 0 2px}
    .commanderContext{text-align:center;color:var(--mut);font-size:13px;font-weight:800;margin-bottom:10px}
    .commanderMode{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px}
    .commanderMode button.active{background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 2px var(--warn)}
    .commanderDetailGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    .commanderUnit{padding:10px;border:1px solid rgba(255,255,255,.10);border-radius:14px;background:#0d1118}
    .commanderUnit.hidden{display:none}
    .commanderUnitTitle{text-align:center;font-weight:900;margin-bottom:8px}
    .commanderStat{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin-top:8px}
    .commanderStatLabel{color:var(--mut);font-size:11px;font-weight:800}
    .commanderValue{font-size:26px;font-weight:900;font-variant-numeric:tabular-nums}
    .commanderControls{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .commanderControls button{min-height:38px}
    .commanderTaxValue{font-size:18px;font-weight:900}
    .commander-flipped .commanderPanel{transform:rotate(180deg) translateY(5px) scale(.965)}
    .commander-flipped.show .commanderPanel{transform:rotate(180deg) translateY(0) scale(1)}
  `;
  document.head.appendChild(style);

  const counterGrid=document.querySelector('#counters .counterGrid');
  if(counterGrid&&!document.getElementById('tableStateSection')){
    const section=document.createElement('div');
    section.id='tableStateSection';
    section.className='tableStateSection';
    section.innerHTML=`
      <div class="tableStateTitle">卓上状態</div>
      <div class="tableStateGrid">
        <button type="button" id="monarchToggle" class="tableStateButton">♛ Monarch</button>
        <button type="button" id="initiativeToggle" class="tableStateButton">◆ Initiative</button>
      </div>`;
    counterGrid.appendChild(section);
  }

  const stage=document.getElementById('stage');
  const commanderOverlay=document.createElement('div');
  commanderOverlay.id='commanderDetail';
  commanderOverlay.className='ov';
  commanderOverlay.innerHTML=`
    <div class="modal commanderPanel" role="dialog" aria-modal="true" aria-labelledby="commanderDetailTitle">
      <h2 id="commanderDetailTitle">統率者</h2>
      <div id="commanderContext" class="commanderContext"></div>
      <div class="commanderMode">
        <button type="button" data-commander-mode="single">単一統率者</button>
        <button type="button" data-commander-mode="partner">Partner</button>
      </div>
      <div id="commanderDetailGrid" class="commanderDetailGrid"></div>
      <div class="acts"><button type="button" id="commanderDetailClose">閉じる</button></div>
    </div>`;
  stage.appendChild(commanderOverlay);

  let commanderContext=null;

  function syncTableStateButtons(){
    const monarch=document.getElementById('monarchToggle');
    const initiative=document.getElementById('initiativeToggle');
    if(counterIndex===null||!monarch||!initiative)return;
    const monarchActive=state.monarch===counterIndex;
    const initiativeActive=state.initiative===counterIndex;
    monarch.classList.toggle('active',monarchActive);
    initiative.classList.toggle('active',initiativeActive);
    monarch.textContent=monarchActive?'♛ Monarchを解除':'♛ Monarchにする';
    initiative.textContent=initiativeActive?'◆ Initiativeを解除':'◆ Initiativeにする';
  }

  openCounters=function(index){
    baseOpenCounters(index);
    syncTableStateButtons();
  };

  document.getElementById('monarchToggle')?.addEventListener('click',()=>{
    if(counterIndex===null)return;
    mutate(()=>{state.monarch=state.monarch===counterIndex?null:counterIndex});
    syncTableStateButtons();
  });
  document.getElementById('initiativeToggle')?.addEventListener('click',()=>{
    if(counterIndex===null)return;
    mutate(()=>{state.initiative=state.initiative===counterIndex?null:counterIndex});
    syncTableStateButtons();
  });

  function damageValue(target,source,slot){
    return slot===0?(state.players[target].cmd[source]||0):(state.players[target].cmdB?.[source]||0);
  }

  function unitMarkup(target,source,slot){
    const value=damageValue(target,source,slot);
    const tax=state.players[source].tax?.[slot]||0;
    return `
      <div class="commanderUnit ${slot===1&&!state.players[source].partner?'hidden':''}" data-unit-slot="${slot}">
        <div class="commanderUnitTitle">統率者 ${slot===0?'A':'B'}</div>
        <div class="commanderStat"><span class="commanderStatLabel">このプレイヤーへのDamage</span><b class="commanderValue">${value}</b>
          <div class="commanderControls">
            <button type="button" data-detail-damage="-1" data-slot="${slot}">−1</button>
            <button type="button" data-detail-damage="1" data-slot="${slot}">＋1</button>
          </div>
        </div>
        <div class="commanderStat"><span class="commanderStatLabel">Commander Tax</span><b class="commanderTaxValue">＋${tax}</b>
          <div class="commanderControls">
            <button type="button" data-detail-tax="-2" data-slot="${slot}">−2</button>
            <button type="button" data-detail-tax="2" data-slot="${slot}">＋2</button>
          </div>
        </div>
      </div>`;
  }

  function syncCommanderDetail(){
    if(!commanderContext)return;
    const {target,source}=commanderContext;
    if(!state.players[target]||!state.players[source])return;
    const sourcePlayer=state.players[source];
    document.getElementById('commanderContext').textContent=`${state.players[target].name} ← ${sourcePlayer.name}`;
    document.querySelectorAll('[data-commander-mode]').forEach(button=>{
      button.classList.toggle('active',(button.dataset.commanderMode==='partner')===sourcePlayer.partner);
    });
    document.getElementById('commanderDetailGrid').innerHTML=unitMarkup(target,source,0)+unitMarkup(target,source,1);
  }

  function openCommanderDetail(target,source){
    commanderContext={target,source};
    syncCommanderDetail();
    commanderOverlay.classList.toggle('commander-flipped',playerFacesOpposite(target));
    commanderOverlay.classList.add('show');
  }

  function closeCommanderDetail(){
    commanderOverlay.classList.remove('show','commander-flipped');
    commanderContext=null;
  }

  commanderOverlay.addEventListener('click',event=>{
    if(event.target===commanderOverlay){closeCommanderDetail();return}
    const mode=event.target.closest('[data-commander-mode]');
    if(mode&&commanderContext){
      const {source}=commanderContext;
      const partner=mode.dataset.commanderMode==='partner';
      if(state.players[source].partner!==partner)mutate(()=>{state.players[source].partner=partner});
      syncCommanderDetail();
      return;
    }
    const damage=event.target.closest('[data-detail-damage]');
    if(damage&&commanderContext){
      const {target,source}=commanderContext;
      const slot=Number(damage.dataset.slot);
      const delta=Number(damage.dataset.detailDamage);
      const store=slot===0?state.players[target].cmd:state.players[target].cmdB;
      const current=store[source]||0;
      const next=Math.max(0,current+delta);
      const applied=next-current;
      if(applied){
        mutate(()=>{store[source]=next;state.players[target].life-=applied});
        syncCommanderDetail();
      }
      return;
    }
    const taxButton=event.target.closest('[data-detail-tax]');
    if(taxButton&&commanderContext){
      const {source}=commanderContext;
      const slot=Number(taxButton.dataset.slot);
      const delta=Number(taxButton.dataset.detailTax);
      const current=state.players[source].tax[slot]||0;
      const next=Math.max(0,current+delta);
      if(next!==current){
        mutate(()=>{state.players[source].tax[slot]=next});
        syncCommanderDetail();
      }
    }
  });
  document.getElementById('commanderDetailClose').addEventListener('click',closeCommanderDetail);

  let commanderHoldTimer=0;
  let commanderHoldCard=null;
  let commanderHoldPointer=null;
  function clearCommanderHold(){
    if(commanderHoldTimer){clearTimeout(commanderHoldTimer);commanderHoldTimer=0}
    if(commanderHoldCard)commanderHoldCard.classList.remove('commander-holding');
    commanderHoldCard=null;
    commanderHoldPointer=null;
  }

  app.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    if(event.target.closest('button'))return;
    const card=event.target.closest('.cc[data-cmd-card]');
    if(!card)return;
    clearCommanderHold();
    event.preventDefault();
    commanderHoldCard=card;
    commanderHoldPointer=event.pointerId;
    card.classList.add('commander-holding');
    try{card.setPointerCapture?.(event.pointerId)}catch{}
    commanderHoldTimer=setTimeout(()=>{
      const target=Number(card.dataset.t);
      const source=Number(card.dataset.s);
      clearCommanderHold();
      openCommanderDetail(target,source);
    },360);
  });
  document.addEventListener('pointerup',event=>{if(event.pointerId===commanderHoldPointer)clearCommanderHold()},true);
  document.addEventListener('pointercancel',event=>{if(event.pointerId===commanderHoldPointer)clearCommanderHold()},true);
  app.addEventListener('contextmenu',event=>{
    if(event.target.closest('.cc[data-cmd-card]'))event.preventDefault();
  });

  /* Keyboard activation for Partner B bypasses the legacy slot-A click handler. */
  app.addEventListener('click',event=>{
    if(event.detail!==0)return;
    const button=event.target.closest('[data-cmd][data-slot="1"]');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const target=Number(button.dataset.t);
    const source=Number(button.dataset.s);
    const delta=Number(button.dataset.cmd);
    const current=state.players[target].cmdB[source]||0;
    const next=Math.max(0,current+delta);
    const applied=next-current;
    if(!applied)return;
    mutate(()=>{state.players[target].cmdB[source]=next;state.players[target].life-=applied});
  },true);

  saveState();
  render();
})();
