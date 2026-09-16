(()=>{
  if(typeof state==='undefined'||typeof mutate!=='function'||typeof openCounters!=='function')return;

  const commanderDetail=document.getElementById('commanderDetail');
  const counterOverlay=document.getElementById('counters');
  const counterPanel=counterOverlay?.querySelector('.counterPanel');
  const counterGrid=counterPanel?.querySelector('.counterGrid');
  if(!commanderDetail||!counterPanel||!counterGrid)return;

  const style=document.createElement('style');
  style.textContent=`
    #commanderDetail .commanderMode{display:none!important}
    #commanderDetail .commanderStat:has(.commanderTaxValue){display:none!important}
    #commanderDetail .commanderDetailGrid:has(.commanderUnit.hidden){grid-template-columns:1fr!important}

    #counters .ownerCommanderSettings{
      display:grid;
      gap:9px;
      margin-top:12px;
      padding:12px;
      border:1px solid rgba(255,255,255,.10);
      border-radius:14px;
      background:rgba(10,14,20,.72)
    }
    #counters .ownerCommanderHead{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px
    }
    #counters .ownerCommanderTitle{
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
    #counters .ownerCommanderMode button,
    #counters .ownerTaxControls button{
      min-height:40px
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
    #counters .ownerTaxGrid.partner{
      grid-template-columns:1fr 1fr
    }
    #counters .ownerTaxItem{
      display:grid;
      gap:5px;
      min-width:0
    }
    #counters .ownerTaxLabel{
      color:var(--mut);
      font-size:11px;
      font-weight:900;
      text-align:center;
      white-space:nowrap
    }
    #counters .ownerTaxControls{
      display:grid;
      grid-template-columns:1fr auto 1fr;
      gap:6px;
      align-items:center
    }
    #counters .ownerTaxValue{
      min-width:38px;
      text-align:center;
      font-size:18px;
      font-weight:900;
      font-variant-numeric:tabular-nums
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
          <b class="ownerTaxValue">+${value}</b>
          <button type="button" data-owner-tax="2" data-owner-slot="${slot}" aria-label="${label}を2増やす">＋2</button>
        </div>
      </div>`;
  }

  function syncOwnerPanel(index=ownerIndex){
    if(index===null||!state.players[index])return;
    ownerIndex=index;
    const player=state.players[index];
    const partner=Boolean(player.partner);
    const taxA=clampTax(player.tax?.[0]);
    const taxB=clampTax(player.tax?.[1]);

    ownerPanel.innerHTML=`
      <div class="ownerCommanderHead">
        <span class="ownerCommanderTitle">統率者設定</span>
        <span class="ownerCommanderHint">${player.name}</span>
      </div>
      <div class="ownerCommanderMode">
        <button type="button" data-owner-mode="single" class="${partner?'':'active'}">単一統率者</button>
        <button type="button" data-owner-mode="partner" class="${partner?'active':''}">Partner</button>
      </div>
      <div class="ownerTaxGrid ${partner?'partner':''}">
        ${taxItem(0,partner?'Tax A':'Commander Tax',taxA)}
        ${partner?taxItem(1,'Tax B',taxB):''}
      </div>`;
  }

  const baseOpenCounters=openCounters;
  openCounters=function(index){
    baseOpenCounters(index);
    syncOwnerPanel(index);
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
      return;
    }

    const taxButton=event.target.closest('[data-owner-tax]');
    if(!taxButton)return;
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
  });

  const title=commanderDetail.querySelector('#commanderDetailTitle');
  if(title)title.textContent='統率者ダメージ';
})();
