(()=>{
  const root=document.documentElement;
  const BOARD_W=844,BOARD_H=390;
  const MIN_GUTTER=52,MIN_PLAY_W=640,GUTTER_PAD=4;
  const ids=['app','tools','dl','settings'];
  let stage=document.getElementById('stage');
  if(!stage){
    stage=document.createElement('div');
    stage.id='stage';
    const first=document.getElementById('app');
    first.parentNode.insertBefore(stage,first);
    ids.forEach(id=>{const el=document.getElementById(id);if(el)stage.appendChild(el)});
  }

  const safeProbe=document.createElement('div');
  safeProbe.style.position='fixed';
  safeProbe.style.visibility='hidden';
  safeProbe.style.pointerEvents='none';
  safeProbe.style.top='env(safe-area-inset-top, 0px)';
  safeProbe.style.right='env(safe-area-inset-right, 0px)';
  safeProbe.style.bottom='env(safe-area-inset-bottom, 0px)';
  safeProbe.style.left='env(safe-area-inset-left, 0px)';
  safeProbe.style.width='0';
  safeProbe.style.height='0';
  document.body.appendChild(safeProbe);

  let raf=0;
  function viewport(){
    const v=window.visualViewport;
    if(v)return{w:Math.max(1,Math.round(v.width)),h:Math.max(1,Math.round(v.height)),x:Math.round(v.offsetLeft||0),y:Math.round(v.offsetTop||0)};
    return{w:Math.max(1,Math.round(window.innerWidth||document.documentElement.clientWidth||1)),h:Math.max(1,Math.round(window.innerHeight||document.documentElement.clientHeight||1)),x:0,y:0};
  }
  function toPx(v){const n=parseFloat(v);return Number.isFinite(n)?Math.max(0,n):0}
  function safeInsets(){
    const s=getComputedStyle(safeProbe);
    return{top:toPx(s.top),right:toPx(s.right),bottom:toPx(s.bottom),left:toPx(s.left)};
  }
  function physicalShortSide(p){
    const sw=Number(window.screen?.width)||0;
    const sh=Number(window.screen?.height)||0;
    if(sw>0&&sh>0)return Math.min(sw,sh);
    return Math.min(p.w,p.h);
  }
  function fitLives(){
    const lives=[...document.querySelectorAll('#app .p:not(.hide) .life')];
    lives.forEach(el=>el.style.setProperty('--life-fit','1'));
    requestAnimationFrame(()=>{
      lives.forEach(el=>{
        const available=Math.max(1,el.clientWidth*.94),needed=Math.max(1,el.scrollWidth);
        if(needed>available)el.style.setProperty('--life-fit',Math.max(.5,Math.min(1,available/needed)).toFixed(3));
      });
    });
  }
  function settleLayout(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>requestAnimationFrame(fitLives))}
  function applyBoard(){
    const p=viewport();
    const safe=safeInsets();
    const rotated=p.h>p.w;

    /* Prefer the device short side so phone portrait/landscape keep the same size.
       Only reduce that scale when the completed 844px long edge would not fit inside
       the currently visible long side (tablets, split-screen, browser chrome, etc.). */
    const shortSide=physicalShortSide(p);
    const visibleLong=Math.max(p.w,p.h);
    const shortScale=shortSide/BOARD_H;
    const longFitScale=visibleLong/BOARD_W;
    const scale=Math.min(shortScale,longFitScale);
    const cx=p.x+p.w/2,cy=p.y+p.h/2;

    const longStart=rotated?safe.top:safe.left;
    const longEnd=rotated?safe.bottom:safe.right;
    const maxGutter=(BOARD_W-MIN_PLAY_W)/2;
    const gutter=Math.min(maxGutter,Math.max(MIN_GUTTER,Math.ceil(Math.max(longStart,longEnd)/Math.max(scale,.001))+GUTTER_PAD));

    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',cx+'px');
    root.style.setProperty('--board-top',cy+'px');
    root.style.setProperty('--gutter-w',gutter+'px');
    window.EDHStage={state:{...p,safe,rotated,boardW:BOARD_W,boardH:BOARD_H,shortSide,visibleLong,shortScale,longFitScale,scale,cx,cy,gutter},update:applyBoard};
    settleLayout();
  }
  const app=document.getElementById('app');
  if(app)new MutationObserver(settleLayout).observe(app,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',applyBoard,{passive:true});
  window.visualViewport?.addEventListener('resize',applyBoard,{passive:true});
  window.visualViewport?.addEventListener('scroll',applyBoard,{passive:true});
  window.addEventListener('orientationchange',()=>{setTimeout(applyBoard,60);setTimeout(applyBoard,240);setTimeout(applyBoard,600)},{passive:true});
  window.addEventListener('pageshow',()=>{applyBoard();setTimeout(applyBoard,160)});
  document.fonts?.ready?.then(settleLayout).catch(()=>{});
  applyBoard();
})();