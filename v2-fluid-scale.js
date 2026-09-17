(()=>{
  const root=document.documentElement;
  const app=document.getElementById('app');
  if(!root||!app)return;

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const fit=(min,value,max)=>clamp(value,min,max);
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

    /* Phone reference seat. Scale continuously by how much of that complete seat
       fits in the current seat. The limiting axis wins, so a wider tablet never
       over-scales vertically. No phone/tablet device classification is involved. */
    let density=1;
    for(let i=0;i<4;i++){
      const toolProbe=fit(.88,density,1.68);
      const centerBand=fit(54,60*toolProbe,96);
      const seatHeight=Math.max(1,(height-centerBand)/2);
      const usableHeight=Math.max(1,seatHeight-safeEdge);
      const widthRatio=seatWidth/215;
      const heightRatio=usableHeight/375;
      density=clamp(Math.min(widthRatio,heightRatio),.86,1.75);
    }

    /* Secondary UI grows with the seat too, but at slightly different rates.
       Commander Damage grows a little slower so three opponent cards cannot steal
       the life area; life itself is calculated from the remaining real space. */
    const toolScale=clamp(density,.88,1.68);
    const controlScale=clamp(density,.86,1.58);
    const commanderScale=clamp(1+(density-1)*.80,.90,1.48);
    const nameScale=clamp(1+(density-1)*.88,.90,1.55);
    const chromeScale=clamp(1+(density-1)*.55,.90,1.35);
    const badgeScale=clamp(1+(density-1)*.90,.90,1.60);
    const diceScale=clamp(density,.90,1.70);

    const centerBand=fit(54,60*toolScale,96);
    const seatHeight=Math.max(1,(height-centerBand)/2);
    const panelPad=fit(4,6*chromeScale,12);
    const panelGap=fit(3,4*chromeScale,8);
    const controlHeight=fit(40,46*controlScale,72);
    const commanderCardHeight=fit(44,50*commanderScale,74);
    const nameFont=fit(15,19*nameScale,29);
    const commanderNameFont=fit(10,13*nameScale,19);
    const commanderValueFont=fit(20,27*nameScale,40);
    const partnerNameFont=fit(9,11*nameScale,16);
    const partnerValueFont=fit(17,21*nameScale,32);
    const partnerMarkFont=fit(9,9*nameScale,13);

    /* Life is primary. Budget the real seat height after all persistent controls.
       Larger seats get a little extra glyph headroom because the very large life
       numerals visually approach Commander Damage sooner than the nominal font box
       suggests. This stays continuous: phone-sized seats keep the original ratio. */
    const opponents=Math.max(1,count-1);
    const commanderGap=fit(3,3*commanderScale,5);
    const commanderPadding=fit(4,6*commanderScale,9);
    const commanderBlock=opponents*commanderCardHeight+
      Math.max(0,opponents-1)*commanderGap+commanderPadding;
    const innerHeight=Math.max(1,seatHeight-safeEdge-panelPad*2);
    const fixedHeight=commanderBlock+(nameFont*1.05)+(panelGap*3)+controlHeight;
    const lifeSlot=Math.max(64,innerHeight-fixedHeight);
    const largeSeatProgress=clamp((density-1)/.75,0,1);
    const lifeGlyphRatio=.76+(.06*largeSeatProgress);
    const lifeByHeight=lifeSlot/lifeGlyphRatio;
    const lifeByWidth=seatWidth*(count===2?.76:.68);
    const lifeFont=clamp(Math.min(lifeByHeight,lifeByWidth),64,320);

    const toolSize=fit(46,52*toolScale,86);
    const toolGap=fit(3,4*toolScale,8);
    const controlIcon=fit(26,34*controlScale,52);

    /* Status badges are intentionally more legible than before. They still use
       the same continuous seat scale, so tablets grow them without device checks. */
    const badgeHeight=fit(24,26*badgeScale,40);
    const badgeFont=fit(12,14*badgeScale,21);
    const badgeIcon=fit(16,18*badgeScale,28);

    const dieSize=fit(84,92*diceScale,150);
    const playerDieSize=fit(72,78*diceScale,126);

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

    root.classList.remove('layout-short','layout-tablet');
    root.dataset.seatScale=density.toFixed(3);

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