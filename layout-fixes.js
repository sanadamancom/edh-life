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

  let state=null;
  let raf=0;

  function viewport(){
    /* Use the stable layout viewport. visualViewport can change when browser chrome or
       the keyboard animates, which would make the game board jump. */
    return {
      w:Math.round(document.documentElement.clientWidth||window.innerWidth),
      h:Math.round(document.documentElement.clientHeight||window.innerHeight),
      x:0,
      y:0
    };
  }

  function applyStage(){
    const p=viewport();
    const rotated=p.h>p.w;
    const lw=Math.max(p.w,p.h);
    const lh=Math.min(p.w,p.h);
    const scale=Math.max(.72,Math.min(1.85,Math.min(lw/844,lh/390)));
    const cx=p.x+p.w/2;
    const cy=p.y+p.h/2;

    state={...p,rotated,lw,lh,cx,cy,scale};
    window.EDHStage={state,update:applyStage};

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

  function toLocal(px,py){
    if(!state)return{x:px,y:py};
    if(!state.rotated){
      return{x:px-(state.cx-state.lw/2),y:py-(state.cy-state.lh/2)};
    }
    const dx=px-state.cx;
    const dy=py-state.cy;
    return{x:state.lw/2+dy,y:state.lh/2-dx};
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
      positionTools();
    });
  }

  function positionTools(){
    const lives=[...document.querySelectorAll('#app .p:not(.hide) .life')];
    if(!lives.length||!state)return;
    let sx=0,sy=0;
    for(const el of lives){
      const r=el.getBoundingClientRect();
      const p=toLocal(r.left+r.width/2,r.top+r.height/2);
      sx+=p.x;
      sy+=p.y;
    }
    root.style.setProperty('--tools-x',(sx/lives.length).toFixed(2)+'px');
    root.style.setProperty('--tools-y',(sy/lives.length).toFixed(2)+'px');
  }

  function settleLayout(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>requestAnimationFrame(()=>{
      fitLives();
      positionTools();
    }));
  }

  const app=document.getElementById('app');
  if(app)new MutationObserver(settleLayout).observe(app,{childList:true,subtree:true,characterData:true});

  window.addEventListener('resize',applyStage,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(applyStage,100),{passive:true});
  window.addEventListener('pageshow',()=>{applyStage();setTimeout(applyStage,180)});
  document.fonts?.ready?.then(settleLayout).catch(()=>{});

  applyStage();
})();
