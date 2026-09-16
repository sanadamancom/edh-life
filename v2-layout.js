(()=>{
  const head=document.head;
  if(!head)return;

  if(!document.querySelector('link[data-v2-compact]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./v2-compact.css?v=2';
    link.dataset.v2Compact='1';
    head.appendChild(link);
  }

  const loadScript=src=>new Promise((resolve,reject)=>{
    if([...document.scripts].some(script=>script.src.includes(src))){resolve();return}
    const script=document.createElement('script');
    script.src=`./${src}?v=2`;
    script.onload=resolve;
    script.onerror=reject;
    document.body.appendChild(script);
  });

  function dockTableStateHub(){
    const tools=document.getElementById('tools');
    const diceWrap=tools?.querySelector('.dw');
    const hub=document.getElementById('unifiedTableStateHub');
    if(!tools||!diceWrap||!hub)return;
    if(hub.parentElement!==tools)diceWrap.after(hub);
    hub.style.removeProperty('left');
    hub.style.removeProperty('top');
  }

  (async()=>{
    try{
      if(!document.getElementById('unifiedTableStateHub'))await loadScript('table-state-hub.js');
      dockTableStateHub();
      await loadScript('v2-compact-interactions.js');
      window.addEventListener('edh-v2-layout',dockTableStateHub);
    }catch(error){
      console.error('Failed to load v2 compact layer',error);
    }
  })();
})();
