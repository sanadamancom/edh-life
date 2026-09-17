(()=>{
  const root=document.documentElement;
  const stage=document.getElementById('stage');
  const app=document.getElementById('app');
  if(!root||!stage||!app)return;

  root.classList.add('layout-vertical-v2','stage-native');
  root.classList.remove('v2-portrait','v2-landscape','v2-compact','v2-device-landscape','stage-rotated');

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
          <section class="helpCard"><h3>ライフ</h3><p><b>大きな数字</b>が現在ライフです。</p><p><b>− / ＋</b>で1点ずつ増減。長押しで連続入力できます。</p><p>ライフ数字を長押しすると、毒・経験・速度を編集できます。</p></section>
          <section class="helpCard"><h3>統率者ダメージ</h3><p>各カードは、そのプレイヤーが相手の統率者から受けたダメージです。</p><p>カードをタップで+1。長押しすると減算・Partner・Commander Taxを編集できます。</p></section>
          <section class="helpCard"><h3>特殊カウンター</h3><p>毒・経験・速度は、値がある時だけプレイヤー名付近に表示します。</p><p>毒10、ライフ0、同一統率者から21点で敗北表示になります。</p></section>
          <section class="helpCard helpTools"><h3>操作ボタン</h3><div class="helpToolsGrid">
            <div class="helpTool"><b>Undo</b>直前の変更を戻す</div>
            <div class="helpTool"><b>ダイス</b>タップでD6、長押しでその他</div>
            <div class="helpTool"><b>コイン</b>コイントス</div>
            <div class="helpTool"><b>リセット</b>長押しでゲーム値を初期化</div>
            <div class="helpTool"><b>フルスクリーン</b>対応環境で切替</div>
            <div class="helpTool"><b>設定</b>人数・名前・色を変更</div>
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

  function setupGeometryDebug(){
    if(new URLSearchParams(location.search).get('debug')!=='safe')return;
    const debug=document.createElement('pre');
    debug.id='safeAreaDebug';
    debug.style.cssText='position:fixed;left:8px;top:8px;z-index:99999;pointer-events:none;margin:0;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.72);color:#fff;font:700 11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap';
    document.body.appendChild(debug);

    const update=()=>{
      const state=window.EDHStage?.state;
      const vv=window.visualViewport;
      if(!state){debug.textContent='geometry: waiting';return}
      debug.textContent=[
        `board: ${Math.round(state.boardW)} × ${Math.round(state.boardH)}`,
        `visible: ${Math.round(state.w)} × ${Math.round(state.viewportH)}`,
        `tail: ${Math.round(state.omittedBottomSafe||0)}`,
        `safe: ${Math.round(state.safe?.top||0)} / ${Math.round(state.safe?.right||0)} / ${Math.round(state.safe?.bottom||0)} / ${Math.round(state.safe?.left||0)}`,
        `player: ${Math.round(state.playerW)} × ${Math.round(state.playerH)}`,
        `visualViewport: ${vv?`${Math.round(vv.width)} × ${Math.round(vv.height)}`:'n/a'}`,
        `screen: ${screen.width} × ${screen.height}`,
        `standalone: ${state.standalone}`
      ].join('\n');
    };
    window.addEventListener('edh-v2-layout',update);
    update();
  }

  /* Geometry is deliberately not calculated here. viewport-sync.js is the one
     owner of board size, player size and safe-area geometry. */
  setupHelp();
  setupGeometryDebug();
})();
