(()=>{
  const root=document.documentElement;
  const stage=document.getElementById('stage');

  const style=document.createElement('style');
  style.textContent=`
    /* v2 full-bleed board: player backgrounds reach the screen edges. */
    html.v2-portrait #app,
    html.v2-portrait .diceLayer{
      inset:0!important;
    }

    /* Top-side players are rotated 180deg, so pre-rotation bottom padding becomes visual top padding. */
    html.v2-portrait #app.c4 .p:nth-child(1) .pc,
    html.v2-portrait #app.c4 .p:nth-child(2) .pc,
    html.v2-portrait #app.c3 .p:nth-child(1) .pc,
    html.v2-portrait #app.c2 .p:nth-child(1) .pc{
      padding-bottom:calc(var(--v2-panel-pad) + var(--v2-safe-top))!important;
    }

    /* Keep bottom-player controls clear of the floating toolbar/home indicator without reserving a black band. */
    html.v2-portrait #app.c4 .p:nth-child(3) .pc,
    html.v2-portrait #app.c4 .p:nth-child(4) .pc,
    html.v2-portrait #app.c3 .p:nth-child(2) .pc,
    html.v2-portrait #app.c3 .p:nth-child(3) .pc,
    html.v2-portrait #app.c2 .p:nth-child(2) .pc{
      padding-bottom:calc(var(--v2-panel-pad) + var(--v2-safe-bottom) + var(--tool-size) + 12px)!important;
    }

    /* Keep the floating tool rail inside the home-indicator safe area. */
    html.v2-portrait #tools{
      bottom:calc(var(--v2-safe-bottom) + 5px)!important;
    }
  `;
  document.head.appendChild(style);

  /*
   * iOS standalone can expose a smaller visualViewport even with viewport-fit=cover.
   * The board must use the full device/layout viewport; safe-area insets are only for controls.
   */
  let raf=0;
  let writing=false;

  function fullViewport(){
    const standalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
    const doc=document.documentElement;
    const layoutW=Math.max(1,doc.clientWidth||window.innerWidth||0);
    const layoutH=Math.max(1,doc.clientHeight||window.innerHeight||0);
    if(!standalone)return {w:layoutW,h:layoutH};

    const screenW=Math.max(1,window.screen?.width||layoutW);
    const screenH=Math.max(1,window.screen?.height||layoutH);
    const portrait=screenH>=screenW;
    const w=portrait?Math.min(screenW,screenH):Math.max(screenW,screenH);
    const h=portrait?Math.max(screenW,screenH):Math.min(screenW,screenH);
    return {w:Math.max(layoutW,w),h:Math.max(layoutH,h)};
  }

  function setVar(name,value){
    if(root.style.getPropertyValue(name)!==value)root.style.setProperty(name,value);
  }

  function applyFullViewport(){
    if(writing||!stage)return;
    writing=true;
    const {w,h}=fullViewport();
    setVar('--board-w',`${w.toFixed(3)}px`);
    setVar('--board-h',`${h.toFixed(3)}px`);
    setVar('--board-left',`${(w/2).toFixed(3)}px`);
    setVar('--board-top',`${(h/2).toFixed(3)}px`);

    if(window.EDHStage?.state){
      Object.assign(window.EDHStage.state,{w,h,x:0,y:0,boardW:w,boardH:h});
    }
    writing=false;
  }

  function schedule(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(applyFullViewport);
  }

  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(schedule,120),{passive:true});
  window.addEventListener('pageshow',schedule,{passive:true});
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});

  new MutationObserver(()=>{
    if(!writing)schedule();
  }).observe(root,{attributes:true,attributeFilter:['style']});

  schedule();
  setTimeout(schedule,180);
  setTimeout(schedule,500);
})();
