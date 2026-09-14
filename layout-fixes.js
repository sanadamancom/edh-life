(()=>{
  const root=document.documentElement;
  const BOARD_W=844,BOARD_H=390;
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
    const safeX=p.x+safe.left,safeY=p.y+safe.top;
    const safeW=Math.max(1,p.w-safe.left-safe.right),safeH=Math.max(1,p.h-safe.top-safe.bottom);
    const rotated=p.h>p.w;
    const displayW=rotated?BOARD_H:BOARD_W,displayH=rotated?BOARD_W:BOARD_H;
    const scale=Math.min(safeW/displayW,safeH/displayH);
    const cx=safeX+safeW/2,cy=safeY+safeH/2;
    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',cx+'px');
    root.style.setProperty('--board-top',cy+'px');
    window.EDHStage={state:{...p,safe,safeX,safeY,safeW,safeH,rotated,boardW:BOARD_W,boardH:BOARD_H,scale,cx,cy},update:applyBoard};
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