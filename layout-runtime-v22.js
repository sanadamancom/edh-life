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
  function stablePortrait(fallback){
    /* Do not use screen.orientation.angle here. On iPad the natural orientation
       can make 0deg mean landscape, which inverted our portrait/landscape mode.
       The fixed layout viewport aspect directly matches how the page is actually
       being displayed and is unaffected by the visualViewport header clipping. */
    const r=viewportProbe.getBoundingClientRect();
    if(r.width>0&&r.height>0)return r.height>r.width;
    return fallback.h>fallback.w;
  }
  function safe(){const s=getComputedStyle(safeProbe);return{top:px(s.top),right:px(s.right),bottom:px(s.bottom),left:px(s.left)}}
  function playerCount(){if(app?.classList.contains('c2'))return 2;if(app?.classList.contains('c3'))return 3;return 4}
  function apply(){
    const p=viewport(),s=safe(),rotated=stablePortrait(p);
    const short=Math.min(p.w,p.h),long=Math.max(p.w,p.h);
    const scale=short/BOARD_H;
    const boardW=Math.min(DESIGN_W,long/Math.max(scale,.001));

    const safeStart=rotated?s.top:s.left;
    const safeEnd=rotated?s.bottom:s.right;
    const startMin=8;
    const endMin=46;
    const gutterStart=Math.max(startMin,Math.ceil(safeStart/Math.max(scale,.001))+4);
    const gutterEnd=Math.max(endMin,Math.ceil(safeEnd/Math.max(scale,.001))+4);
    const gameW=Math.max(1,boardW-gutterStart-gutterEnd);

    const ui=Math.max(.48,Math.min(1,gameW/BASE_GAME_W));
    const tool=Math.max(.68,ui);
    const toolSize=42*tool;
    const minToolRail=toolSize+8;
    const finalGutterEnd=Math.max(gutterEnd,minToolRail);
    const finalGameW=Math.max(1,boardW-gutterStart-finalGutterEnd);
    const finalUi=Math.max(.48,Math.min(1,finalGameW/BASE_GAME_W));
    const finalTool=Math.max(.68,finalUi);
    const finalToolSize=42*finalTool;

    const count=playerCount();
    const playerW=count===2?finalGameW:finalGameW/2;
    const rowW=Math.max(1,playerW*.96);
    const baseLife=96*finalUi,textWidthFactor=1.55,sideBudget=220;
    const control=Math.max(.38,Math.min(finalUi,(rowW-baseLife*textWidthFactor)/sideBudget));
    const lifeSlot=Math.max(1,rowW-sideBudget*control);
    const lifeSize=Math.max(22,Math.min(baseLife,lifeSlot/textWidthFactor));
    const cx=p.x+p.w/2,cy=p.y+p.h/2;

    root.style.setProperty('--board-w',boardW.toFixed(3)+'px');
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',cx.toFixed(3)+'px');
    root.style.setProperty('--board-top',cy.toFixed(3)+'px');
    root.style.setProperty('--gutter-start',gutterStart.toFixed(3)+'px');
    root.style.setProperty('--gutter-end',finalGutterEnd.toFixed(3)+'px');

    stage.style.setProperty('--ui-scale',finalUi.toFixed(4));
    stage.style.setProperty('--control-scale',control.toFixed(4));
    stage.style.setProperty('--life-size',lifeSize.toFixed(3)+'px');
    stage.style.setProperty('--tool-scale',finalTool.toFixed(4));
    stage.style.setProperty('--tool-size',finalToolSize.toFixed(3)+'px');

    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);
    root.classList.toggle('stage-compact',finalUi<.82);
    root.classList.toggle('stage-narrow',finalUi<.66);
    window.EDHStage={state:{...p,safe:s,rotated,boardW,boardH:BOARD_H,scale,gutterStart,gutterEnd:finalGutterEnd,gameW:finalGameW,playerW,rowW,uiScale:finalUi,controlScale:control,lifeSlot,lifeSize,toolScale:finalTool},update:apply};
  }
  let resizeTimer=0;
  function schedule(delay=90){clearTimeout(resizeTimer);resizeTimer=setTimeout(apply,delay)}
  window.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>schedule(30),{passive:true});
  window.addEventListener('orientationchange',()=>schedule(160),{passive:true});
  window.screen?.orientation?.addEventListener?.('change',()=>schedule(160));
  window.addEventListener('pageshow',()=>{apply();schedule(160);setTimeout(apply,420)});
  if(app)new MutationObserver(()=>schedule(0)).observe(app,{attributes:true,attributeFilter:['class']});
  apply();
})();
