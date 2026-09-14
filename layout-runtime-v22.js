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
  const app=document.getElementById('app');
  const viewportProbe=document.createElement('div');
  Object.assign(viewportProbe.style,{position:'fixed',inset:'0',visibility:'hidden',pointerEvents:'none',margin:'0',padding:'0',border:'0'});
  document.body.appendChild(viewportProbe);
  const safeProbe=document.createElement('div');
  Object.assign(safeProbe.style,{position:'fixed',visibility:'hidden',pointerEvents:'none',top:'env(safe-area-inset-top, 0px)',right:'env(safe-area-inset-right, 0px)',bottom:'env(safe-area-inset-bottom, 0px)',left:'env(safe-area-inset-left, 0px)',width:'0',height:'0'});
  document.body.appendChild(safeProbe);
  const px=v=>{const n=parseFloat(v);return Number.isFinite(n)?Math.max(0,n):0};
  function viewport(){
    const r=viewportProbe.getBoundingClientRect();
    const layout={w:Math.max(1,r.width),h:Math.max(1,r.height),x:r.left,y:r.top,source:'fixed'};
    const v=window.visualViewport;
    if(!v)return layout;
    const vv={w:Math.max(1,v.width),h:Math.max(1,v.height),x:Number(v.offsetLeft)||0,y:Number(v.offsetTop)||0,source:'visual'};
    const clipped=Math.abs(vv.x-layout.x)>.5||Math.abs(vv.y-layout.y)>.5||vv.w<layout.w-1||vv.h<layout.h-1;
    return clipped?vv:layout;
  }
  function safe(){const s=getComputedStyle(safeProbe);return{top:px(s.top),right:px(s.right),bottom:px(s.bottom),left:px(s.left)}}
  function playerCount(){if(app?.classList.contains('c2'))return 2;if(app?.classList.contains('c3'))return 3;return 4}
  function apply(){
    const p=viewport(),s=safe(),rotated=p.h>p.w;
    const short=Math.min(p.w,p.h),long=Math.max(p.w,p.h);
    const scale=short/BOARD_H;
    const boardW=Math.min(DESIGN_W,long/Math.max(scale,.001));
    const longStart=rotated?s.top:s.left,longEnd=rotated?s.bottom:s.right;
    const minGutter=boardW<650?40:52;
    const safeGutter=Math.ceil(Math.max(longStart,longEnd)/Math.max(scale,.001))+4;
    const gutterCap=Math.max(minGutter,boardW*.14);
    const gutter=Math.min(gutterCap,Math.max(minGutter,safeGutter));
    const gameW=Math.max(1,boardW-gutter*2);
    const ui=Math.max(.48,Math.min(1,gameW/BASE_GAME_W));
    const tool=Math.max(.68,ui);
    const count=playerCount();
    const playerW=count===2?gameW:gameW/2;
    const rowW=Math.max(1,playerW*.96);
    const baseLife=96*ui,textWidthFactor=1.55,sideBudget=220;
    const control=Math.max(.38,Math.min(ui,(rowW-baseLife*textWidthFactor)/sideBudget));
    const lifeSlot=Math.max(1,rowW-sideBudget*control);
    const lifeSize=Math.max(22,Math.min(baseLife,lifeSlot/textWidthFactor));
    const cx=p.x+p.w/2,cy=p.y+p.h/2;
    root.style.setProperty('--board-w',boardW.toFixed(3)+'px');
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',cx.toFixed(3)+'px');
    root.style.setProperty('--board-top',cy.toFixed(3)+'px');
    root.style.setProperty('--gutter-w',gutter.toFixed(3)+'px');
    stage.style.setProperty('--ui-scale',ui.toFixed(4));
    stage.style.setProperty('--control-scale',control.toFixed(4));
    stage.style.setProperty('--life-size',lifeSize.toFixed(3)+'px');
    stage.style.setProperty('--tool-scale',tool.toFixed(4));
    stage.style.setProperty('--tool-size',(42*tool).toFixed(3)+'px');
    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);
    root.classList.toggle('stage-compact',ui<.82);
    root.classList.toggle('stage-narrow',ui<.66);
    window.EDHStage={state:{...p,safe:s,rotated,boardW,boardH:BOARD_H,scale,gutter,gameW,playerW,rowW,uiScale:ui,controlScale:control,lifeSlot,lifeSize,toolScale:tool},update:apply};
  }
  let resizeTimer=0;
  function schedule(delay=90){clearTimeout(resizeTimer);resizeTimer=setTimeout(apply,delay)}
  window.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>schedule(30),{passive:true});
  window.addEventListener('orientationchange',()=>schedule(160),{passive:true});
  window.addEventListener('pageshow',()=>{apply();schedule(160);setTimeout(apply,420)});
  if(app)new MutationObserver(()=>schedule(0)).observe(app,{attributes:true,attributeFilter:['class']});
  apply();
})();
