(()=>{
  if(typeof state==='undefined'||typeof render!=='function'||typeof mutate!=='function'||typeof escapeHtml!=='function')return;

  const TAP_MAX_MS=500;
  const app=document.getElementById('app');
  if(!app)return;

  const taxMarkup=(sourcePlayer,slot)=>{
    const tax=sourcePlayer.tax?.[slot]||0;
    return `<span class="cmdTax${tax?'':' empty'}">${tax?`T+${tax}`:''}</span>`;
  };

  commanderCards=function(playerIndex){
    const cards=[];
    for(let source=0;source<state.count;source++){
      if(source===playerIndex)continue;
      const sourcePlayer=state.players[source];
      const first=state.players[playerIndex].cmd[source]||0;
      const second=state.players[playerIndex].cmdB?.[source]||0;

      if(!sourcePlayer.partner){
        cards.push(`
          <div class="cc commanderQuick commanderTap ${first>=18?'hot':''}" data-cmd-card data-cmd-slot="0" data-t="${playerIndex}" data-s="${source}" role="button" tabindex="0" style="--c:${sourcePlayer.color}" title="タップで+1 / 長押しで統率者詳細">
            <div class="cw">${escapeHtml(sourcePlayer.name)}</div>
            <div class="commanderQuickRow">
              <div class="cv">${first}</div>
              ${taxMarkup(sourcePlayer,0)}
            </div>
          </div>`);
        continue;
      }

      cards.push(`
        <div class="cc partnerCc ${(first>=18||second>=18)?'hot':''}" data-cmd-card data-t="${playerIndex}" data-s="${source}" style="--c:${sourcePlayer.color}" title="A/Bをタップで+1 / 長押しでPartner詳細">
          <div class="cw">${escapeHtml(sourcePlayer.name)} · Partner</div>
          <div class="partnerRows">
            <div class="partnerRow commanderTapRow ${first>=18?'hot':''}" data-cmd-slot="0" role="button" tabindex="0" aria-label="Commander A Damageを1増やす">
              <span class="partnerMark">A</span><b>${first}</b>${taxMarkup(sourcePlayer,0)}
            </div>
            <div class="partnerRow commanderTapRow ${second>=18?'hot':''}" data-cmd-slot="1" role="button" tabindex="0" aria-label="Commander B Damageを1増やす">
              <span class="partnerMark">B</span><b>${second}</b>${taxMarkup(sourcePlayer,1)}
            </div>
          </div>
        </div>`);
    }
    return cards.join('');
  };

  function addDamage(target,source,slot){
    if(!state.players[target]||!state.players[source])return;
    if(slot===1&&!state.players[source].partner)return;
    const store=slot===0?state.players[target].cmd:state.players[target].cmdB;
    const current=store[source]||0;
    mutate(()=>{
      store[source]=current+1;
      state.players[target].life-=1;
    });
    navigator.vibrate?.(12);
  }

  let tapSession=null;
  let suppressClickUntil=0;

  function slotFromEvent(card,target){
    const source=Number(card.dataset.s);
    if(!state.players[source]?.partner)return 0;
    const row=target.closest('[data-cmd-slot]');
    return row?Number(row.dataset.cmdSlot):null;
  }

  app.addEventListener('pointerdown',event=>{
    if(!event.isTrusted)return;
    if(window.__edhTableStatePickActive?.())return;
    if(event.pointerType==='mouse'&&event.button!==0)return;
    if(event.target.closest('button'))return;
    const card=event.target.closest('.cc[data-cmd-card]');
    if(!card)return;
    tapSession={
      pointerId:event.pointerId,
      card,
      target:Number(card.dataset.t),
      source:Number(card.dataset.s),
      slot:slotFromEvent(card,event.target),
      x:event.clientX,
      y:event.clientY,
      started:performance.now(),
      moved:false
    };
  },true);

  app.addEventListener('pointermove',event=>{
    if(!event.isTrusted)return;
    if(!tapSession||tapSession.pointerId!==event.pointerId)return;
    if(Math.hypot(event.clientX-tapSession.x,event.clientY-tapSession.y)>12)tapSession.moved=true;
  },true);

  app.addEventListener('pointerup',event=>{
    if(!event.isTrusted)return;
    if(!tapSession||tapSession.pointerId!==event.pointerId)return;
    const session=tapSession;
    tapSession=null;
    const held=performance.now()-session.started;
    const releasedCard=event.target.closest('.cc[data-cmd-card]');
    if(session.moved||held>=TAP_MAX_MS||releasedCard!==session.card||session.slot===null)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClickUntil=performance.now()+400;
    addDamage(session.target,session.source,session.slot);
  },true);

  document.addEventListener('pointercancel',event=>{
    if(!event.isTrusted)return;
    if(tapSession?.pointerId===event.pointerId)tapSession=null;
  },true);

  app.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil&&event.target.closest('.cc[data-cmd-card]')){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const target=event.target.closest('[data-cmd-slot][role="button"]');
    if(!target||event.detail!==0)return;
    const card=target.closest('.cc[data-cmd-card]');
    if(!card)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    addDamage(Number(card.dataset.t),Number(card.dataset.s),Number(target.dataset.cmdSlot));
  },true);

  app.addEventListener('keydown',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    const target=event.target.closest('[data-cmd-slot][role="button"]');
    if(!target)return;
    const card=target.closest('.cc[data-cmd-card]');
    if(!card)return;
    event.preventDefault();
    addDamage(Number(card.dataset.t),Number(card.dataset.s),Number(target.dataset.cmdSlot));
  });

  const helpCards=[...document.querySelectorAll('#helpOverlay .helpCard')];
  const lifeHelp=helpCards.find(card=>card.querySelector('h3')?.textContent==='ライフ');
  if(lifeHelp){
    const paragraphs=lifeHelp.querySelectorAll('p');
    if(paragraphs[1])paragraphs[1].innerHTML='<b>−1 / +1</b>で増減。長押しで連続入力できます。';
  }
  const commanderHelp=helpCards.find(card=>card.querySelector('h3')?.textContent==='統率者ダメージ');
  if(commanderHelp){
    const paragraphs=commanderHelp.querySelectorAll('p');
    if(paragraphs[1])paragraphs[1].innerHTML='カードを<b>タップで+1</b>。減算は長押し詳細から編集します。';
  }

  render();
})();
