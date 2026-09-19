(()=>{
  const root=document.documentElement;
  const stage=document.getElementById('stage');
  const app=document.getElementById('app');
  if(!root||!stage||!app)return;

  let lastSignature='';
  let frame=0;
  let portraitMetrics=null;
  let geometryFrozen=false;
  let forceMeasure=false;

  const standalone=()=>
    matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;

  const isLandscape=()=>matchMedia('(orientation: landscape)').matches;

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

  function visibleViewport(){
    const vv=window.visualViewport;
    const width=Math.max(
      1,
      Number(vv?.width)||0,
      Number(window.innerWidth)||0,
      Number(document.documentElement.clientWidth)||0
    );
    const height=Math.max(
      1,
      Number(vv?.height)||0,
      Number(window.innerHeight)||0,
      Number(document.documentElement.clientHeight)||0
    );
    return {width,height};
  }

  function fullBoardHeight(width,visibleHeight,safe){
    const isFullScreen=Boolean(document.fullscreenElement||document.webkitFullscreenElement);
    if(!standalone()&&!isFullScreen)return visibleHeight;

    const sw=Number(window.screen?.width)||0;
    const sh=Number(window.screen?.height)||0;
    const screenMatchesWidth=sw>0&&Math.abs(sw-width)<=4;
    const missing=sh-visibleHeight;
    const recoverLimit=Math.max(96,(safe.top||0)+(safe.bottom||0)+48);

    if(screenMatchesWidth&&missing>0&&missing<=recoverLimit)return sh;

    const edge=Math.max(0,safe.bottom||0);
    const candidate=visibleHeight+edge;
    if(edge>0&&edge<=recoverLimit&&(!sh||candidate<=sh+2))return candidate;

    return visibleHeight;
  }

  function playerCount(){
    if(app.classList.contains('c2'))return 2;
    if(app.classList.contains('c3'))return 3;
    return 4;
  }

  function measurePortrait(){
    const safe=readSafeArea();
    const visible=visibleViewport();
    const boardHeight=fullBoardHeight(visible.width,visible.height,safe);
    return {
      safe,
      visible,
      boardHeight,
      hiddenTail:Math.max(0,boardHeight-visible.height)
    };
  }

  function apply(){
    frame=0;

    /* Landscape is only a blocking warning screen. Never let its swapped or
       transitional visualViewport dimensions overwrite the portrait board. */
    const landscape=isLandscape();
    if(!landscape&&(!geometryFrozen||forceMeasure||!portraitMetrics)){
      portraitMetrics=measurePortrait();
    }
    forceMeasure=false;

    /* If the app was launched in landscape, wait for the first portrait frame
       before creating board geometry. */
    if(!portraitMetrics)return;

    const {safe,visible,boardHeight,hiddenTail}=portraitMetrics;
    const style=getComputedStyle(root);
    const centerBand=Math.max(0,parseFloat(style.getPropertyValue('--center-band-h'))||60);
    const count=playerCount();
    const columns=count===2?1:2;
    const playerWidth=visible.width/columns;
    const playerHeight=Math.max(0,(boardHeight-centerBand)/2);
    const edgeInset=Math.max(safe.top||0,safe.bottom||0,hiddenTail);
    const signature=[
      visible.width,visible.height,boardHeight,hiddenTail,
      safe.top,safe.right,safe.bottom,safe.left,centerBand,count
    ].map(value=>Math.round(Number(value)*100)/100).join('|');

    if(signature===lastSignature)return;
    lastSignature=signature;

    root.style.setProperty('--vh100',`${boardHeight}px`);
    root.style.setProperty('--viewport-visible-h',`${visible.height}px`);
    root.style.setProperty('--viewport-tail',`${hiddenTail}px`);
    root.style.setProperty('--player-panel-h',`${playerHeight}px`);
    root.style.setProperty('--player-panel-w',`${playerWidth}px`);
    root.style.setProperty('--seat-edge-safe',`${edgeInset}px`);
    root.classList.toggle('has-viewport-tail',hiddenTail>.5);
    root.classList.toggle('layout-short',boardHeight<700);
    root.classList.toggle('layout-tablet',Math.min(visible.width,boardHeight)>=600);

    const state={
      w:visible.width,
      h:boardHeight,
      viewportH:visible.height,
      omittedBottomSafe:hiddenTail,
      x:0,
      y:0,
      safe,
      rotated:false,
      portraitV2:true,
      portraitOnly:true,
      boardW:visible.width,
      boardH:boardHeight,
      scale:1,
      gameW:visible.width,
      gameH:boardHeight,
      playerW:playerWidth,
      playerH:playerHeight,
      centerBandH:centerBand,
      standalone:standalone()
    };

    window.EDHStage={state,update:schedule};
    window.dispatchEvent(new CustomEvent('edh-v2-layout',{detail:state}));
  }

  function schedule(){
    if(frame)cancelAnimationFrame(frame);
    frame=requestAnimationFrame(apply);
  }

  function refreshMeasurement(){
    /* Fullscreen is an intentional portrait viewport change, unlike rotation. */
    if(isLandscape())return;
    geometryFrozen=false;
    forceMeasure=true;
    lastSignature='';
    schedule();
    requestAnimationFrame(()=>{
      geometryFrozen=true;
    });
  }

  window.EDHViewportSync=schedule;

  /* During startup WebKit may settle visualViewport/safe-area over a few frames.
     Keep measuring only until the splash declares the board stable. Afterwards,
     resize/orientation events reuse the frozen portrait geometry. */
  const startupResize=()=>schedule();
  window.addEventListener('resize',startupResize,{passive:true});
  window.visualViewport?.addEventListener('resize',startupResize,{passive:true});
  window.visualViewport?.addEventListener('scroll',startupResize,{passive:true});
  window.addEventListener('pageshow',schedule,{passive:true});

  window.addEventListener('edh-app-ready',()=>{
    if(portraitMetrics)geometryFrozen=true;
  },{once:true});

  document.addEventListener('fullscreenchange',refreshMeasurement);
  document.addEventListener('webkitfullscreenchange',refreshMeasurement);

  /* Count changes still recompute player widths from the frozen portrait frame. */
  new MutationObserver(schedule).observe(app,{attributes:true,attributeFilter:['class']});

  apply();
})();
