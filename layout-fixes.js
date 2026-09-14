(()=>{
  const root=document.documentElement;
  let raf=0;

  function positionTools(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const lives=[...document.querySelectorAll('#app .p:not(.hide) .life')];
      if(!lives.length)return;
      let sx=0,sy=0;
      for(const el of lives){
        const r=el.getBoundingClientRect();
        sx+=r.left+r.width/2;
        sy+=r.top+r.height/2;
      }
      root.style.setProperty('--tools-x',(sx/lives.length)+'px');
      root.style.setProperty('--tools-y',(sy/lives.length)+'px');
    });
  }

  const app=document.getElementById('app');
  if(app){
    new MutationObserver(positionTools).observe(app,{childList:true,subtree:true,characterData:true});
  }

  window.addEventListener('resize',positionTools,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(positionTools,120),{passive:true});
  window.addEventListener('pageshow',()=>{positionTools();setTimeout(positionTools,180)});
  document.fonts?.ready?.then(positionTools).catch(()=>{});
  positionTools();
})();
