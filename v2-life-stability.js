(()=>{
  const app=document.getElementById('app');
  if(!app)return;

  /* Life totals are patched in place by multitouch.js. Fit changed digits in the
     mutation microtask, before the browser paints the next frame. */
  const fitChangedLife=value=>{
    if(!value?.classList?.contains('lifeValue'))return;
    window.__edhFitLifeValue?.(value);
  };

  new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='characterData'){
        fitChangedLife(record.target.parentElement);
        continue;
      }
      for(const node of record.addedNodes){
        if(node.nodeType!==Node.ELEMENT_NODE)continue;
        if(node.classList?.contains('lifeValue'))fitChangedLife(node);
        node.querySelectorAll?.('.lifeValue').forEach(fitChangedLife);
      }
      if(record.target?.classList?.contains('lifeValue'))fitChangedLife(record.target);
    }
  }).observe(app,{subtree:true,childList:true,characterData:true});
})();
