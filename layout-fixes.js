(()=>{
  const root=document.documentElement;
  const ids=['app','tools','dl','settings'];
  let stage=document.getElementById('stage');
  if(!stage){
    stage=document.createElement('div');
    stage.id='stage';
    const first=document.getElementById('app');
    first.parentNode.insertBefore(stage,first);
    ids.forEach(id=>{
      const el=document.getElementById(id);
      if(el)stage.appendChild(el);
    });
  }

  let raf=0;

  function viewport(){
    const de=document.documentElement;
    let w=Math.round(Math.max(de.clientWidth||0,window.innerWidth||0));
    let h=Math.round(Math.max(de.clientHeight||0,window.innerHeight||0));

    /* In iOS standalone mode clientHeight can exclude part of the home-indicator area even
       with viewport-fit=cover. Use the full screen dimensions so portrait and landscape use
       the same physical canvas and therefore the same logical landscape geometry. */
    const standalone=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
    if(standalone&&window.screen){
      const sw=Math.round(window.screen.width||0);
      const sh=Math.round(window.screen.height||0);
      if(sw>0&&sh>0){
        const shortSide=Math.min(sw,sh);
        const longSide=Math.max(sw,sh);
        const portrait=h>=w;
        const fullW=portrait?shortSide:longSide;
        const fullH=portrait?longSide:shortSide;
        w=Math.max(w,fullW);
        h=Math.max(h,fullH);
      }
    }

    return {w,h,x:0,y:0};
  }

  function applyStage(){
    const p=viewport();
    const rotated=p.h>p.w;
    const lw=Math.max(p.w,p.h);
    const lh=Math.min(p.w,p.h);
    const scale=Math.max(.72,Math.min(1.85,Math.min(lw/844,lh/390)));
    const cx=p.x+p.w/2;
    const cy=p.y+p.h/2;

    window.EDHStage={
      state:{...p,rotated,lw,lh,cx,cy,scale},
      update:applyStage
    };

    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);
    root.style.setProperty('--stage-w',lw+'px');
    root.style.setProperty('--stage-h',lh+'px');
    root.style.setProperty('--stage-left',cx+'px');
    root.style.setProperty('--stage-top',cy+'px');
    root.style.setProperty('--stage-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--logical-scale',scale.toFixed(4));

    settleLayout();
  }

  function fitLives(){
    const lives=[...document.querySelectorAll('#app .p:not(.hide) .life')];
    for(const el of lives)el.style.setProperty('--life-fit','1');
    requestAnimationFrame(()=>{
      for(const el of lives){
        const available=Math.max(1,el.clientWidth*.94);
        const needed=Math.max(1,el.scrollWidth);
        if(needed>available){
          const fit=Math.max(.52,Math.min(1,available/needed));
          el.style.setProperty('--life-fit',fit.toFixed(3));
        }
      }
    });
  }

  function settleLayout(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>requestAnimationFrame(fitLives));
  }

  const app=document.getElementById('app');
  if(app)new MutationObserver(settleLayout).observe(app,{childList:true,subtree:true,characterData:true});

  window.addEventListener('resize',applyStage,{passive:true});
  window.addEventListener('orientationchange',()=>{
    setTimeout(applyStage,80);
    setTimeout(applyStage,260);
  },{passive:true});
  window.addEventListener('pageshow',()=>{
    applyStage();
    setTimeout(applyStage,180);
  });
  document.fonts?.ready?.then(settleLayout).catch(()=>{});

  applyStage();
})();
