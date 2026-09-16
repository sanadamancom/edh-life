(()=>{
  const head=document.head;
  if(!head)return;

  function isInstalledDisplay(){
    return matchMedia('(display-mode: standalone)').matches||
      matchMedia('(display-mode: fullscreen)').matches||
      navigator.standalone===true;
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
    const fullHeight=isInstalledDisplay()&&screenHeight
      ?Math.max(viewportHeight,screenHeight)
      :viewportHeight;

    root.style.setProperty('--stage-full-height',`${Math.ceil(fullHeight)}px`);
    stage.dataset.stageHeight=String(Math.ceil(fullHeight));
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
    link.href='./v2-compact.css?v=5';
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
