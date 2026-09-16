(()=>{
  if(typeof state==='undefined'||typeof mutate!=='function'||typeof openCounters!=='function'||typeof render!=='function')return;

  const commanderDetail=document.getElementById('commanderDetail');
  const counterOverlay=document.getElementById('counters');
  const counterPanel=counterOverlay?.querySelector('.counterPanel');
  const counterGrid=counterPanel?.querySelector('.counterGrid');
  const counterTitle=counterPanel?.querySelector('#counterTitle');
  const app=document.getElementById('app');
  if(!commanderDetail||!counterPanel||!counterGrid||!app)return;

  if(counterTitle)counterTitle.textContent='プレイヤー状態';

  const style=document.createElement('style');
  style.textContent=`
    #commanderDetail .commanderMode{display:none!important}
    #commanderDetail .commanderStat:has(.commanderTaxValue){display:none!important}
    #commanderDetail .commanderDetailGrid:has(.commanderUnit.hidden){grid-template-columns:1fr!important}

    #counters .ownerCommanderSettings{
      display:grid;
      gap:10px;
      margin-top:12px;
      padding:12px;
      border:1px solid rgba(255,255,255,.10);
      border-radius:14px;
      background:rgba(10,14,20,.72)
    }
    #counters .ownerCommanderHead,
    #counters .ownerTableHead{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px
    }
    #counters .ownerCommanderTitle,
    #counters .ownerTableTitle{
      font-size:14px;
      font-weight:900
    }
    #counters .ownerCommanderHint{
      color:var(--mut);
      font-size:10px;
      font-weight:800
    }
    #counters .ownerCommanderMode{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:7px
    }
    #counters .ownerCommanderMode button{
      min-height:40px;
      white-space:nowrap
    }
    #counters .ownerCommanderMode button.active{
      background:rgba(255,255,255,.16);
      box-shadow:inset 0 0 0 2px var(--warn)
    }
    #counters .ownerTaxGrid{
      display:grid;
      grid-template-columns:1fr;
      gap:7px
    }
    #counters .ownerTaxItem{
      display:grid;
      grid-template-columns:minmax(92px,auto) 1fr;
      gap:8px;
      align-items:center;
      min-width:0;
      padding:8px 9px;
      border:1px solid rgba(255,255,255,.09);
      border-radius:12px;
      background:#0d1118
    }
    #counters .ownerTaxLabel{
      color:var(--mut);
      font-size:11px;
      font-weight:900;
      white-space:nowrap
    }
    #counters .ownerTaxControls{
      display:grid;
      grid-template-columns:54px minmax(48px,1fr) 54px;
      gap:6px;
      align-items:center;
      min-width:0
    }
    #counters .ownerTaxControls button{
      min-width:0;
      min-height:42px;
      padding:0;
      white-space:nowrap;
      font-size:17px;
      font-weight:900
    }
    #counters .ownerTaxValue{
      display:flex;
      align-items:center;
      justify-content:center;
      min-width:48px;
      min-height:42px;
      border:1px solid rgba(255,255,255,.10);
      border-radius:10px;
      background:#090c11;
      font-size:19px;
      font-weight:900;
      font-variant-numeric:tabular-nums
    }
    #counters .ownerTaxMana{
      display:inline-grid;
      place-items:center;
      width:27px;
      height:27px;
      border:2px solid currentColor;
      border-radius:50%;
      line-height:1;
      color:#e8edf6;
      font-size:14px;
      font-weight:950
    }
    #counters .ownerTableSection{
      display:grid;
      gap:7px;
      padding-top:9px;
      border-top:1px solid rgba(255,255,255,.09)
    }
    #counters .ownerTableGrid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:7px
    }
    #counters .ownerTableButton{
      min-height:42px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:7px;
      white-space:nowrap;
      font-weight:900
    }
    #counters .ownerTableButton.monarch.active{
      color:#ffd76d;
      background:rgba(215,168,44,.16);
      box-shadow:inset 0 0 0 2px rgba(215,168,44,.72)
    }
    #counters .ownerTableButton.initiative.active{
      color:#d9c2ff;
      background:rgba(154,114,215,.16);
      box-shadow:inset 0 0 0 2px rgba(154,114,215,.72)
    }

    #app .ownerStatusBadges{
      position:absolute;
      left:calc(7px * var(--ui-scale));
      top:47%;
      z-index:6;
      display:flex;
      flex-direction:column;
      align-items:flex-start;
      gap:4px;
      transform:translateY(-50%);
      pointer-events:none
    }
    #app .ownerStatusBadge{
      min-width:28px;
      height:25px;
      padding:2px 6px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:4px;
      border:1px solid rgba(255,255,255,.22);
      border-radius:999px;
      background:rgba(7,10,15,.86);
      box-shadow:0 2px 7px rgba(0,0,0,.42);
      font-size:12px;
      font-weight:900;
      line-height:1;
      white-space:nowrap
    }
    #app .ownerStatusBadge.tax{color:#e7ebf4}
    #app .ownerStatusBadge.monarch{color:#ffd76d;border-color:rgba(215,168,44,.48)}
    #app .ownerStatusBadge.initiative{color:#d9c2ff;border-color:rgba(154,114,215,.50)}
    #app .ownerStatusSlot{
      min-width:9px;
      color:rgba(255,255,255,.68);
      font-size:9px;
      font-weight:950
    }
    #app .ownerManaPip{
      width:18px;
      height:18px;
      display:inline-grid;
      place-items:center;
      border:1.5px solid currentColor;
      border-radius:50%;
      font-size:10px;
      font-weight:950;
      line-height:1;
      font-variant-numeric:tabular-nums
    }
    #app .ownerStateIcon{
      font-size:14px;
      line-height:1
    }

    @media (max-width:430px){
      #counters .ownerTaxItem{grid-template-columns:1fr;gap:6px}
      #counters .ownerTaxLabel{text-align:center}
      #counters .ownerTaxControls{grid-template-columns:52px minmax(48px,1fr) 52px}
    }
  `;
  document.head.appendChild(style);

  const ownerPanel=document.createElement('section');
  ownerPanel.className='ownerCommanderSettings';
  counterGrid.insertAdjacentElement('afterend',ownerPanel);

  const clampTax=value=>Math.max(0,Math.trunc(Number(value)||0));
  let ownerIndex=null;

  function taxItem(slot,label,value){
    return `
      <div class="ownerTaxItem">
        <span class="ownerTaxLabel">${label}</span>
        <div class="ownerTaxControls">
          <button type="button" data-owner-tax="-2" data-owner-slot="${slot}" aria-label="${label}を2減らす">−2</button>
          <b class="ownerTaxValue"><span class="ownerTaxMana">${value}</span></b>
          <button type="button" data-owner-tax="2" data-owner-slot="${slot}" aria-label="${label}を2増やす">＋2</button>
        </div>
      </div>`;
  }

  function tableButton(type,label,iconGlyph,active){
    return `<button type="button" class="ownerTableButton ${type} ${active?'active':''}" data-owner-table="${type}" aria-pressed="${active?'true':'false'}"><span>${iconGlyph}</span><span>${label}</span></button>`;
  }

  function syncOwnerPanel(index=ownerIndex){
    if(index===null||!state.players[index])return;
    ownerIndex=index;
    const player=state.players[index];
    const partner=Boolean(player.partner);
    const taxA=clampTax(player.tax?.[0]);
    const taxB=clampTax(player.tax?.[1]);
    const isMonarch=state.monarch===index;
    const hasInitiative=state.initiative===index;

    ownerPanel.innerHTML=`
      <div class="ownerCommanderHead">
        <span class="ownerCommanderTitle">統率者設定</span>
        <span class="ownerCommanderHint">${escapeHtml(player.name)}</span>
      </div>
      <div class="ownerCommanderMode">
        <button type="button" data-owner-mode="single" class="${partner?'':'active'}">単一統率者</button>
        <button type="button" data-owner-mode="partner" class="${partner?'active':''}">Partner</button>
      </div>
      <div class="ownerTaxGrid">
        ${taxItem(0,partner?'統率者税 A':'統率者税',taxA)}
        ${partner?taxItem(1,'統率者税 B',taxB):''}
      </div>
      <div class="ownerTableSection">
        <div class="ownerTableHead"><span class="ownerTableTitle">卓上状態</span></div>
        <div class="ownerTableGrid">
          ${tableButton('monarch','統治者','♛',isMonarch)}
          ${tableButton('initiative','イニシアチブ','◆',hasInitiative)}
        </div>
      </div>`;
  }

  function taxBadge(slot,value,showSlot){
    if(value<=0)return '';
    return `<span class="ownerStatusBadge tax" aria-label="統率者税${showSlot?` ${slot}`:''} ${value}">${showSlot?`<span class="ownerStatusSlot">${slot}</span>`:''}<span class="ownerManaPip">${value}</span></span>`;
  }

  function syncOwnerBadges(){
    const sections=[...app.querySelectorAll(':scope > .p')];
    sections.forEach((section,index)=>{
      section.querySelector('.ownerStatusBadges')?.remove();
      if(index>=state.count||!state.players[index])return;
      const player=state.players[index];
      const partner=Boolean(player.partner);
      const items=[];
      const taxA=clampTax(player.tax?.[0]);
      const taxB=clampTax(player.tax?.[1]);
      if(partner){
        items.push(taxBadge('A',taxA,true));
        items.push(taxBadge('B',taxB,true));
      }else{
        items.push(taxBadge('',taxA,false));
      }
      if(state.monarch===index)items.push('<span class="ownerStatusBadge monarch" aria-label="統治者"><span class="ownerStateIcon">♛</span></span>');
      if(state.initiative===index)items.push('<span class="ownerStatusBadge initiative" aria-label="イニシアチブ"><span class="ownerStateIcon">◆</span></span>');
      const html=items.filter(Boolean).join('');
      if(!html)return;
      const host=section.querySelector('.pc');
      if(!host)return;
      const badges=document.createElement('div');
      badges.className='ownerStatusBadges';
      badges.innerHTML=html;
      host.appendChild(badges);
    });
  }

  const baseOpenCounters=openCounters;
  openCounters=function(index){
    baseOpenCounters(index);
    syncOwnerPanel(index);
  };

  const baseRender=render;
  render=function(){
    baseRender();
    syncOwnerBadges();
  };

  ownerPanel.addEventListener('click',event=>{
    if(ownerIndex===null)return;
    const player=state.players[ownerIndex];
    if(!player)return;

    const mode=event.target.closest('[data-owner-mode]');
    if(mode){
      event.preventDefault();
      const partner=mode.dataset.ownerMode==='partner';
      if(Boolean(player.partner)===partner)return;
      mutate(()=>{player.partner=partner});
      syncOwnerPanel(ownerIndex);
      syncOwnerBadges();
      return;
    }

    const taxButton=event.target.closest('[data-owner-tax]');
    if(taxButton){
      event.preventDefault();
      const slot=Number(taxButton.dataset.ownerSlot);
      const delta=Number(taxButton.dataset.ownerTax);
      if(![0,1].includes(slot)||!delta)return;
      const current=clampTax(player.tax?.[slot]);
      const next=Math.max(0,current+delta);
      if(next===current)return;
      mutate(()=>{
        if(!Array.isArray(player.tax))player.tax=[0,0];
        player.tax[slot]=next;
      });
      syncOwnerPanel(ownerIndex);
      syncOwnerBadges();
      return;
    }

    const tableButtonElement=event.target.closest('[data-owner-table]');
    if(tableButtonElement){
      event.preventDefault();
      const key=tableButtonElement.dataset.ownerTable;
      if(!['monarch','initiative'].includes(key))return;
      mutate(()=>{state[key]=state[key]===ownerIndex?null:ownerIndex});
      syncOwnerPanel(ownerIndex);
      syncOwnerBadges();
    }
  });

  const title=commanderDetail.querySelector('#commanderDetailTitle');
  if(title)title.textContent='統率者ダメージ';
  syncOwnerBadges();
})();
