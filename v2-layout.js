(()=>{
  const head=document.head;
  if(!head)return;

  if(!document.querySelector('link[data-v2-compact]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./v2-compact.css?v=1';
    link.dataset.v2Compact='1';
    head.appendChild(link);
  }

  const loadScript=src=>new Promise((resolve,reject)=>{
    if([...document.scripts].some(script=>script.src.includes(src))){resolve();return}
    const script=document.createElement('script');
    script.src=`./${src}?v=1`;
    script.onload=resolve;
    script.onerror=reject;
    document.body.appendChild(script);
  });

  (async()=>{
    try{
      if(!document.getElementById('unifiedTableStateHub'))await loadScript('table-state-hub.js');
      await loadScript('v2-compact-interactions.js');
    }catch(error){
      console.error('Failed to load v2 compact layer',error);
    }
  })();
})();
