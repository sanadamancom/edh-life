(()=>{
  const head=document.head;
  if(!head)return;

  function isInstalledDisplay(){
    return matchMedia('(display-mode: standalone)').matches||
      matchMedia('(display-mode: fullscreen)').matches||
      navigator.standalone===true;
  }

  function readSafeTop(){
    const fromLayout=Number(window.EDHStage?.state?.safe?.top)||0;
    if(fromLayout>0)return fromLayout;
    const probe=document.createElement('div');
    probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px)';
    document.body.appendChild(probe);
    const value=parseFloat(getComputedStyle(probe).paddingTop)||0;
    probe.remove();
    return value;
  }

  function syncFullStageHeight(){
    const root=document.documentElement;
    const stage=document.getElementById('stage');
    if(!root||!stage)return;

    const vv=window.visualViewport;
    const viewportHeight=Math.max(
      document.documentElement.clientHeight||0,
      window.innerHeight||0,
      vv?(vv.height+Math.max(0,vv.offsetTop||0)):0
    );
    const screenHeight=Number(window.screen?.height)||0;
    const safeTop=readSafeTop();

    let fullHeight=isInstalledDisplay()&&screenHeight
      ?Math.max(viewportHeight,screenHeight)
      :viewportHeight;

    /* iOS standalone with black-translucent status bar can report the CSS viewport
       shorter than the screenshot/physical display by exactly safe-area-inset-top.
       Android standalone keeps the normal viewport/screen calculation above. */
    if(navigator.standalone===true&&safeTop>0){
      fullHeight=Math.max(fullHeight,viewportHeight+safeTop);
    }

    const measured=Math.ceil(fullHeight);
    root.style.setProperty('--stage-full-height',`${measured}px`);
    stage.dataset.stageHeight=String(measured);
    stage.dataset.viewportHeight=String(Math.ceil(viewportHeight));
    stage.dataset.safeTop=String(Math.ceil(safeTop));
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

  syncFullStageHeight();
  window.addEventListener('resize',syncFullStageHeight,{passive:true});
  window.addEventListener('orientationchange',syncFullStageHeight,{passive:true});
  window.addEventListener('pageshow',syncFullStageHeight,{passive:true});
  window.visualViewport?.addEventListener('resize',syncFullStageHeight,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncFullStageHeight,{passive:true});

  if(!document.querySelector('link[data-v2-compact]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./v2-compact.css?v=6';
    link.dataset.v2Compact='1';
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
      window.addEventListener('edh-v2-layout',()=>{
        syncFullStageHeight();
        retireTableStateUi();
      });
    }catch(error){
      console.error('Failed to load v2 compact layer',error);
    }
  })();
})();
