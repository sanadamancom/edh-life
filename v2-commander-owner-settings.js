(()=>{
  if(typeof state==='undefined'||typeof mutate!=='function')return;

  const settingsPlayers=document.getElementById('ps');
  const commanderDetail=document.getElementById('commanderDetail');
  if(!settingsPlayers||!commanderDetail)return;

  const style=document.createElement('style');
  style.textContent=`
    #commanderDetail .commanderMode{display:none!important}
    #commanderDetail .commanderStat:has(.commanderTaxValue){display:none!important}
    #commanderDetail .commanderDetailGrid:has(.commanderUnit.hidden){grid-template-columns:1fr!important}

    #settings .ownerCommanderSettings{
      grid-column:1/-1;
      display:grid;
      gap:8px;
      width:100%;
      margin-top:8px;
      padding-top:8px;
      border-top:1px solid rgba(255,255,255,.10)
    }
    #settings .ownerCommanderHead{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
      color:var(--mut);
      font-size:12px;
      font-weight:900
    }
    #settings .ownerCommanderMode{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:6px
    }
    #settings .ownerCommanderMode button,
    #settings .ownerTaxControls button{
      min-height:36px
    }
    #settings .ownerCommanderMode button.active{
      background:rgba(255,255,255,.16);
      box-shadow:inset 0 0 0 2px var(--warn)
    }
    #settings .ownerTaxGrid{
      display:grid;
      grid-template-columns:1fr;
      gap:6px
    }
    #settings .ownerTaxGrid.partner{
      grid-template-columns:1fr 1fr
    }
    #settings .ownerTaxItem{
      display:grid;
      grid-template-columns:auto 1fr;
      gap:6px;
      align-items:center;
      min-width:0
    }
    #settings .ownerTaxLabel{
      color:var(--mut);
      font-size:11px;
      font-weight:900;
      white-space:nowrap
    }
    #settings .ownerTaxControls{
      display:grid;
      grid-template-columns:1fr auto 1fr;
      gap:5px;
      align-items:center
    }
    #settings .ownerTaxValue{
      min-width:32px;
      text-align:center;
      font-size:16px;
      font-weight:900;
      font-variant-numeric:tabular-nums
    }
  `;
  document.head.appendChild(style);

  const clampTax=value=>Math.max(0,Math.trunc(Number(value)||0));

  function ownerMarkup(player,index){
    const partner=Boolean(player.partner);
    const taxA=clampTax(player.tax?.[0]);
    const taxB=clampTax(player.tax?.[1]);
    const taxItem=(slot,label,value)=>`
      <div class="ownerTaxItem">
        <span class="ownerTaxLabel">${label}</span>
        <div class="ownerTaxControls">
          <button type="button" data-owner-tax="-2" data-owner-player="${index}" data-owner-slot="${slot}" aria-label="${label}を2減らす">−2</button>
          <b class="ownerTaxValue">+${value}</b>
          <button type="button" data-owner-tax="2" data-owner-player="${index}" data-owner-slot="${slot}" aria-label="${label}を2増やす">＋2</button>
        </div>
      </div>`;

    return `
      <div class="ownerCommanderHead"><span>統率者設定</span><span>Taxはこのプレイヤーの統率者</span></div>
      <div class="ownerCommanderMode">
        <button type="button" data-owner-mode="single" data-owner-player="${index}" class="${partner?'':'active'}">単一統率者</button>
        <button type="button" data-owner-mode="partner" data-owner-player="${index}" class="${partner?'active':''}">Partner</button>
      </div>
      <div class="ownerTaxGrid ${partner?'partner':''}">
        ${taxItem(0,partner?'Tax A':'Commander Tax',taxA)}
        ${partner?taxItem(1,'Tax B',taxB):''}
      </div>`;
  }

  function syncOwnerSettings(){
    const rows=[...settingsPlayers.querySelectorAll(':scope > .row')];
    rows.forEach((row,index)=>{
      const player=state.players[index];
      if(!player)return;
      let panel=row.querySelector('.ownerCommanderSettings');
      if(!panel){
        panel=document.createElement('div');
        panel.className='ownerCommanderSettings';
        row.appendChild(panel);
      }
      panel.innerHTML=ownerMarkup(player,index);
    });
  }

  function syncDamageDetail(){
    const title=commanderDetail.querySelector('#commanderDetailTitle');
    if(title)title.textContent='統率者ダメージ';
  }

  settingsPlayers.addEventListener('click',event=>{
    const mode=event.target.closest('[data-owner-mode]');
    if(mode){
      event.preventDefault();
      const index=Number(mode.dataset.ownerPlayer);
      const partner=mode.dataset.ownerMode==='partner';
      const player=state.players[index];
      if(!player||Boolean(player.partner)===partner)return;
      mutate(()=>{player.partner=partner});
      return;
    }

    const taxButton=event.target.closest('[data-owner-tax]');
    if(taxButton){
      event.preventDefault();
      const index=Number(taxButton.dataset.ownerPlayer);
      const slot=Number(taxButton.dataset.ownerSlot);
      const delta=Number(taxButton.dataset.ownerTax);
      const player=state.players[index];
      if(!player||![0,1].includes(slot)||!delta)return;
      const current=clampTax(player.tax?.[slot]);
      const next=Math.max(0,current+delta);
      if(next===current)return;
      mutate(()=>{
        if(!Array.isArray(player.tax))player.tax=[0,0];
        player.tax[slot]=next;
      });
    }
  });

  let settingsTimer=0;
  new MutationObserver(()=>{
    clearTimeout(settingsTimer);
    settingsTimer=setTimeout(syncOwnerSettings,0);
  }).observe(settingsPlayers,{childList:true});

  syncOwnerSettings();
  syncDamageDetail();
})();
