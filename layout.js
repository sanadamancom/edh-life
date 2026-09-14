(()=>{
  const root=document.documentElement;
  const stage=document.getElementById('stage');
  const app=document.getElementById('app');

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
    helpButton.innerHTML=`<svg class="mi" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="36" fill="none" stroke="currentColor" stroke-width="7"/><path d="M35 39c1-10 7-16 16-16 10 0 17 6 17 15 0 7-4 11-10 15-7 5-9 8-9 15" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="49" cy="77" r="4.5" fill="currentColor"/></svg>`;
    settingsButton.before(helpButton);

    const helpOverlay=document.createElement('div');
    helpOverlay.id='helpOverlay';
    helpOverlay.className='ov';
    helpOverlay.innerHTML=`
      <div class="modal helpPanel" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
        <div class="helpHead">
          <h2 id="helpTitle">使い方</h2>
          <span>EDH LIFE COUNTER</span>
        </div>
        <div class="helpGrid">
          <section class="helpCard">
            <h3>ライフ</h3>
            <p><b>中央の大きな数字</b>が現在ライフです。</p>
            <p>左右の <b>−5 / − / ＋ / ＋5</b> でライフを増減します。</p>
            <p>ライフ数字を<b>約0.3秒長押し</b>すると特殊カウンターを開きます。</p>
          </section>
          <section class="helpCard">
            <h3>統率者ダメージ</h3>
            <p>ライフの下にある各カードは、<b>その名前のプレイヤーの統率者から受けたダメージ</b>です。</p>
            <p><b>＋1 / −1</b>で変更すると、ライフも自動で同じ分だけ増減します。18以上は警告表示、21以上で敗北です。</p>
          </section>
          <section class="helpCard">
            <h3>特殊カウンター</h3>
            <p>ライフ長押しから<b>毒・経験・速度</b>を変更できます。0より大きい値はプレイヤー名付近に表示されます。</p>
            <p><b>毒10</b>で敗北、速度は<b>最大4</b>です。</p>
          </section>
          <section class="helpCard">
            <h3>敗北表示</h3>
            <p>ライフ0以下、毒10、統率者ダメージ21以上で盤面が暗くなり、<b>赤い DEFEATED</b> が表示されます。</p>
            <p>敗北後も操作できるので、入力ミスはそのまま修正できます。</p>
          </section>
          <section class="helpCard helpTools">
            <h3>右側のボタン</h3>
            <div class="helpToolsGrid">
              <div class="helpTool"><b>Undo</b>直前の変更を1つ戻します。</div>
              <div class="helpTool"><b>ダイス</b>「1個」または「全員」を選びます。全員では最大値を強調します。</div>
              <div class="helpTool"><b>リセット</b>長押しでライフ40・統率者ダメージ・特殊カウンターを初期化します。名前と色は残ります。</div>
              <div class="helpTool"><b>フルスクリーン</b>対応ブラウザで表示を切り替えます。PWAでは非表示になる場合があります。</div>
              <div class="helpTool"><b>ヘルプ</b>この画面を表示します。</div>
              <div class="helpTool"><b>設定</b>人数、プレイヤー名、色を変更できます。設定内から全リセットもできます。</div>
            </div>
            <p class="helpNote">ライフ・統率者ダメージ・各カウンター・設定は端末内に自動保存されます。</p>
          </section>
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

    helpButton.addEventListener('click',event=>{
      event.stopPropagation();
      openHelp();
    });
    closeButton.addEventListener('click',closeHelp);
    helpOverlay.addEventListener('click',event=>{
      if(event.target===helpOverlay)closeHelp();
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&helpOverlay.classList.contains('show'))closeHelp();
    });
  }

  setupHelp();

  const DESIGN_W=844;
  const BOARD_H=390;
  const BASE_GAME_W=740;

  const viewportProbe=document.createElement('div');
  Object.assign(viewportProbe.style,{
    position:'fixed',
    inset:'0',
    visibility:'hidden',
    pointerEvents:'none',
    margin:'0',
    padding:'0',
    border:'0'
  });
  document.body.appendChild(viewportProbe);

  const safeProbe=document.createElement('div');
  Object.assign(safeProbe.style,{
    position:'fixed',
    visibility:'hidden',
    pointerEvents:'none',
    paddingTop:'env(safe-area-inset-top, 0px)',
    paddingRight:'env(safe-area-inset-right, 0px)',
    paddingBottom:'env(safe-area-inset-bottom, 0px)',
    paddingLeft:'env(safe-area-inset-left, 0px)'
  });
  document.body.appendChild(safeProbe);

  const px=value=>{
    const number=parseFloat(value);
    return Number.isFinite(number)?Math.max(0,number):0;
  };

  function getLayoutViewport(){
    const rect=viewportProbe.getBoundingClientRect();
    return {
      w:Math.max(1,rect.width),
      h:Math.max(1,rect.height),
      x:rect.left,
      y:rect.top
    };
  }

  function getVisibleViewport(){
    const layout=getLayoutViewport();
    const visual=window.visualViewport;
    if(!visual)return layout;

    const visible={
      w:Math.max(1,visual.width),
      h:Math.max(1,visual.height),
      x:Number(visual.offsetLeft)||0,
      y:Number(visual.offsetTop)||0
    };

    const clipped=
      Math.abs(visible.x-layout.x)>.5||
      Math.abs(visible.y-layout.y)>.5||
      visible.w<layout.w-1||
      visible.h<layout.h-1;

    return clipped?visible:layout;
  }

  function getSafeInsets(){
    const style=getComputedStyle(safeProbe);
    return {
      top:px(style.paddingTop),
      right:px(style.paddingRight),
      bottom:px(style.paddingBottom),
      left:px(style.paddingLeft)
    };
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

  function applyLayout(){
    const viewport=getVisibleViewport();
    const safe=getSafeInsets();
    const rotated=isPortraitLayout();

    const shortSide=Math.min(viewport.w,viewport.h);
    const longSide=Math.max(viewport.w,viewport.h);
    const scale=shortSide/BOARD_H;
    const boardW=Math.min(DESIGN_W,longSide/Math.max(scale,.001));

    const safeStart=rotated?safe.top:safe.left;
    const safeEnd=rotated?safe.bottom:safe.right;

    const gutterStart=Math.max(
      8,
      Math.ceil(safeStart/Math.max(scale,.001))+4
    );

    const initialEnd=Math.max(
      46,
      Math.ceil(safeEnd/Math.max(scale,.001))+4
    );

    const initialGameW=Math.max(1,boardW-gutterStart-initialEnd);
    const initialUi=Math.max(.48,Math.min(1,initialGameW/BASE_GAME_W));
    const initialTool=Math.max(.68,initialUi);
    const minimumToolRail=42*initialTool+8;

    const gutterEnd=Math.max(initialEnd,minimumToolRail);
    const gameW=Math.max(1,boardW-gutterStart-gutterEnd);
    const uiScale=Math.max(.48,Math.min(1,gameW/BASE_GAME_W));
    const toolScale=Math.max(.68,uiScale);
    const toolSize=42*toolScale;

    const playerCount=getPlayerCount();
    const playerW=playerCount===2?gameW:gameW/2;
    const rowW=Math.max(1,playerW*.96);
    const baseLife=96*uiScale;
    const textWidthFactor=1.55;
    const sideBudget=220;
    const controlScale=Math.max(
      .38,
      Math.min(uiScale,(rowW-baseLife*textWidthFactor)/sideBudget)
    );
    const lifeSlot=Math.max(1,rowW-sideBudget*controlScale);
    const lifeSize=Math.max(22,Math.min(baseLife,lifeSlot/textWidthFactor));

    const centerX=viewport.x+viewport.w/2;
    const centerY=viewport.y+viewport.h/2;

    root.style.setProperty('--board-w',`${boardW.toFixed(3)}px`);
    root.style.setProperty('--board-scale',scale.toFixed(6));
    root.style.setProperty('--board-rot',rotated?'90deg':'0deg');
    root.style.setProperty('--board-left',`${centerX.toFixed(3)}px`);
    root.style.setProperty('--board-top',`${centerY.toFixed(3)}px`);
    root.style.setProperty('--gutter-start',`${gutterStart.toFixed(3)}px`);
    root.style.setProperty('--gutter-end',`${gutterEnd.toFixed(3)}px`);

    stage.style.setProperty('--ui-scale',uiScale.toFixed(4));
    stage.style.setProperty('--control-scale',controlScale.toFixed(4));
    stage.style.setProperty('--life-size',`${lifeSize.toFixed(3)}px`);
    stage.style.setProperty('--tool-scale',toolScale.toFixed(4));
    stage.style.setProperty('--tool-size',`${toolSize.toFixed(3)}px`);

    root.classList.toggle('stage-rotated',rotated);
    root.classList.toggle('stage-native',!rotated);

    window.EDHStage={
      state:{
        ...viewport,
        safe,
        rotated,
        boardW,
        boardH:BOARD_H,
        scale,
        gutterStart,
        gutterEnd,
        gameW,
        playerW,
        rowW,
        uiScale,
        controlScale,
        lifeSlot,
        lifeSize,
        toolScale
      },
      update:applyLayout
    };
  }

  let resizeTimer=0;
  function schedule(delay=90){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(applyLayout,delay);
  }

  window.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('resize',()=>schedule(),{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>schedule(30),{passive:true});
  window.addEventListener('orientationchange',()=>schedule(160),{passive:true});
  window.addEventListener('pageshow',()=>{
    applyLayout();
    schedule(160);
    setTimeout(applyLayout,420);
  });

  new MutationObserver(()=>schedule(0)).observe(app,{
    attributes:true,
    attributeFilter:['class']
  });

  applyLayout();
})();
