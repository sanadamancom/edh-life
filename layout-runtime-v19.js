(()=>{
  const root=document.documentElement;
  const DESIGN_W=844,BOARD_H=390,BASE_GAME_W=740;
  const probe=document.createElement('div');
  Object.assign(probe.style,{position:'fixed',visibility:'hidden',pointerEvents:'none',top:'env(safe-area-inset-top, 0px)',right:'env(safe-area-inset-right, 0px)',bottom:'env(safe-area-inset-bottom, 0px)',left:'env(safe-area-inset-left, 0px)',width:'0',height:'0'});
  document.body.appendChild(probe);
  const px=v=>{const n=parseFloat(v);return Number.isFinite(n)?Math.max(0,n):0};
  function viewport(){
    const v=window.visualViewport;
    return v?{w:Math.max(1,Math.round(v.width)),h:Math.max(1,Math.round(v.height)),x:Math.round(v.offsetLeft||0),y:Math.round(v.offsetTop||0)}:{w:Math.max(1,window.innerWidth||1),h:Math.max(1,window.innerHeight||1),x:0,y:0};
  }
  function safe(){const s=getComputedStyle(probe);return{top:px(s.top),right:px(s.right),bottom:px(s.bottom),left:px(s.left)}}
  function apply(){
    const p=viewport(),s=safe(),rotated=p.h>p.w;
    const short=Math.min(p.w,p.h),long=Math.max(p.w,p.h);
    const scale=short/BOARD_H;
    const boardW=Math.min(DESIGN_W,long/Math.max(scale,.001));
    const longStart=rotated?s.top:s.left,longEnd=rotated?s.bottom:s.right;
    const minGutter=boardW<650?40:52;
    const safeGutter=Math.ceil(Math.max(longStart,longEnd)/Math.max(scale,.001))+4;
    const gutter=Math.min(Math.max(minGutter,boardW*.14),Math.max(minGutter,safeGutter));
    const gameW=Math.max(1,boardW-gutter*2);
    const ui=Math.max(.48,Math.min(1,gameW/BASE_GAME_W));
    const tool=Math.max(.68,ui);
    const cx=p.x+p.w/2,cy=p.y+p.h/2;
    root.style.setProperty('--board-w',boardW.toFixed(3)+'px');
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',cx+'px');
    root.style.setProperty('--board-top',cy+'px');
    root.style.setProperty('--gutter-w',gutter.toFixed(3)+'px');
    root.style.setProperty('--ui-scale',ui.toFixed(4));
    root.style.setProperty('--tool-scale',tool.toFixed(4));
    root.style.setProperty('--tool-size',(42*tool).toFixed(3)+'px');
    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);
    root.classList.toggle('stage-compact',ui<.82);
    root.classList.toggle('stage-narrow',ui<.66);
    window.EDHStage={state:{...p,safe:s,rotated,boardW,boardH:BOARD_H,scale,gutter,gameW,uiScale:ui,toolScale:tool},update:apply};
  }
  window.addEventListener('resize',apply,{passive:true});
  if(window.visualViewport){window.visualViewport.addEventListener('resize',apply,{passive:true});window.visualViewport.addEventListener('scroll',apply,{passive:true})}
  window.addEventListener('orientationchange',()=>{setTimeout(apply,80);setTimeout(apply,300);setTimeout(apply,650)},{passive:true});
  window.addEventListener('pageshow',()=>{apply();setTimeout(apply,180)});
  apply();
})();