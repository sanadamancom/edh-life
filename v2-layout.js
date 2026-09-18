(()=>{
  const head=document.head;
  const root=document.documentElement;
  const app=document.getElementById('app');
  const stage=document.getElementById('stage');
  if(!head||!root||!app)return;

  const bootStarted=performance.now();
  let bootFinished=false;

  function finishBoot(){
    if(bootFinished)return;
    bootFinished=true;
    root.classList.add('edh-ready');
    window.dispatchEvent(new CustomEvent('edh-app-ready'));
  }

  /* Never leave the splash stuck if an optional enhancement fails to load. */
  const bootFallback=setTimeout(finishBoot,1800);

  function revealWhenStable(){
    let previous='';
    let stableFrames=0;
    let attempts=0;

    window.EDHViewportSync?.();

    const sample=()=>{
      if(bootFinished)return;
      attempts++;

      const state=window.EDHStage?.state;
      const style=getComputedStyle(root);
      const signature=state?[
        state.boardW,
        state.boardH,
        state.playerW,
        state.playerH,
        style.getPropertyValue('--center-band-h'),
        style.getPropertyValue('--fluid-life-font'),
        style.getPropertyValue('--tool-size'),
        app.className,
        app.querySelectorAll('.p:not(.hide)').length
      ].map(value=>String(value).trim()).join('|'):'';

      if(signature&&signature===previous)stableFrames++;
      else stableFrames=0;
      previous=signature;

      /* Three identical painted frames allow viewport-sync, fluid typography and
         life-value fitting to finish before the player board becomes visible. */
      if(stableFrames>=3&&performance.now()-bootStarted>=120){
        clearTimeout(bootFallback);
        requestAnimationFrame(()=>requestAnimationFrame(finishBoot));
        return;
      }

      if(attempts<45)requestAnimationFrame(sample);
      else finishBoot();
    };

    requestAnimationFrame(sample);
  }

  function bottomPlayers(){
    const players=[...app.querySelectorAll('.p:not(.hide)')];
    if(app.classList.contains('c4'))return [players[2],players[3]];
    if(app.classList.contains('c3'))return [players[1],players[2]];
    if(app.classList.contains('c2'))return [players[1]];
    return [];
  }

  function backgroundImageOf(player){
    if(!player)return 'linear-gradient(var(--bg),var(--bg))';
    const style=getComputedStyle(player);
    const image=(style.backgroundImage||'').trim();
    if(image&&image!=='none')return image;
    const color=(style.backgroundColor||'').trim()||
      player.style.getPropertyValue('--pc').trim()||'#0d0f14';
    return `linear-gradient(${color},${color})`;
  }

  function syncPageBackdrop(){
    const bottom=bottomPlayers();
    if(!bottom.length)return;
    const left=backgroundImageOf(bottom[0]);
    const right=backgroundImageOf(bottom[1]||bottom[0]);
    const background=`${left}, ${right}`;

    /* WebKit standalone can expose a few bottom pixels through the root canvas
       instead of the DOM viewport. Paint that canvas with the exact lower-player
       backgrounds, sized to one player panel and aligned to the physical bottom. */
    for(const element of [root,document.body]){
      if(!element)continue;
      element.style.backgroundColor=getComputedStyle(root).getPropertyValue('--bg').trim()||'#0d0f14';
      element.style.backgroundImage=background;
      element.style.backgroundSize='50% var(--player-panel-h),50% var(--player-panel-h)';
      element.style.backgroundPosition='left bottom,right bottom';
      element.style.backgroundRepeat='no-repeat';
    }
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

  const loadScript=(src,version)=>new Promise((resolve,reject)=>{
    if([...document.scripts].some(script=>script.src.includes(src))){resolve();return}
    const script=document.createElement('script');
    script.src=`./${src}?v=${version}`;
    script.onload=resolve;
    script.onerror=reject;
    document.body.appendChild(script);
  });

  let backdropTimer=0;
  const scheduleBackdrop=()=>{
    clearTimeout(backdropTimer);
    backdropTimer=setTimeout(syncPageBackdrop,0);
  };

  new MutationObserver(scheduleBackdrop)
    .observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('edh-v2-layout',scheduleBackdrop);
  window.addEventListener('orientationchange',scheduleBackdrop,{passive:true});
  window.addEventListener('pageshow',scheduleBackdrop,{passive:true});

  (async()=>{
    try{
      retireTableStateUi();

      /* Load order is intentional: viewport-sync owns geometry; every later layer
         consumes EDHStage and CSS variables produced by it. */
      await loadScript('viewport-sync.js',2);
      window.EDHViewportSync?.();
      await loadScript('v2-fluid-scale.js',13);
      await loadScript('v2-life-stability.js',1);
      await loadScript('v2-compact-interactions.js',7);
      await loadScript('v2-utility-behavior.js',5);
      await loadScript('v2-quick-dice-coin.js',5);
      await loadScript('v2-coin-overlay-fix.js',3);
      await loadScript('v2-commander-owner-settings.js',6);
      await loadScript('v2-counter-sticky-header.js',2);
      syncPageBackdrop();
      revealWhenStable();
    }catch(error){
      console.error('Failed to load v2 compact layer',error);
      finishBoot();
    }
  })();
})();
