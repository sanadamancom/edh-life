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

  syncFullStageHeight();
  window.addEventListener('resize',syncFullStageHeight,{passive:true});
  window.addEventListener('orientationchange',syncFullStageHeight,{passive:true});
  window.addEventListener('pageshow',syncFullStageHeight,{passive:true});
  window.visualViewport?.addEventListener('resize',syncFullStageHeight,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncFullStageHeight,{passive:true});

  if(!document.querySelector('link[data-v2-compact]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./v2-compact.css?v=4';
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

  function dockTableStateHub(){
    const tools=document.getElementById('tools');
    const diceWrap=tools?.querySelector('.dw');
    const hub=document.getElementById('unifiedTableStateHub');
    if(!tools||!diceWrap||!hub)return;
    if(hub.parentElement!==tools)diceWrap.after(hub);
    hub.style.removeProperty('left');
    hub.style.removeProperty('top');
  }

  (async()=>{
    try{
      if(!document.getElementById('unifiedTableStateHub'))await loadScript('table-state-hub.js');
      dockTableStateHub();
      await loadScript('v2-compact-interactions.js');
      window.addEventListener('edh-v2-layout',()=>{
        syncFullStageHeight();
        dockTableStateHub();
      });
    }catch(error){
      console.error('Failed to load v2 compact layer',error);
    }
  })();
})();
