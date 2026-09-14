(()=>{
  let active=null;
  let clearTimer=null;

  function clearHold(target=active){
    if(clearTimer){clearTimeout(clearTimer);clearTimer=null}
    if(target)target.classList.remove('holding');
    if(target===active)active=null;
  }

  document.addEventListener('pointerdown',e=>{
    const life=e.target.closest?.('.life[data-life]');
    if(!life)return;
    if(e.pointerType==='mouse'&&e.button!==0)return;

    clearHold();
    active=life;
    life.classList.remove('holding');
    void life.offsetWidth;
    life.classList.add('holding');

    /* app.js opens the editor at 600ms. Remove the ring just after completion. */
    clearTimer=setTimeout(()=>clearHold(life),630);
  },true);

  document.addEventListener('pointerup',e=>{
    if(active)clearHold(active);
  },true);

  document.addEventListener('pointercancel',()=>clearHold(),true);
  window.addEventListener('blur',()=>clearHold());
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')clearHold();
  });
})();
