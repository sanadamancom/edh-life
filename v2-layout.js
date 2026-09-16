(()=>{
  const head=document.head;
  if(!head)return;

  /* Layout geometry is CSS-only in v2.
     The board is always the real 100dvh viewport, with the utility band centered
     on 50%. Safe areas are handled only as inner player-content padding. */
  function resetStageGeometry(){
    const root=document.documentElement;
    const stage=document.getElementById('stage');
    root?.style.removeProperty('--stage-full-height');
    if(stage){
      stage.style.removeProperty('top');
      delete stage.dataset.stageHeight;
      delete stage.dataset.viewportHeight;
      delete stage.dataset.safeTop;
      delete stage.dataset.stageOriginCorrection;
    }
  }

  function syncBottomBackdrop(){
    const app=document.getElementById('app');
    const stage=document.getElementById('stage');
    if(!app)return;

    const players=[...app.querySelectorAll('.p:not(.hide)')];
    let bottom=[];
    if(app.classList.contains('c4'))bottom=[players[2],players[3]];
    else if(app.classList.contains('c3'))bottom=[players[1],players[2]];
    else if(app.classList.contains('c2'))bottom=[players[1]];

    const colorOf=player=>{
      if(!player)return '';
      return player.style.getPropertyValue('--pc').trim()||
        getComputedStyle(player).getPropertyValue('--pc').trim();
    };

    const colors=bottom.map(colorOf).filter(Boolean);
    if(!colors.length)return;
    const background=colors.length===1
      ?colors[0]
      :`linear-gradient(90deg,${colors[0]} 0 50%,${colors[1]} 50% 100%)`;

    document.documentElement.style.background=background;
    document.body.style.background=background;
    if(stage)stage.style.background=background;
  }

  function retireTableStateUi(){
    document.getElementById('tableStateHub')?.remove();
    document.getElementById('unifiedTableStateHub')?.remove();
    document.getElementById('tableStateSettingRow')?.remove();
    document.querySelectorAll('.table-state-pick-target,.table-state-pick-current,.state-pick-target,.state-pick-current')
      .forEach(element=>element.classList.remove('table-state-pick-target','table-state-pick-current','state-pick-target','state-pick-current'));
    const tableHelp=[...document.querySelectorAll('#helpOverlay .helpCard')]
      .find(card=>card.querySelector('h3')?.textContent.trim()==='卓上状態');
    tableHelp?.remove();
    window.__edhTableStatePickActive=()=>false;
  }

  function syncVisualFrame(){
    resetStageGeometry();
    syncBottomBackdrop();
  }

  syncVisualFrame();
  window.addEventListener('orientationchange',syncVisualFrame,{passive:true});
  window.addEventListener('pageshow',syncVisualFrame,{passive:true});

  const app=document.getElementById('app');
  if(app){
    let backdropTimer=0;
    new MutationObserver(()=>{
      clearTimeout(backdropTimer);
      backdropTimer=setTimeout(syncBottomBackdrop,0);
    }).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  }

  if(!document.querySelector('link[data-v2-compact]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./v2-compact.css?v=13';
    link.dataset.v2Compact='1';
    head.appendChild(link);
  }

  if(!document.querySelector('link[data-v2-feedback]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./v2-feedback.css?v=1';
    link.dataset.v2Feedback='1';
    head.appendChild(link);
  }

  const loadScript=src=>new Promise((resolve,reject)=>{
    if([...document.scripts].some(script=>script.src.includes(src))){resolve();return}
    const script=document.createElement('script');
    script.src=`./${src}?v=2`;
    script.onload=resolve;
    script.onerror=reject;
    document.body.appendChild(script);
  });

  (async()=>{
    try{
      retireTableStateUi();
      await loadScript('v2-compact-interactions.js');
      syncBottomBackdrop();
      window.addEventListener('edh-v2-layout',()=>{
        syncVisualFrame();
        retireTableStateUi();
      });
    }catch(error){
      console.error('Failed to load v2 compact layer',error);
    }
  })();
})();
