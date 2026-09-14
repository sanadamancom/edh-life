(()=>{
  const root=document.documentElement;
  const BOARD_W=844, BOARD_H=390;
  const ids=['app','tools','dl','settings'];
  let stage=document.getElementById('stage');
  if(!stage){
    stage=document.createElement('div');
    stage.id='stage';
    const first=document.getElementById('app');
    first.parentNode.insertBefore(stage,first);
    ids.forEach(id=>{const el=document.getElementById(id);if(el)stage.appendChild(el)});
  }

  let raf=0;
  function viewport(){
    const v=window.visualViewport;
    if(v)return {w:Math.max(1,Math.round(v.width)),h:Math.max(1,Math.round(v.height)),x:Math.round(v.offsetLeft||0),y:Math.round(v.offsetTop||0)};
    return {w:Math.max(1,Math.round(window.innerWidth||document.documentElement.clientWidth||1)),h:Math.max(1,Math.round(window.innerHeight||document.documentElement.clientHeight||1)),x:0,y:0};
  }

  function fitLives(){
    const lives=[...document.querySelectorAll('#app .p:not(.hide) .life')];
    lives.forEach(el=>el.style.setProperty('--life-fit','1'));
    requestAnimationFrame(()=>{
      lives.forEach(el=>{
        const available=Math.max(1,el.clientWidth*.94), needed=Math.max(1,el.scrollWidth);
        if(needed>available)el.style.setProperty('--life-fit',Math.max(.5,Math.min(1,available/needed)).toFixed(3));
      });
    });
  }

  function settleLayout(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>requestAnimationFrame(fitLives));
  }

  function applyBoard(){
    const p=viewport();
    const rotated=p.h>p.w;
    const displayW=rotated?BOARD_H:BOARD_W;
    const displayH=rotated?BOARD_W:BOARD_H;
    const scale=Math.min(p.w/displayW,p.h/displayH);
    const cx=p.x+p.w/2, cy=p.y+p.h/2;

    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',cx+'px');
    root.style.setProperty('--board-top',cy+'px');
    window.EDHStage={state:{...p,rotated,boardW:BOARD_W,boardH:BOARD_H,scale,cx,cy},update:applyBoard};
    settleLayout();
  }

  const app=document.getElementById('app');
  if(app)new MutationObserver(settleLayout).observe(app,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',applyBoard,{passive:true});
  window.visualViewport?.addEventListener('resize',applyBoard,{passive:true});
  window.addEventListener('orientationchange',()=>{setTimeout(applyBoard,60);setTimeout(applyBoard,240)},{passive:true});
  window.addEventListener('pageshow',()=>{applyBoard();setTimeout(applyBoard,160)});
  document.fonts?.ready?.then(settleLayout).catch(()=>{});
  applyBoard();
})();
