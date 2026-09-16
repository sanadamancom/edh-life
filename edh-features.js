(()=>{
  if(typeof state==='undefined'||typeof render!=='function')return;

  const persisted=(()=>{
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||null}catch{return null}
  })();
  const baseNormalizeState=normalizeState;
  const baseRender=render;

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

  function taxMarkup(sourcePlayer,slot){
    const tax=sourcePlayer.tax?.[slot]||0;
    return `<span class="cmdTax${tax?'':' empty'}">${tax?`T+${tax}`:''}</span>`;
  }

  function quickPlus(target,source,slot){
    return `<button type="button" class="cmdQuickPlus" data-cmd="1" data-slot="${slot}" data-t="${target}" data-s="${source}" aria-label="Commander Damageを1増やす">＋1</button>`;
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
          <div class="cc commanderQuick ${first>=18?'hot':''}" data-cmd-card data-t="${playerIndex}" data-s="${source}" style="--c:${sourcePlayer.color}" title="長押しで統率者詳細">
            <div class="cw">${escapeHtml(sourcePlayer.name)}</div>
            <div class="commanderQuickRow">
              <div class="cv">${first}</div>
              ${taxMarkup(sourcePlayer,0)}
              ${quickPlus(playerIndex,source,0)}
            </div>
          </div>`);
        continue;
      }

      cards.push(`
        <div class="cc partnerCc ${(first>=18||second>=18)?'hot':''}" data-cmd-card data-t="${playerIndex}" data-s="${source}" style="--c:${sourcePlayer.color}" title="長押しでPartner詳細">
          <div class="cw">${escapeHtml(sourcePlayer.name)} · Partner</div>
          <div class="partnerRows">
            <div class="partnerRow ${first>=18?'hot':''}">
              <span class="partnerMark">A</span><b>${first}</b>${taxMarkup(sourcePlayer,0)}${quickPlus(playerIndex,source,0)}
            </div>
            <div class="partnerRow ${second>=18?'hot':''}">
              <span class="partnerMark">B</span><b>${second}</b>${taxMarkup(sourcePlayer,1)}${quickPlus(playerIndex,source,1)}
            </div>
          </div>
        </div>`);
    }
    return cards.join('');
  };

  counterBadges=function(player){
    const badges=[];
    if(player.poison>0){
      badges.push(`<span class="counterBadge poison ${player.poison>=8?'hot':''}" aria-label="毒カウンター ${player.poison}">${icon('skull','counterIcon')}<b>${player.poison}</b></span>`);
    }
    if(player.experience>0){
      badges.push(`<span class="counterBadge experience" aria-label="経験カウンター ${player.experience}">${icon('experience','counterIcon')}<b>${player.experience}</b></span>`);
    }
    if(player.speed>0){
      badges.push(`<span class="counterBadge speed" aria-label="速度 ${player.speed}">${icon('speed','counterIcon')}<b>${player.speed}</b></span>`);
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
    .cc{position:relative}
    .cc.commander-holding::after{
      content:"";position:absolute;inset:2px;z-index:5;padding:2px;pointer-events:none;border-radius:inherit;
      background:conic-gradient(from -90deg,var(--warn) var(--hold-angle),rgba(255,255,255,.12) 0deg);
      -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
      animation:commander-hold-progress 360ms linear forwards
    }
    @keyframes commander-hold-progress{from{--hold-angle:0deg}to{--hold-angle:360deg}}

    .commanderQuick{padding:calc(4px * var(--ui-scale)) calc(5px * var(--ui-scale))}
    .commanderQuickRow{display:grid;grid-template-columns:auto minmax(0,1fr) minmax(46px,34%);gap:5px;align-items:center;margin-top:3px}
    .commanderQuick .cv{margin:0;font-size:calc(24px * var(--ui-scale))}
    .cmdQuickPlus{
      min-width:0;min-height:calc(31px * var(--ui-scale));padding:0 6px;border:1px solid rgba(255,255,255,.13);
      border-radius:calc(8px * var(--ui-scale));background:rgba(255,255,255,.10);font-size:calc(15px * var(--ui-scale));font-weight:900
    }
    .cmdTax{justify-self:center;padding:2px 5px;border:1px solid rgba(255,204,102,.34);border-radius:999px;color:#ffd477;background:#2a210be8;font-size:calc(9px * var(--ui-scale));font-weight:900;line-height:1.15;white-space:nowrap}
    .cmdTax.empty{visibility:hidden}

    .partnerCc{padding:calc(3px * var(--ui-scale)) calc(4px * var(--ui-scale))}
    .partnerRows{display:grid;gap:3px;margin-top:3px}
    .partnerRow{display:grid;grid-template-columns:14px 24px minmax(0,1fr) minmax(48px,36%);gap:4px;align-items:center;min-width:0}
    .partnerRow b{font-size:calc(16px * var(--ui-scale));font-variant-numeric:tabular-nums;line-height:1}
    .partnerRow.hot b{color:var(--danger)}
    .partnerMark{font-size:10px;font-weight:900;color:var(--mut)}
    .partnerRow .cmdQuickPlus{min-height:calc(29px * var(--ui-scale));font-size:calc(14px * var(--ui-scale));border-radius:calc(7px * var(--ui-scale))}
    .partnerRow .cmdTax{font-size:calc(8px * var(--ui-scale));padding:2px 4px}

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

    #tableStateHub{position:absolute;z-index:15;display:flex;align-items:center;gap:7px;transform:translate(-50%,-50%);pointer-events:auto}
    .statePieWrap{display:grid;place-items:center;gap:2px}
    .statePie{
      position:relative;width:44px;height:44px;padding:0;overflow:hidden;border:1px solid rgba(255,255,255,.20);border-radius:50%;
      background:#0b0f16;box-shadow:0 4px 14px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.08);touch-action:manipulation
    }
    .statePieGrid{position:absolute;inset:2px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:1px;border-radius:50%;overflow:hidden;background:#05070b}
    .pieQuarter{background:rgba(255,255,255,.07);transition:background-color 150ms ease,filter 150ms ease}
    .statePie.monarch .pieQuarter.active{background:#d7a82c;filter:brightness(1.16)}
    .statePie.initiative .pieQuarter.active{background:#9a72d7;filter:brightness(1.18)}
    .statePieIcon{position:absolute;inset:50% auto auto 50%;width:20px;height:20px;display:grid;place-items:center;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.20);border-radius:50%;background:#111722;color:#fff;font-size:12px;font-weight:900;box-shadow:0 2px 7px rgba(0,0,0,.55)}
    .statePie.monarch .statePieIcon{color:#ffd76d}.statePie.initiative .statePieIcon{color:#d9c2ff}
    .statePie.is-selecting{box-shadow:0 0 0 3px rgba(255,255,255,.78),0 5px 18px rgba(0,0,0,.5)}
    .statePieLabel{color:rgba(255,255,255,.72);font-size:7px;font-weight:900;line-height:1;letter-spacing:.04em}
    #tableStateHint{position:absolute;left:50%;top:calc(100% + 4px);transform:translateX(-50%);min-width:max-content;padding:2px 6px;border-radius:999px;background:#080b10e8;color:#fff;font-size:8px;font-weight:800;opacity:0;pointer-events:none;transition:opacity 120ms ease}
    #tableStateHub.is-selecting #tableStateHint{opacity:1}
    #app .p.state-pick-target{box-shadow:inset 0 0 0 4px rgba(255,255,255,.62);cursor:pointer}
    #app .p.state-pick-current{box-shadow:inset 0 0 0 4px rgba(255,204,102,.88)}
    @media (prefers-reduced-motion:reduce){.pieQuarter,#tableStateHint{transition:none}}
  `;
  document.head.appendChild(style);

  const stage=document.getElementById('stage');

  const tableStateHub=document.createElement('div');
  tableStateHub.id='tableStateHub';
  tableStateHub.innerHTML=`
    <div class="statePieWrap">
      <button type="button" class="statePie monarch" data-table-state="monarch" aria-label="Monarchの移動先を選ぶ">
        <span class="statePieGrid"><i class="pieQuarter" data-q="0"></i><i class="pieQuarter" data-q="1"></i><i class="pieQuarter" data-q="2"></i><i class="pieQuarter" data-q="3"></i></span>
        <span class="statePieIcon">♛</span>
      </button>
      <span class="statePieLabel">MONARCH</span>
    </div>
    <div class="statePieWrap">
      <button type="button" class="statePie initiative" data-table-state="initiative" aria-label="Initiativeの移動先を選ぶ">
        <span class="statePieGrid"><i class="pieQuarter" data-q="0"></i><i class="pieQuarter" data-q="1"></i><i class="pieQuarter" data-q="2"></i><i class="pieQuarter" data-q="3"></i></span>
        <span class="statePieIcon">◆</span>
      </button>
      <span class="statePieLabel">INIT</span>
    </div>
    <div id="tableStateHint">移動先をタップ</div>`;
  stage.appendChild(tableStateHub);

  let statePickType=null;

  function ownerSegments(owner){
    if(owner===null||owner===undefined||owner<0||owner>=state.count)return [];
    if(state.count===4)return [owner];
    if(state.count===3){
      if(owner===0)return [0,1];
      return owner===1?[2]:[3];
    }
    if(state.count===2)return owner===0?[0,1]:[2,3];
    return [];
  }

  function syncPie(type){
    const pie=tableStateHub.querySelector(`[data-table-state="${type}"]`);
    if(!pie)return;
    const active=new Set(ownerSegments(state[type]));
    pie.querySelectorAll('.pieQuarter').forEach(quarter=>quarter.classList.toggle('active',active.has(Number(quarter.dataset.q))));
    pie.classList.toggle('is-selecting',statePickType===type);
  }

  function syncTableHub(){
    const centerX=app.offsetLeft+app.offsetWidth/2;
    const centerY=app.offsetTop+app.offsetHeight/2;
    tableStateHub.style.left=`${centerX}px`;
    tableStateHub.style.top=`${centerY}px`;
    tableStateHub.classList.toggle('is-selecting',Boolean(statePickType));
    syncPie('monarch');
    syncPie('initiative');

    const players=[...app.querySelectorAll('.p')];
    players.forEach((player,index)=>{
      const target=Boolean(statePickType)&&index<state.count;
      player.classList.toggle('state-pick-target',target);
      player.classList.toggle('state-pick-current',target&&state[statePickType]===index);
    });
  }

  tableStateHub.addEventListener('click',event=>{
    const pie=event.target.closest('[data-table-state]');
    if(!pie)return;
    event.stopPropagation();
    const type=pie.dataset.tableState;
    statePickType=statePickType===type?null:type;
    syncTableHub();
    navigator.vibrate?.(12);
  });

  app.addEventListener('pointerdown',event=>{
    if(!statePickType)return;
    if(event.target.closest('.p'))event.stopPropagation();
  },true);

  app.addEventListener('click',event=>{
    if(!statePickType)return;
    const player=event.target.closest('.p');
    if(!player||player.classList.contains('hide'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const index=[...app.children].indexOf(player);
    if(index<0||index>=state.count)return;
    const type=statePickType;
    statePickType=null;
    mutate(()=>{state[type]=state[type]===index?null:index});
    navigator.vibrate?.(18);
  },true);

  window.__edhTableStatePickActive=()=>Boolean(statePickType);
  window.addEventListener('resize',()=>requestAnimationFrame(syncTableHub));

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
    if(statePickType)return;
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

  render=function(){
    baseRender();
    syncTableHub();
  };

  saveState();
  render();
})();
