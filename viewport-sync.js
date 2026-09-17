(()=>{
  const root=document.documentElement;
  const stage=document.getElementById('stage');
  const app=document.getElementById('app');
  if(!root||!stage||!app)return;

  let applying=false;

  function readSafeArea(){
    const probe=document.createElement('div');
    probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(probe);
    const style=getComputedStyle(probe);
    const safe={
      top:parseFloat(style.paddingTop)||0,
      right:parseFloat(style.paddingRight)||0,
      bottom:parseFloat(style.paddingBottom)||0,
      left:parseFloat(style.paddingLeft)||0
    };
    probe.remove();
    return safe;
  }

  function measuredViewport(){
    const vv=window.visualViewport;
    return {
      width:Math.max(1,Number(vv?.width)||window.innerWidth||document.documentElement.clientWidth||1),
      height:Math.max(1,Number(vv?.height)||window.innerHeight||document.documentElement.clientHeight||1)
    };
  }

  function sync(){
    if(applying)return;
    applying=true;
    try{
      const {width,height}=measuredViewport();
      const safe=readSafeArea();
      const style=getComputedStyle(root);
      const centerBand=Math.max(0,parseFloat(style.getPropertyValue('--center-band-h'))||60);
      const playerHeight=Math.max(0,(height-centerBand)/2);
      const playerWidth=app.classList.contains('c2')?width:width/2;

      /* visualViewport is the single source of truth for the visible board.
         The board itself uses every visible pixel. Safe areas only reduce the
         inner content area; they never change player-panel geometry. */
      root.style.setProperty('--vh100',`${height}px`);
      root.style.setProperty('--stage-full-height',`${height}px`);
      root.style.setProperty('--safe-fill-gap','0px');
      root.classList.remove('has-omitted-bottom-safe');

      if(window.EDHStage?.state){
        Object.assign(window.EDHStage.state,{
          w:width,
          h:height,
          viewportH:height,
          omittedBottomSafe:0,
          safe,
          boardW:width,
          boardH:height,
          gameW:width,
          gameH:height,
          playerW:playerWidth,
          playerH:playerHeight
        });
      }else{
        window.EDHStage={state:{
          w:width,h:height,viewportH:height,omittedBottomSafe:0,
          x:0,y:0,safe,rotated:false,portraitV2:true,portraitOnly:true,
          boardW:width,boardH:height,scale:1,gameW:width,gameH:height,
          playerW:playerWidth,playerH:playerHeight
        },update:sync};
      }
    }finally{
      applying=false;
    }
  }

  /* layout.js still owns help/setup code and emits edh-v2-layout after its legacy
     viewport pass. Correct geometry immediately afterwards, before the fluid-scale
     listener (loaded later) reads EDHStage. */
  window.addEventListener('edh-v2-layout',sync);
  window.addEventListener('resize',sync,{passive:true});
  window.visualViewport?.addEventListener('resize',sync,{passive:true});
  window.visualViewport?.addEventListener('scroll',sync,{passive:true});
  window.addEventListener('orientationchange',sync,{passive:true});
  window.addEventListener('pageshow',sync,{passive:true});
  document.addEventListener('fullscreenchange',sync);
  new MutationObserver(sync).observe(app,{attributes:true,attributeFilter:['class']});

  window.EDHViewportSync=sync;
  sync();
})();
