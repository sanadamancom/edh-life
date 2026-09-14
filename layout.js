(()=>{
  const root=document.documentElement;
  const stage=document.getElementById('stage');
  const app=document.getElementById('app');

  const DESIGN_W=844;
  const BOARD_H=390;
  const BASE_GAME_W=740;

  const viewportProbe=document.createElement('div');
  Object.assign(viewportProbe.style,{
    position:'fixed',
    inset:'0',
    visibility:'hidden',
    pointerEvents:'none',
    margin:'0',
    padding:'0',
    border:'0'
  });
  document.body.appendChild(viewportProbe);

  const safeProbe=document.createElement('div');
  Object.assign(safeProbe.style,{
    position:'fixed',
    visibility:'hidden',
    pointerEvents:'none',
    paddingTop:'env(safe-area-inset-top, 0px)',
    paddingRight:'env(safe-area-inset-right, 0px)',
    paddingBottom:'env(safe-area-inset-bottom, 0px)',
    paddingLeft:'env(safe-area-inset-left, 0px)'
  });
  document.body.appendChild(safeProbe);

  const px=value=>{
    const number=parseFloat(value);
    return Number.isFinite(number)?Math.max(0,number):0;
  };

  function getLayoutViewport(){
    const rect=viewportProbe.getBoundingClientRect();
    return {
      w:Math.max(1,rect.width),
      h:Math.max(1,rect.height),
      x:rect.left,
      y:rect.top
    };
  }

  function getVisibleViewport(){
    const layout=getLayoutViewport();
    const visual=window.visualViewport;
    if(!visual)return layout;

    const visible={
      w:Math.max(1,visual.width),
      h:Math.max(1,visual.height),
      x:Number(visual.offsetLeft)||0,
      y:Number(visual.offsetTop)||0
    };

    const clipped=
      Math.abs(visible.x-layout.x)>.5||
      Math.abs(visible.y-layout.y)>.5||
      visible.w<layout.w-1||
      visible.h<layout.h-1;

    return clipped?visible:layout;
  }

  function getSafeInsets(){
    const style=getComputedStyle(safeProbe);
    return {
      top:px(style.paddingTop),
      right:px(style.paddingRight),
      bottom:px(style.paddingBottom),
      left:px(style.paddingLeft)
    };
  }

  function isPortraitLayout(){
    const layout=getLayoutViewport();
    return layout.h>layout.w;
  }

  function getPlayerCount(){
    if(app.classList.contains('c2'))return 2;
    if(app.classList.contains('c3'))return 3;
    return 4;
  }

  function applyLayout(){
    const viewport=getVisibleViewport();
    const safe=getSafeInsets();
    const rotated=isPortraitLayout();

    const shortSide=Math.min(viewport.w,viewport.h);
    const longSide=Math.max(viewport.w,viewport.h);
    const scale=shortSide/BOARD_H;
    const boardW=Math.min(DESIGN_W,longSide/Math.max(scale,.001));

    const safeStart=rotated?safe.top:safe.left;
    const safeEnd=rotated?safe.bottom:safe.right;

    const gutterStart=Math.max(
      8,
      Math.ceil(safeStart/Math.max(scale,.001))+4
    );

    const initialEnd=Math.max(
      46,
      Math.ceil(safeEnd/Math.max(scale,.001))+4
    );

    const initialGameW=Math.max(1,boardW-gutterStart-initialEnd);
    const initialUi=Math.max(.48,Math.min(1,initialGameW/BASE_GAME_W));
    const initialTool=Math.max(.68,initialUi);
    const minimumToolRail=42*initialTool+8;

    const gutterEnd=Math.max(initialEnd,minimumToolRail);
    const gameW=Math.max(1,boardW-gutterStart-gutterEnd);
    const uiScale=Math.max(.48,Math.min(1,gameW/BASE_GAME_W));
    const toolScale=Math.max(.68,uiScale);
    const toolSize=42*toolScale;

    const playerCount=getPlayerCount();
    const playerW=playerCount===2?gameW:gameW/2;
    const rowW=Math.max(1,playerW*.96);
    const baseLife=96*uiScale;
    const textWidthFactor=1.55;
    const sideBudget=220;
    const controlScale=Math.max(
      .38,
      Math.min(uiScale,(rowW-baseLife*textWidthFactor)/sideBudget)
    );
    const lifeSlot=Math.max(1,rowW-sideBudget*controlScale);
    const lifeSize=Math.max(22,Math.min(baseLife,lifeSlot/textWidthFactor));

    const centerX=viewport.x+viewport.w/2;
    const centerY=viewport.y+viewport.h/2;

    root.style.setProperty('--board-w',`${boardW.toFixed(3)}px`);
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',`${centerX.toFixed(3)}px`);
    root.style.setProperty('--board-top',`${centerY.toFixed(3)}px`);
    root.style.setProperty('--gutter-start',`${gutterStart.toFixed(3)}px`);
    root.style.setProperty('--gutter-end',`${gutterEnd.toFixed(3)}px`);

    stage.style.setProperty('--ui-scale',uiScale.toFixed(4));
    stage.style.setProperty('--control-scale',controlScale.toFixed(4));
    stage.style.setProperty('--life-size',`${lifeSize.toFixed(3)}px`);
    stage.style.setProperty('--tool-scale',toolScale.toFixed(4));
    stage.style.setProperty('--tool-size',`${toolSize.toFixed(3)}px`);

    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);

    window.EDHStage={
      state:{
        ...viewport,
        safe,
        rotated,
        boardW,
        boardH:BOARD_H,
        scale,
        gutterStart,
        gutterEnd,
        gameW,
        playerW,
        rowW,
        uiScale,
        controlScale,
        lifeSlot,
        lifeSize,
        toolScale
      },
      update:applyLayout
    };
  }

  let resizeTimer=0;
  function schedule(delay=90){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(applyLayout,delay);
  }

  window.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>schedule(30),{passive:true});
  window.addEventListener('orientationchange',()=>schedule(160),{passive:true});
  window.addEventListener('pageshow',()=>{
    applyLayout();
    schedule(160);
    setTimeout(applyLayout,420);
  });

  new MutationObserver(()=>schedule(0)).observe(app,{
    attributes:true,
    attributeFilter:['class']
  });

  applyLayout();
})();
