(()=>{
  const root=document.documentElement;
  const app=document.getElementById('app');
  if(!root||!app)return;

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const px=value=>`${Math.round(value*100)/100}px`;

  function playerCount(){
    if(app.classList.contains('c2'))return 2;
    if(app.classList.contains('c3'))return 3;
    return 4;
  }

  function currentSafeArea(){
    const known=window.EDHStage?.state?.safe;
    if(known)return known;
    return {top:0,right:0,bottom:0,left:0};
  }

  function syncFluidScale(){
    const width=document.documentElement.clientWidth||window.innerWidth||1;
    const height=document.documentElement.clientHeight||window.innerHeight||1;
    const count=playerCount();
    const columns=count===2?1:2;
    const seatWidth=width/columns;
    const safe=currentSafeArea();
    const safeEdge=Math.max(Number(safe.top)||0,Number(safe.bottom)||0);

    /* Reference is the current phone layout: roughly one 215 x 375 usable seat.
       Use both width and height continuously instead of classifying devices. */
    let density=1;
    for(let i=0;i<3;i++){
      const centerBand=60*clamp(density,.9,1.3);
      const seatHeight=Math.max(1,(height-centerBand)/2);
      const usableHeight=Math.max(1,seatHeight-safeEdge);
      const widthRatio=seatWidth/215;
      const heightRatio=usableHeight/375;
      density=clamp(Math.sqrt(Math.max(.01,widthRatio*heightRatio)),.86,1.35);
    }

    const toolScale=clamp(density,.9,1.30);
    const controlScale=clamp(density,.9,1.22);
    const commanderScale=clamp(density,.9,1.08);
    const nameScale=clamp(density,.9,1.20);
    const chromeScale=clamp(density,.9,1.18);
    const badgeScale=clamp(density,.9,1.25);
    const diceScale=clamp(density,.9,1.35);

    const centerBand=clamp(54,60*toolScale,78);
    const seatHeight=Math.max(1,(height-centerBand)/2);
    const panelPad=clamp(4,6*chromeScale,10);
    const panelGap=clamp(3,4*chromeScale,6);
    const controlHeight=clamp(40,46*controlScale,56);
    const commanderCardHeight=clamp(44,50*commanderScale,54);
    const nameFont=clamp(15,19*nameScale,24);
    const commanderNameFont=clamp(10,13*nameScale,16);
    const commanderValueFont=clamp(20,27*nameScale,34);
    const partnerNameFont=clamp(9,11*nameScale,14);
    const partnerValueFont=clamp(17,21*nameScale,27);
    const partnerMarkFont=clamp(9,9*nameScale,12);

    /* Life gets whatever space remains after the secondary controls are budgeted.
       This is what lets a large tablet grow the important number without making
       Commander Damage consume the whole seat. */
    const opponents=Math.max(1,count-1);
    const commanderGap=clamp(3,3*commanderScale,4);
    const commanderPadding=clamp(4,6*commanderScale,7);
    const commanderBlock=opponents*commanderCardHeight+
      Math.max(0,opponents-1)*commanderGap+commanderPadding;
    const innerHeight=Math.max(1,seatHeight-safeEdge-panelPad*2);
    const fixedHeight=commanderBlock+(nameFont*1.05)+(panelGap*3)+controlHeight;
    const lifeSlot=Math.max(64,innerHeight-fixedHeight);
    const lifeByHeight=lifeSlot/.90;
    const lifeByWidth=seatWidth*(count===2?.72:.64);
    const lifeFont=clamp(Math.min(lifeByHeight,lifeByWidth),64,260);

    const toolSize=clamp(46,52*toolScale,72);
    const toolGap=clamp(3,4*toolScale,7);
    const controlIcon=clamp(26,34*controlScale,43);
    const badgeHeight=clamp(20,21*badgeScale,29);
    const badgeFont=clamp(11,12*badgeScale,16);
    const badgeIcon=clamp(12,13*badgeScale,17);
    const dieSize=clamp(84,92*diceScale,124);
    const playerDieSize=clamp(72,78*diceScale,106);

    root.style.setProperty('--seat-scale',String(density));
    root.style.setProperty('--panel-pad',px(panelPad));
    root.style.setProperty('--panel-gap',px(panelGap));
    root.style.setProperty('--control-h',px(controlHeight));
    root.style.setProperty('--center-band-h',px(centerBand));
    root.style.setProperty('--commander-card-h',px(commanderCardHeight));
    root.style.setProperty('--tool-size',px(toolSize));
    root.style.setProperty('--tool-gap',px(toolGap));
    root.style.setProperty('--fluid-life-font',px(lifeFont));
    root.style.setProperty('--fluid-name-font',px(nameFont));
    root.style.setProperty('--fluid-cmd-name-font',px(commanderNameFont));
    root.style.setProperty('--fluid-cmd-value-font',px(commanderValueFont));
    root.style.setProperty('--fluid-partner-name-font',px(partnerNameFont));
    root.style.setProperty('--fluid-partner-value-font',px(partnerValueFont));
    root.style.setProperty('--fluid-partner-mark-font',px(partnerMarkFont));
    root.style.setProperty('--fluid-control-icon',px(controlIcon));
    root.style.setProperty('--fluid-badge-height',px(badgeHeight));
    root.style.setProperty('--fluid-badge-font',px(badgeFont));
    root.style.setProperty('--fluid-badge-icon',px(badgeIcon));
    root.style.setProperty('--fluid-die-size',px(dieSize));
    root.style.setProperty('--fluid-player-die-size',px(playerDieSize));

    /* Device-category classes are legacy only. v2 sizing is now seat-driven. */
    root.classList.remove('layout-short','layout-tablet');

    if(window.EDHStage?.state){
      Object.assign(window.EDHStage.state,{
        seatScale:density,
        seatW:seatWidth,
        seatH:seatHeight,
        playerW:seatWidth,
        playerH:seatHeight
      });
    }
  }

  syncFluidScale();
  window.addEventListener('edh-v2-layout',syncFluidScale);
  window.addEventListener('resize',syncFluidScale,{passive:true});
  window.visualViewport?.addEventListener('resize',syncFluidScale,{passive:true});
  window.addEventListener('orientationchange',syncFluidScale,{passive:true});
  window.addEventListener('pageshow',syncFluidScale,{passive:true});
  new MutationObserver(syncFluidScale).observe(app,{attributes:true,attributeFilter:['class']});
})();
