(()=>{
  const root=document.documentElement;
  const stage=document.getElementById('stage');
  const app=document.getElementById('app');
  if(!root||!stage||!app)return;

  function setupHelp(){
    const tools=document.getElementById('tools');
    const settingsButton=document.getElementById('set');
    if(!tools||!settingsButton||document.getElementById('help'))return;

    const style=document.createElement('style');
    style.textContent=`
      #helpOverlay{z-index:55}
      #helpOverlay .helpPanel{width:min(720px,96%);padding:14px}
      #helpOverlay .helpHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:8px}
      #helpOverlay .helpHead h2{margin:0;font-size:23px}
      #helpOverlay .helpHead span{color:var(--mut);font-size:11px;font-weight:800;white-space:nowrap}
      #helpOverlay .helpGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      #helpOverlay .helpCard{padding:8px 9px;border:1px solid var(--line);border-radius:11px;background:#0d1119}
      #helpOverlay .helpCard h3{margin:0 0 4px;font-size:14px}
      #helpOverlay .helpCard p{margin:2px 0;color:#d7dce6;font-size:11.5px;line-height:1.35}
      #helpOverlay .helpCard b{color:#fff}
      #helpOverlay .helpTools{grid-column:1/-1}
      #helpOverlay .helpToolsGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:5px}
      #helpOverlay .helpTool{padding:5px 6px;border-radius:8px;background:#171c26;font-size:10.5px;line-height:1.25}
      #helpOverlay .helpTool b{display:block;color:#fff;font-size:11px;margin-bottom:1px}
      #helpOverlay .helpNote{margin:7px 0 0;color:var(--mut);font-size:10.5px;line-height:1.3}
      #helpOverlay .acts{margin-top:8px}
      #helpOverlay .acts button{min-width:88px}
      #help .mi{overflow:visible}
    `;
    document.head.appendChild(style);

    const helpButton=document.createElement('button');
    helpButton.type='button';
    helpButton.id='help';
    helpButton.title='使い方';
    helpButton.setAttribute('aria-label','使い方');
    helpButton.innerHTML=`<svg class="mi" viewBox="0 -960 960 960" aria-hidden="true"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm2 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Zm4-172q25 0 43.5 16t18.5 40q0 22-13.5 39T502-525q-23 20-40.5 44T444-427q0 14 10.5 23.5T479-394q15 0 25.5-10t13.5-25q4-21 18-37.5t30-31.5q23-22 39.5-48t16.5-58q0-51-41.5-83.5T484-720q-38 0-72.5 16T359-655q-7 12-4.5 25.5T368-609q14 8 29 5t25-17q11-15 27.5-23t34.5-8Z"/></svg>`;
    settingsButton.before(helpButton);

    const helpOverlay=document.createElement('div');
    helpOverlay.id='helpOverlay';
    helpOverlay.className='ov';
    helpOverlay.innerHTML=`
      <div class="modal helpPanel" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
        <div class="helpHead"><h2 id="helpTitle">使い方</h2><span>EDH LIFE v2</span></div>
        <div class="helpGrid">
          <section class="helpCard"><h3>ライフ</h3><p><b>大きな数字</b>が現在ライフです。</p><p><b>−1 / +1 / −5 / +5</b>で増減し、長押しで連続入力できます。</p><p>ライフ数字長押しで毒・経験・速度を編集します。</p></section>
          <section class="helpCard"><h3>統率者ダメージ</h3><p>各カードは、その名前のプレイヤーの統率者から受けたダメージです。</p><p><b>+1</b>で加算。減算・Partner・Commander Taxはカード長押しの詳細画面から編集します。</p></section>
          <section class="helpCard"><h3>卓上状態</h3><p>中央の8分割ハブで<b>Monarch / Initiative</b>を管理します。</p><p>中央の記号を選んでから移動先プレイヤーをタップします。</p></section>
          <section class="helpCard"><h3>敗北表示</h3><p>ライフ0以下、毒10、同一統率者から21点以上で<b>DEFEATED</b>を表示します。</p><p>敗北後も入力ミスは修正できます。</p></section>
          <section class="helpCard helpTools"><h3>操作ボタン</h3><div class="helpToolsGrid">
            <div class="helpTool"><b>Undo</b>直前の変更を戻します。</div>
            <div class="helpTool"><b>ダイス</b>D6 / D20 / コイン / プレイヤー抽選。</div>
            <div class="helpTool"><b>リセット</b>長押しでゲーム値を初期化。</div>
            <div class="helpTool"><b>フルスクリーン</b>対応ブラウザで切替。</div>
            <div class="helpTool"><b>ヘルプ</b>この画面を表示。</div>
            <div class="helpTool"><b>設定</b>人数・名前・色・卓状態UI。</div>
          </div><p class="helpNote">縦向きはv2ネイティブレイアウト、横向きは従来レイアウトを使用します。</p></section>
        </div>
        <div class="acts"><button type="button" id="helpClose">閉じる</button></div>
      </div>`;
    stage.appendChild(helpOverlay);

    const closeButton=helpOverlay.querySelector('#helpClose');
    let returnFocus=null;
    const openHelp=()=>{
      document.getElementById('settings')?.classList.remove('show');
      document.getElementById('counters')?.classList.remove('show','counter-flipped');
      document.getElementById('dm')?.classList.remove('show');
      returnFocus=document.activeElement;
      helpOverlay.classList.add('show');
      closeButton.focus({preventScroll:true});
    };
    const closeHelp=()=>{
      helpOverlay.classList.remove('show');
      if(returnFocus instanceof HTMLElement)returnFocus.focus({preventScroll:true});
      returnFocus=null;
    };
    helpButton.addEventListener('click',event=>{event.stopPropagation();openHelp()});
    closeButton.addEventListener('click',closeHelp);
    helpOverlay.addEventListener('click',event=>{if(event.target===helpOverlay)closeHelp()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&helpOverlay.classList.contains('show'))closeHelp()});
  }

  setupHelp();

  const DESIGN_W=844;
  const BOARD_H=390;
  const BASE_GAME_W=740;
  const clamp=(min,value,max)=>Math.min(max,Math.max(min,value));

  const viewportProbe=document.createElement('div');
  Object.assign(viewportProbe.style,{position:'fixed',inset:'0',visibility:'hidden',pointerEvents:'none',margin:'0',padding:'0',border:'0'});
  document.body.appendChild(viewportProbe);

  const safeProbe=document.createElement('div');
  Object.assign(safeProbe.style,{position:'fixed',visibility:'hidden',pointerEvents:'none',paddingTop:'env(safe-area-inset-top, 0px)',paddingRight:'env(safe-area-inset-right, 0px)',paddingBottom:'env(safe-area-inset-bottom, 0px)',paddingLeft:'env(safe-area-inset-left, 0px)'});
  document.body.appendChild(safeProbe);

  const px=value=>{
    const number=parseFloat(value);
    return Number.isFinite(number)?Math.max(0,number):0;
  };

  function getLayoutViewport(){
    const rect=viewportProbe.getBoundingClientRect();
    return {w:Math.max(1,rect.width),h:Math.max(1,rect.height),x:rect.left,y:rect.top};
  }

  function getVisibleViewport(){
    const layout=getLayoutViewport();
    const visual=window.visualViewport;
    if(!visual)return layout;
    const visible={w:Math.max(1,visual.width),h:Math.max(1,visual.height),x:Number(visual.offsetLeft)||0,y:Number(visual.offsetTop)||0};
    const clipped=Math.abs(visible.x-layout.x)>.5||Math.abs(visible.y-layout.y)>.5||visible.w<layout.w-1||visible.h<layout.h-1;
    return clipped?visible:layout;
  }

  function getSafeInsets(){
    const style=getComputedStyle(safeProbe);
    return {top:px(style.paddingTop),right:px(style.paddingRight),bottom:px(style.paddingBottom),left:px(style.paddingLeft)};
  }

  function isPortraitLayout(){
    const layout=getLayoutViewport();
    return layout.h>layout.w;
  }

  function getPlayerCount(){
    if(app.classList.contains('c2'))return 2;
    if(app.classList.contains('c3'))return 3;
    return 4;
  }

  function setRoot(name,value){root.style.setProperty(name,value)}
  function setStage(name,value){stage.style.setProperty(name,value)}

  function syncCenterHub(){
    const hub=document.getElementById('unifiedTableStateHub');
    if(!hub)return;
    hub.style.left=`${app.offsetLeft+app.offsetWidth/2}px`;
    hub.style.top=`${app.offsetTop+app.offsetHeight/2}px`;
  }

  function applyPortrait(viewport,safe){
    const count=getPlayerCount();
    const toolGap=clamp(3,viewport.w*.009,6);
    const usableToolW=Math.max(220,viewport.w-safe.left-safe.right-18);
    const toolSize=clamp(36,(usableToolW-toolGap*5)/6,48);
    const gameBottom=safe.bottom+toolSize+12;
    const gameW=Math.max(1,viewport.w-safe.left-safe.right);
    const gameH=Math.max(1,viewport.h-safe.top-gameBottom);
    const playerW=count===2?gameW:gameW/2;
    const playerH=gameH/2;
    const compact=playerH<310||playerW<175;

    const uiScale=clamp(.76,viewport.w/390,1.42);
    const lifeSize=clamp(compact?52:60,Math.min(playerW*.46,playerH*.28),132);
    const controlH=clamp(compact?28:34,playerH*.105,compact?36:46);
    const lifeMinH=clamp(compact?48:58,playerH*.19,118);
    const cmdRowH=clamp(compact?28:34,playerH*(compact?.105:.10),compact?34:46);
    const cmdButtonH=clamp(compact?23:27,cmdRowH*.82,38);
    const partnerRowH=clamp(compact?20:23,cmdRowH*.72,32);
    const partnerButtonH=clamp(compact?20:23,partnerRowH*.94,31);
    const nameSize=clamp(compact?12:13,playerW*.075,22);
    const cmdNameSize=clamp(8.5,playerW*.052,13);
    const cmdValueSize=clamp(15,playerW*.095,25);
    const cmdButtonSize=clamp(12,playerW*.072,18);
    const quickSize=clamp(15,playerW*.085,23);
    const iconSize=clamp(24,playerW*.17,44);
    const panelPad=clamp(4,playerW*.028,10);
    const panelGap=clamp(3,playerH*.012,7);
    const controlGap=clamp(3,playerW*.025,7);

    setRoot('--board-w',`${viewport.w.toFixed(3)}px`);
    setRoot('--board-h',`${viewport.h.toFixed(3)}px`);
    setRoot('--board-scale','1');
    setRoot('--board-rot','0deg');
    setRoot('--board-left',`${(viewport.x+viewport.w/2).toFixed(3)}px`);
    setRoot('--board-top',`${(viewport.y+viewport.h/2).toFixed(3)}px`);
    setRoot('--gutter-start','0px');
    setRoot('--gutter-end','0px');
    setRoot('--v2-safe-top',`${safe.top.toFixed(2)}px`);
    setRoot('--v2-safe-right',`${safe.right.toFixed(2)}px`);
    setRoot('--v2-safe-bottom',`${safe.bottom.toFixed(2)}px`);
    setRoot('--v2-safe-left',`${safe.left.toFixed(2)}px`);
    setRoot('--v2-game-bottom',`${gameBottom.toFixed(2)}px`);
    setRoot('--v2-tool-gap',`${toolGap.toFixed(2)}px`);
    setRoot('--v2-panel-pad',`${panelPad.toFixed(2)}px`);
    setRoot('--v2-gap',`${panelGap.toFixed(2)}px`);
    setRoot('--v2-control-gap',`${controlGap.toFixed(2)}px`);
    setRoot('--v2-control-h',`${controlH.toFixed(2)}px`);
    setRoot('--v2-life-min-h',`${lifeMinH.toFixed(2)}px`);
    setRoot('--v2-control-radius',`${clamp(9,controlH*.32,16).toFixed(2)}px`);
    setRoot('--v2-icon-size',`${iconSize.toFixed(2)}px`);
    setRoot('--v2-quick-size',`${quickSize.toFixed(2)}px`);
    setRoot('--v2-name-size',`${nameSize.toFixed(2)}px`);
    setRoot('--v2-cmd-pad',`${compact?2:3}px`);
    setRoot('--v2-cmd-gap',`${compact?2:3}px`);
    setRoot('--v2-cmd-radius',`${compact?8:10}px`);
    setRoot('--v2-cmd-card-radius',`${compact?6:8}px`);
    setRoot('--v2-cmd-row-h',`${cmdRowH.toFixed(2)}px`);
    setRoot('--v2-cmd-button-h',`${cmdButtonH.toFixed(2)}px`);
    setRoot('--v2-partner-row-h',`${partnerRowH.toFixed(2)}px`);
    setRoot('--v2-partner-button-h',`${partnerButtonH.toFixed(2)}px`);
    setRoot('--v2-cmd-name-size',`${cmdNameSize.toFixed(2)}px`);
    setRoot('--v2-cmd-value-size',`${cmdValueSize.toFixed(2)}px`);
    setRoot('--v2-cmd-button-size',`${cmdButtonSize.toFixed(2)}px`);
    setRoot('--v2-tax-size',`${clamp(7,playerW*.042,10).toFixed(2)}px`);

    setStage('--ui-scale',uiScale.toFixed(4));
    setStage('--control-scale','1');
    setStage('--life-size',`${lifeSize.toFixed(2)}px`);
    setStage('--tool-scale','1');
    setStage('--tool-size',`${toolSize.toFixed(2)}px`);

    root.classList.add('v2-portrait','stage-native');
    root.classList.remove('v2-landscape','stage-rotated');
    root.classList.toggle('v2-compact',compact);

    window.EDHStage={state:{...viewport,safe,rotated:false,portraitV2:true,boardW:viewport.w,boardH:viewport.h,scale:1,gutterStart:0,gutterEnd:0,gameW,gameH,playerW,playerH,uiScale,controlScale:1,lifeSize,toolScale:1},update:applyLayout};
    requestAnimationFrame(syncCenterHub);
  }

  function applyLandscape(viewport,safe){
    const scale=Math.min(viewport.w,viewport.h)/BOARD_H;
    const boardW=Math.min(DESIGN_W,Math.max(viewport.w,viewport.h)/Math.max(scale,.001));
    const gutterStart=Math.max(8,Math.ceil(safe.left/Math.max(scale,.001))+4);
    const initialEnd=Math.max(46,Math.ceil(safe.right/Math.max(scale,.001))+4);
    const initialGameW=Math.max(1,boardW-gutterStart-initialEnd);
    const initialUi=clamp(.48,initialGameW/BASE_GAME_W,1);
    const initialTool=Math.max(.68,initialUi);
    const gutterEnd=Math.max(initialEnd,42*initialTool+8);
    const gameW=Math.max(1,boardW-gutterStart-gutterEnd);
    const uiScale=clamp(.48,gameW/BASE_GAME_W,1);
    const toolScale=Math.max(.68,uiScale);
    const toolSize=42*toolScale;
    const count=getPlayerCount();
    const playerW=count===2?gameW:gameW/2;
    const rowW=Math.max(1,playerW*.96);
    const baseLife=96*uiScale;
    const textWidthFactor=1.55;
    const sideBudget=220;
    const controlScale=Math.max(.38,Math.min(uiScale,(rowW-baseLife*textWidthFactor)/sideBudget));
    const lifeSlot=Math.max(1,rowW-sideBudget*controlScale);
    const lifeSize=Math.max(22,Math.min(baseLife,lifeSlot/textWidthFactor));

    setRoot('--board-w',`${boardW.toFixed(3)}px`);
    setRoot('--board-h',`${BOARD_H}px`);
    setRoot('--board-scale',scale.toFixed(6));
    setRoot('--board-rot','0deg');
    setRoot('--board-left',`${(viewport.x+viewport.w/2).toFixed(3)}px`);
    setRoot('--board-top',`${(viewport.y+viewport.h/2).toFixed(3)}px`);
    setRoot('--gutter-start',`${gutterStart.toFixed(3)}px`);
    setRoot('--gutter-end',`${gutterEnd.toFixed(3)}px`);

    setStage('--ui-scale',uiScale.toFixed(4));
    setStage('--control-scale',controlScale.toFixed(4));
    setStage('--life-size',`${lifeSize.toFixed(3)}px`);
    setStage('--tool-scale',toolScale.toFixed(4));
    setStage('--tool-size',`${toolSize.toFixed(3)}px`);

    root.classList.add('v2-landscape','stage-native');
    root.classList.remove('v2-portrait','v2-compact','stage-rotated');

    window.EDHStage={state:{...viewport,safe,rotated:false,portraitV2:false,boardW,boardH:BOARD_H,scale,gutterStart,gutterEnd,gameW,playerW,rowW,uiScale,controlScale,lifeSlot,lifeSize,toolScale},update:applyLayout};
    requestAnimationFrame(syncCenterHub);
  }

  function applyLayout(){
    const viewport=getVisibleViewport();
    const safe=getSafeInsets();
    if(isPortraitLayout())applyPortrait(viewport,safe);
    else applyLandscape(viewport,safe);
  }

  let resizeTimer=0;
  function schedule(delay=90){clearTimeout(resizeTimer);resizeTimer=setTimeout(applyLayout,delay)}

  window.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>schedule(30),{passive:true});
  window.addEventListener('orientationchange',()=>schedule(160),{passive:true});
  window.addEventListener('pageshow',()=>{applyLayout();schedule(160);setTimeout(applyLayout,420)});
  new MutationObserver(()=>schedule(0)).observe(app,{attributes:true,attributeFilter:['class']});

  applyLayout();
})();
