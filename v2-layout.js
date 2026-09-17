(()=>{
  const head=document.head;
  if(!head)return;

  /* The board height is owned by layout.js. It represents the full visible table,
     including any bottom safe-area strip omitted from 100dvh. v2.css keeps the
     renderable stage at 100dvh and paints the omitted strip as a continuation of
     the lower seats. */
  function resetStageGeometry(){
    const stage=document.getElementById('stage');
    if(stage){
      stage.style.removeProperty('top');
      delete stage.dataset.stageHeight;
      delete stage.dataset.viewportHeight;
      delete stage.dataset.safeTop;
      delete stage.dataset.stageOriginCorrection;
    }
  }

  function syncBottomBackdrop(){
    const root=document.documentElement;
    const app=document.getElementById('app');
    const stage=document.getElementById('stage');
    if(!app)return;

    const players=[...app.querySelectorAll('.p:not(.hide)')];
    let bottom=[];
    if(app.classList.contains('c4'))bottom=[players[2],players[3]];
    else if(app.classList.contains('c3'))bottom=[players[1],players[2]];
    else if(app.classList.contains('c2'))bottom=[players[1]];

    const backgroundImageOf=player=>{
      if(!player)return 'linear-gradient(var(--bg),var(--bg))';
      const style=getComputedStyle(player);
      const image=(style.backgroundImage||'').trim();
      if(image&&image!=='none')return image;
      const color=(style.backgroundColor||'').trim()||
        player.style.getPropertyValue('--pc').trim()||'#0d0f14';
      return `linear-gradient(${color},${color})`;
    };
    const dimOf=player=>player?.classList.contains('defeated')
      ?'rgba(4,6,9,.24)'
      :'rgba(0,0,0,0)';

    const leftPlayer=bottom[0];
    const rightPlayer=bottom[1]||bottom[0];
    const left=backgroundImageOf(leftPlayer);
    const right=backgroundImageOf(rightPlayer);
    root.style.setProperty('--safe-fill-left-bg',left);
    root.style.setProperty('--safe-fill-right-bg',right);
    root.style.setProperty('--safe-fill-left-dim',dimOf(leftPlayer));
    root.style.setProperty('--safe-fill-right-dim',dimOf(rightPlayer));

    /* Keep the page canvas as a fallback for iOS variants that expose the system
       safe area through the root canvas. The stage pseudo-element is the primary
       renderer and preserves the exact lower-seat gradient continuation. */
    const pageBackground=`${left}, ${right}`;
    const applyPageBackdrop=element=>{
      if(!element)return;
      element.style.backgroundColor=getComputedStyle(root).getPropertyValue('--bg').trim()||'#0d0f14';
      element.style.backgroundImage=pageBackground;
      element.style.backgroundSize='50% 100%,50% 100%';
      element.style.backgroundPosition='left top,right top';
      element.style.backgroundRepeat='no-repeat';
    };
    applyPageBackdrop(root);
    applyPageBackdrop(document.body);
    if(stage)stage.style.background='var(--bg)';
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

  const loadScript=(src,version)=>new Promise((resolve,reject)=>{
    if([...document.scripts].some(script=>script.src.includes(src))){resolve();return}
    const script=document.createElement('script');
    script.src=`./${src}?v=${version}`;
    script.onload=resolve;
    script.onerror=reject;
    document.body.appendChild(script);
  });

  (async()=>{
    try{
      retireTableStateUi();
      await loadScript('v2-fluid-scale.js',9);
      await loadScript('v2-life-stability.js',1);
      await loadScript('v2-compact-interactions.js',4);
      await loadScript('v2-utility-behavior.js',5);
      await loadScript('v2-quick-dice-coin.js',5);
      await loadScript('v2-coin-overlay-fix.js',3);
      await loadScript('v2-commander-owner-settings.js',4);
      await loadScript('v2-counter-sticky-header.js',1);
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