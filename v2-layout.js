(()=>{
  const root=document.documentElement;
  const stage=document.getElementById('stage');
  const app=document.getElementById('app');
  if(!root||!stage||!app)return;

  const legacyUpdate=window.EDHStage?.update;
  let wasPortrait=false;
  let applyTimer=0;
  let applying=false;

  const safeProbe=document.createElement('div');
  Object.assign(safeProbe.style,{
    position:'fixed',
    visibility:'hidden',
    pointerEvents:'none',
    paddingTop:'env(safe-area-inset-top,0px)',
    paddingRight:'env(safe-area-inset-right,0px)',
    paddingBottom:'env(safe-area-inset-bottom,0px)',
    paddingLeft:'env(safe-area-inset-left,0px)'
  });
  document.body.appendChild(safeProbe);

  const px=value=>{
    const number=parseFloat(value);
    return Number.isFinite(number)?Math.max(0,number):0;
  };
  const clamp=(min,value,max)=>Math.min(max,Math.max(min,value));

  function viewport(){
    const visual=window.visualViewport;
    if(visual){
      return {
        w:Math.max(1,visual.width),
        h:Math.max(1,visual.height),
        x:Number(visual.offsetLeft)||0,
        y:Number(visual.offsetTop)||0
      };
    }
    return {w:Math.max(1,innerWidth),h:Math.max(1,innerHeight),x:0,y:0};
  }

  function safeInsets(){
    const style=getComputedStyle(safeProbe);
    return {
      top:px(style.paddingTop),
      right:px(style.paddingRight),
      bottom:px(style.paddingBottom),
      left:px(style.paddingLeft)
    };
  }

  function playerCount(){
    if(app.classList.contains('c2'))return 2;
    if(app.classList.contains('c3'))return 3;
    return 4;
  }

  function setVar(name,value){root.style.setProperty(name,value)}
  function setStageVar(name,value){stage.style.setProperty(name,value)}

  function updateHelpForV2(){
    const label=document.querySelector('#helpOverlay .helpHead span');
    if(label)label.textContent='EDH LIFE v2';
    const toolTitle=document.querySelector('#helpOverlay .helpTools h3');
    if(toolTitle)toolTitle.textContent='操作ボタン';
    const cards=document.querySelectorAll('#helpOverlay .helpCard');
    const commander=cards[1];
    if(commander){
      const paragraphs=commander.querySelectorAll('p');
      if(paragraphs[1])paragraphs[1].innerHTML='<b>＋1</b>で加算するとライフも自動で減ります。減算・Partner・統率者税はカード長押しの詳細画面から編集します。';
    }
  }

  function syncCenterHub(){
    const hub=document.getElementById('unifiedTableStateHub');
    if(!hub)return;
    hub.style.left=`${app.offsetLeft+app.offsetWidth/2}px`;
    hub.style.top=`${app.offsetTop+app.offsetHeight/2}px`;
  }

  function applyPortraitLayout(){
    if(applying)return;
    applying=true;
    try{
      const view=viewport();
      const portrait=view.h>view.w;

      if(!portrait){
        root.classList.remove('v2-portrait','v2-compact');
        root.classList.add('v2-landscape');
        if(wasPortrait&&typeof legacyUpdate==='function')legacyUpdate();
        wasPortrait=false;
        return;
      }

      wasPortrait=true;
      root.classList.add('v2-portrait','stage-native');
      root.classList.remove('v2-landscape','stage-rotated');

      const safe=safeInsets();
      const count=playerCount();
      const toolGap=clamp(3,view.w*.009,6);
      const usableToolW=Math.max(220,view.w-safe.left-safe.right-18);
      const toolSize=clamp(36,(usableToolW-toolGap*5)/6,48);
      const gameBottom=safe.bottom+toolSize+12;
      const gameW=Math.max(1,view.w-safe.left-safe.right);
      const gameH=Math.max(1,view.h-safe.top-gameBottom);
      const pW=count===2?gameW:gameW/2;
      const pH=gameH/2;
      const compact=pH<310||pW<175;

      const uiScale=clamp(.76,view.w/390,1.42);
      const lifeSize=clamp(compact?52:60,Math.min(pW*.46,pH*.28),132);
      const controlH=clamp(compact?28:34,pH*.105,compact?36:46);
      const lifeMinH=clamp(compact?48:58,pH*.19,118);
      const cmdRowH=clamp(compact?28:34,pH*(compact?.105:.10),compact?34:46);
      const cmdButtonH=clamp(compact?23:27,cmdRowH*.82,38);
      const partnerRowH=clamp(compact?20:23,cmdRowH*.72,32);
      const partnerButtonH=clamp(compact?20:23,partnerRowH*.94,31);
      const nameSize=clamp(compact?12:13,pW*.075,22);
      const cmdNameSize=clamp(8.5,pW*.052,13);
      const cmdValueSize=clamp(15,pW*.095,25);
      const cmdButtonSize=clamp(12,pW*.072,18);
      const quickSize=clamp(15,pW*.085,23);
      const iconSize=clamp(24,pW*.17,44);
      const panelPad=clamp(4,pW*.028,10);
      const panelGap=clamp(3,pH*.012,7);
      const controlGap=clamp(3,pW*.025,7);

      setVar('--board-w',`${view.w.toFixed(3)}px`);
      setVar('--board-h',`${view.h.toFixed(3)}px`);
      setVar('--board-scale','1');
      setVar('--board-rot','0deg');
      setVar('--board-left',`${(view.x+view.w/2).toFixed(3)}px`);
      setVar('--board-top',`${(view.y+view.h/2).toFixed(3)}px`);
      setVar('--gutter-start','0px');
      setVar('--gutter-end','0px');
      setVar('--v2-safe-top',`${safe.top.toFixed(2)}px`);
      setVar('--v2-safe-right',`${safe.right.toFixed(2)}px`);
      setVar('--v2-safe-bottom',`${safe.bottom.toFixed(2)}px`);
      setVar('--v2-safe-left',`${safe.left.toFixed(2)}px`);
      setVar('--v2-game-bottom',`${gameBottom.toFixed(2)}px`);
      setVar('--v2-tool-gap',`${toolGap.toFixed(2)}px`);
      setVar('--v2-panel-pad',`${panelPad.toFixed(2)}px`);
      setVar('--v2-gap',`${panelGap.toFixed(2)}px`);
      setVar('--v2-control-gap',`${controlGap.toFixed(2)}px`);
      setVar('--v2-control-h',`${controlH.toFixed(2)}px`);
      setVar('--v2-life-min-h',`${lifeMinH.toFixed(2)}px`);
      setVar('--v2-control-radius',`${clamp(9,controlH*.32,16).toFixed(2)}px`);
      setVar('--v2-icon-size',`${iconSize.toFixed(2)}px`);
      setVar('--v2-quick-size',`${quickSize.toFixed(2)}px`);
      setVar('--v2-name-size',`${nameSize.toFixed(2)}px`);
      setVar('--v2-cmd-pad',`${compact?2:3}px`);
      setVar('--v2-cmd-gap',`${compact?2:3}px`);
      setVar('--v2-cmd-radius',`${compact?8:10}px`);
      setVar('--v2-cmd-card-radius',`${compact?6:8}px`);
      setVar('--v2-cmd-row-h',`${cmdRowH.toFixed(2)}px`);
      setVar('--v2-cmd-button-h',`${cmdButtonH.toFixed(2)}px`);
      setVar('--v2-partner-row-h',`${partnerRowH.toFixed(2)}px`);
      setVar('--v2-partner-button-h',`${partnerButtonH.toFixed(2)}px`);
      setVar('--v2-cmd-name-size',`${cmdNameSize.toFixed(2)}px`);
      setVar('--v2-cmd-value-size',`${cmdValueSize.toFixed(2)}px`);
      setVar('--v2-cmd-button-size',`${cmdButtonSize.toFixed(2)}px`);
      setVar('--v2-tax-size',`${clamp(7,pW*.042,10).toFixed(2)}px`);

      setStageVar('--ui-scale',uiScale.toFixed(4));
      setStageVar('--control-scale','1');
      setStageVar('--life-size',`${lifeSize.toFixed(2)}px`);
      setStageVar('--tool-scale','1');
      setStageVar('--tool-size',`${toolSize.toFixed(2)}px`);

      root.classList.toggle('v2-compact',compact);
      updateHelpForV2();

      if(window.EDHStage?.state){
        Object.assign(window.EDHStage.state,{
          ...view,
          safe,
          rotated:false,
          portraitV2:true,
          boardW:view.w,
          boardH:view.h,
          scale:1,
          gameW,
          gameH,
          playerW:pW,
          playerH:pH,
          uiScale,
          lifeSize,
          toolScale:1
        });
      }

      requestAnimationFrame(syncCenterHub);
      window.dispatchEvent(new CustomEvent('edh-v2-layout'));
    }finally{
      applying=false;
    }
  }

  function schedule(delay=0){
    clearTimeout(applyTimer);
    applyTimer=setTimeout(applyPortraitLayout,delay);
  }

  window.addEventListener('resize',()=>{schedule(115);},{passive:true});
  window.visualViewport?.addEventListener('resize',()=>schedule(115),{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>schedule(45),{passive:true});
  window.addEventListener('orientationchange',()=>schedule(190),{passive:true});
  window.addEventListener('pageshow',()=>{
    schedule(0);
    setTimeout(applyPortraitLayout,190);
    setTimeout(applyPortraitLayout,460);
  });

  new MutationObserver(()=>{
    const view=viewport();
    if(view.h<=view.w)return;
    const badRotation=root.style.getPropertyValue('--board-rot')!=='0deg'||root.classList.contains('stage-rotated');
    if(badRotation||!root.classList.contains('v2-portrait'))schedule(0);
  }).observe(root,{attributes:true,attributeFilter:['class','style']});

  new MutationObserver(()=>schedule(0)).observe(app,{attributes:true,attributeFilter:['class']});

  applyPortraitLayout();
  setTimeout(applyPortraitLayout,130);
})();
