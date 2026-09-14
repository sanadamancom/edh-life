(()=>{
  const root=document.documentElement;
  const DESIGN_W=844,BOARD_H=390;
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
  function safeInsets(){const s=getComputedStyle(safeProbe);return{top:toPx(s.top),right:toPx(s.right),bottom:toPx(s.bottom),left:toPx(s.left)}}
  function physicalShortSide(p){
    const sw=Number(window.screen&&window.screen.width)||0;
    const sh=Number(window.screen&&window.screen.height)||0;
    return sw>0&&sh>0?Math.min(sw,sh):Math.min(p.w,p.h);
  }
  function fitLives(){
    const lives=[...document.querySelectorAll('#app .p:not(.hide) .life')];
    lives.forEach(el=>el.style.setProperty('--life-fit','1'));
    requestAnimationFrame(()=>lives.forEach(el=>{
      const available=Math.max(1,el.clientWidth*.94),needed=Math.max(1,el.scrollWidth);
      if(needed>available)el.style.setProperty('--life-fit',Math.max(.46,Math.min(1,available/needed)).toFixed(3));
    }));
  }
  function settleLayout(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>requestAnimationFrame(fitLives))}
  function applyBoard(){
    const p=viewport();
    const safe=safeInsets();
    const rotated=p.h>p.w;
    const shortSide=physicalShortSide(p);
    const scale=shortSide/BOARD_H;
    const visibleLong=Math.max(p.w,p.h);
    const logicalLong=Math.min(DESIGN_W,visibleLong/Math.max(scale,.001));
    const cx=p.x+p.w/2,cy=p.y+p.h/2;
    const longStart=rotated?safe.top:safe.left;
    const longEnd=rotated?safe.bottom:safe.right;
    const compact=logicalLong<700;
    const narrow=logicalLong<570;
    const minGutter=compact?44:52;
    const safeGutter=Math.ceil(Math.max(longStart,longEnd)/Math.max(scale,.001))+4;
    const maxGutter=Math.max(minGutter,logicalLong*.12);
    const gutter=Math.min(maxGutter,Math.max(minGutter,safeGutter));
    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);
    root.classList.toggle('stage-compact',compact);
    root.classList.toggle('stage-narrow',narrow);
    root.style.setProperty('--board-w',logicalLong.toFixed(3)+'px');
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',cx+'px');
    root.style.setProperty('--board-top',cy+'px');
    root.style.setProperty('--gutter-w',gutter.toFixed(3)+'px');
    window.EDHStage={state:{...p,safe,rotated,designW:DESIGN_W,boardW:logicalLong,boardH:BOARD_H,shortSide,visibleLong,scale,cx,cy,gutter,compact,narrow},update:applyBoard};
    settleLayout();
  }
  const app=document.getElementById('app');
  if(app)new MutationObserver(settleLayout).observe(app,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',applyBoard,{passive:true});
  if(window.visualViewport){window.visualViewport.addEventListener('resize',applyBoard,{passive:true});window.visualViewport.addEventListener('scroll',applyBoard,{passive:true})}
  window.addEventListener('orientationchange',()=>{setTimeout(applyBoard,60);setTimeout(applyBoard,240);setTimeout(applyBoard,600)},{passive:true});
  window.addEventListener('pageshow',()=>{applyBoard();setTimeout(applyBoard,160)});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(settleLayout).catch(()=>{});
  applyBoard();
})();