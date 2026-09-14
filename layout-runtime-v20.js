(()=>{
  const root=document.documentElement;
  const DESIGN_W=844,BOARD_H=390,BASE_GAME_W=740;
  const ids=['app','tools','dl','settings'];

  let stage=document.getElementById('stage');
  if(!stage){
    stage=document.createElement('div');
    stage.id='stage';
    const first=document.getElementById('app');
    first.parentNode.insertBefore(stage,first);
    ids.forEach(id=>{const el=document.getElementById(id);if(el)stage.appendChild(el)});
  }

  const probe=document.createElement('div');
  Object.assign(probe.style,{
    position:'fixed',visibility:'hidden',pointerEvents:'none',
    top:'env(safe-area-inset-top, 0px)',right:'env(safe-area-inset-right, 0px)',
    bottom:'env(safe-area-inset-bottom, 0px)',left:'env(safe-area-inset-left, 0px)',
    width:'0',height:'0'
  });
  document.body.appendChild(probe);

  const px=v=>{const n=parseFloat(v);return Number.isFinite(n)?Math.max(0,n):0};
  function viewport(){
    const de=document.documentElement;
    const w=Math.max(1,Math.round(window.innerWidth||0),Math.round(de.clientWidth||0));
    const h=Math.max(1,Math.round(window.innerHeight||0),Math.round(de.clientHeight||0));
    return{w,h,x:0,y:0};
  }
  function safe(){
    const s=getComputedStyle(probe);
    return{top:px(s.top),right:px(s.right),bottom:px(s.bottom),left:px(s.left)};
  }

  function apply(){
    const p=viewport(),s=safe(),rotated=p.h>p.w;
    const short=Math.min(p.w,p.h),long=Math.max(p.w,p.h);
    const scale=short/BOARD_H;
    const boardW=Math.min(DESIGN_W,long/Math.max(scale,.001));

    const longStart=rotated?s.top:s.left;
    const longEnd=rotated?s.bottom:s.right;
    const minGutter=boardW<650?40:52;
    const safeGutter=Math.ceil(Math.max(longStart,longEnd)/Math.max(scale,.001))+4;
    const gutterCap=Math.max(minGutter,boardW*.14);
    const gutter=Math.min(gutterCap,Math.max(minGutter,safeGutter));
    const gameW=Math.max(1,boardW-gutter*2);
    const ui=Math.max(.48,Math.min(1,gameW/BASE_GAME_W));
    const tool=Math.max(.68,ui);
    const cx=p.w/2,cy=p.h/2;

    root.style.setProperty('--board-w',boardW.toFixed(3)+'px');
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',cx+'px');
    root.style.setProperty('--board-top',cy+'px');
    root.style.setProperty('--gutter-w',gutter.toFixed(3)+'px');

    /* Keep responsive control sizing local to #stage. app.js still maintains its
       legacy root --ui-scale, but it can no longer make the board pulse on resize. */
    stage.style.setProperty('--ui-scale',ui.toFixed(4));
    stage.style.setProperty('--tool-scale',tool.toFixed(4));
    stage.style.setProperty('--tool-size',(42*tool).toFixed(3)+'px');

    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);
    root.classList.toggle('stage-compact',ui<.82);
    root.classList.toggle('stage-narrow',ui<.66);

    window.EDHStage={state:{...p,safe:s,rotated,boardW,boardH:BOARD_H,scale,gutter,gameW,uiScale:ui,toolScale:tool},update:apply};
  }

  let resizeTimer=0;
  function schedule(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(apply,90);
  }

  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(apply,160);
  },{passive:true});
  window.addEventListener('pageshow',()=>{apply();setTimeout(apply,160)});
  apply();
})();
