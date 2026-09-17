(()=>{
  const root=document.documentElement;
  const stage=document.getElementById('stage');
  const app=document.getElementById('app');
  if(!root||!stage||!app)return;

  root.classList.add('layout-vertical-v2','stage-native');
  root.classList.remove('v2-portrait','v2-landscape','v2-compact','v2-device-landscape','stage-rotated');

  const safeDebug=new URLSearchParams(location.search).get('debug')==='safe';
  let safeDebugUi=null;

  function setupHelp(){
    const tools=document.getElementById('tools');
    const settingsButton=document.getElementById('set');
    if(!tools||!settingsButton||document.getElementById('help'))return;

    const helpButton=document.createElement('button');
    helpButton.type='button';
    helpButton.id='help';
    helpButton.title='使い方';
    helpButton.setAttribute('aria-label','使い方');
    helpButton.innerHTML='<svg class="mi" viewBox="0 -960 960 960" aria-hidden="true"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm2 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm4-492q25 0 43.5 16t18.5 40q0 22-13.5 39T502-525q-23 20-40.5 44T444-427q0 14 10.5 23.5T479-394q15 0 25.5-10t13.5-25q4-21 18-37.5t30-31.5q23-22 39.5-48t16.5-58q0-51-41.5-83.5T484-720q-38 0-72.5 16T359-655q-7 12-4.5 25.5T368-609q14 8 29 5t25-17q11-15 27.5-23t34.5-8Z"/></svg>';
    settingsButton.before(helpButton);

    const overlay=document.createElement('div');
    overlay.id='helpOverlay';
    overlay.className='ov';
    overlay.innerHTML=`
      <div class="modal helpPanel" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
        <div class="helpHead"><h2 id="helpTitle">使い方</h2><span>EDH LIFE v2</span></div>
        <div class="helpGrid">
          <section class="helpCard"><h3>ライフ</h3><p><b>大きな数字</b>が現在ライフです。</p><p><b>−1 / +1 / −5 / +5</b>で増減。長押しで連続入力できます。</p><p>ライフ数字長押しで毒・経験・速度を編集します。</p></section>
          <section class="helpCard"><h3>統率者ダメージ</h3><p>各カードは、そのプレイヤーの統率者から受けたダメージです。</p><p><b>+1</b>で加算。減算・Partner・Commander Taxはカード長押しで編集します。</p></section>
          <section class="helpCard"><h3>卓上状態</h3><p>中央の8分割ハブで<b>Monarch / Initiative</b>を管理します。</p><p>中央の記号を選び、移動先プレイヤーをタップします。</p></section>
          <section class="helpCard"><h3>特殊カウンター</h3><p>毒・経験・速度は値がある時だけプレイヤー名付近に表示します。</p><p>毒10、ライフ0、同一統率者から21点で敗北表示になります。</p></section>
          <section class="helpCard helpTools"><h3>操作ボタン</h3><div class="helpToolsGrid">
            <div class="helpTool"><b>Undo</b>直前の変更を戻す</div>
            <div class="helpTool"><b>ダイス</b>D6 / D20 / コイン / 抽選</div>
            <div class="helpTool"><b>リセット</b>長押しでゲーム値を初期化</div>
            <div class="helpTool"><b>フルスクリーン</b>対応環境で切替</div>
            <div class="helpTool"><b>ヘルプ</b>この画面</div>
            <div class="helpTool"><b>設定</b>人数・名前・色・卓状態UI</div>
          </div></section>
        </div>
        <div class="acts"><button type="button" id="helpClose">閉じる</button></div>
      </div>`;
    stage.appendChild(overlay);

    const close=()=>overlay.classList.remove('show');
    helpButton.addEventListener('click',event=>{
      event.stopPropagation();
      document.getElementById('settings')?.classList.remove('show');
      document.getElementById('counters')?.classList.remove('show','counter-flipped');
      document.getElementById('dm')?.classList.remove('show');
      overlay.classList.add('show');
      overlay.querySelector('#helpClose')?.focus({preventScroll:true});
    });
    overlay.querySelector('#helpClose')?.addEventListener('click',close);
    overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay.classList.contains('show'))close()});
  }

  function readSafeArea(){
    const probe=document.createElement('div');
    probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(probe);
    const style=getComputedStyle(probe);
    const safe={
      top:parseFloat(style.paddingTop)||0,
      right:parseFloat(style.paddingRight)||0,
      bottom:parseFloat(style.paddingBottom)||0,
      left:parseFloat(style.paddingLeft)||0
    };
    probe.remove();
    return safe;
  }

  function setupSafeDebug(){
    if(!safeDebug)return;
    const wrap=document.createElement('div');
    wrap.id='safeAreaDebug';
    wrap.style.cssText='position:fixed;inset:0;z-index:99999;pointer-events:none;font:700 11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;color:#fff;text-shadow:0 1px 2px #000';
    wrap.innerHTML='<div data-safe="top" style="position:absolute;left:0;right:0;top:0;background:rgba(255,50,50,.28);border-bottom:1px solid rgba(255,100,100,.9)"></div><div data-safe="bottom" style="position:absolute;left:0;right:0;bottom:0;background:rgba(60,130,255,.28);border-top:1px solid rgba(100,170,255,.9)"></div><pre data-safe="info" style="position:absolute;left:8px;top:8px;margin:0;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.72);white-space:pre-wrap"></pre>';
    document.body.appendChild(wrap);
    safeDebugUi={
      top:wrap.querySelector('[data-safe="top"]'),
      bottom:wrap.querySelector('[data-safe="bottom"]'),
      info:wrap.querySelector('[data-safe="info"]')
    };
  }

  function syncSafeDebug(width,height,safe,boardHeight=height){
    if(!safeDebugUi)return;
    const vv=window.visualViewport;
    safeDebugUi.top.style.height=`${safe.top}px`;
    safeDebugUi.bottom.style.height=`${safe.bottom}px`;
    safeDebugUi.info.textContent=[
      `safe top: ${safe.top.toFixed(1)}px`,
      `safe bottom: ${safe.bottom.toFixed(1)}px`,
      `safe left/right: ${safe.left.toFixed(1)} / ${safe.right.toFixed(1)}px`,
      `client: ${Math.round(width)} × ${Math.round(height)}`,
      `board height: ${Math.round(boardHeight)}`,
      `innerHeight: ${Math.round(window.innerHeight)}`,
      `visualViewport: ${vv?`${Math.round(vv.width)} × ${Math.round(vv.height)} @ ${Math.round(vv.offsetTop)}`:'n/a'}`,
      `screen: ${screen.width} × ${screen.height} @${devicePixelRatio}x`,
      `standalone: ${matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}`
    ].join('\n');
  }

  function syncViewport(){
    const width=document.documentElement.clientWidth||window.innerWidth||1;
    const viewportHeight=document.documentElement.clientHeight||window.innerHeight||1;
    const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
    const physicalScreenHeight=Number(window.screen?.height)||0;
    const height=standalone&&physicalScreenHeight>viewportHeight
      ? physicalScreenHeight
      : viewportHeight;
    const safe=readSafeArea();

    /* In standalone mode the CSS viewport can stop above the bottom safe area on
       some iPads. The board uses the full physical CSS-pixel screen height so the
       center line is the real screen center and both player rows are exactly equal. */
    root.style.setProperty('--stage-full-height',`${height}px`);

    root.classList.toggle('layout-short',height<700);
    root.classList.toggle('layout-tablet',Math.min(width,height)>=600);
    window.EDHStage={
      state:{
        w:width,
        h:height,
        viewportH:viewportHeight,
        x:0,
        y:0,
        safe,
        rotated:false,
        portraitV2:true,
        portraitOnly:true,
        boardW:width,
        boardH:height,
        scale:1,
        gameW:width,
        gameH:height,
        playerW:app.classList.contains('c2')?width:width/2,
        playerH:height/2
      },
      update:syncViewport
    };
    syncSafeDebug(width,viewportHeight,safe,height);
    window.dispatchEvent(new CustomEvent('edh-v2-layout'));
  }

  setupHelp();
  setupSafeDebug();
  syncViewport();

  let resizeTimer=0;
  const schedule=()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(syncViewport,80);
  };
  window.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  window.addEventListener('pageshow',syncViewport,{passive:true});
  new MutationObserver(syncViewport).observe(app,{attributes:true,attributeFilter:['class']});
})();