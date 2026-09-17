(()=>{
  const coinButton=document.getElementById('coinQuick');
  const stage=document.getElementById('stage');
  if(!coinButton||!stage)return;

  let overlay=document.getElementById('coinOverlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='coinOverlay';
    overlay.setAttribute('aria-hidden','true');
    stage.appendChild(overlay);
  }

  const style=document.createElement('style');
  style.id='v2-coin-overlay-fix-style';
  style.textContent=`
    #coinOverlay{
      position:absolute;
      inset:0;
      z-index:31;
      overflow:hidden;
      pointer-events:none
    }
    #coinOverlay .coinOverlayResult{
      position:absolute;
      inset:0;
      pointer-events:none
    }
    #coinOverlay .coinOverlayAnchor{
      position:absolute;
      left:50%;
      top:50%;
      width:clamp(132px,calc(var(--tool-size) * 3.18),164px);
      height:clamp(132px,calc(var(--tool-size) * 3.18),164px);
      transform:translate(-50%,-50%)
    }
    #coinOverlay .coinOverlayFlight,
    #coinOverlay .coinOverlaySettled{
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
      transform-origin:center;
      transition:none!important;
      animation:none!important
    }
    #coinOverlay .coinOverlayFlight{will-change:transform}
    #coinOverlay .coinOverlaySettled{display:none}
    #coinOverlay .coinOverlayResult.settled .coinOverlayFlight{display:none}
    #coinOverlay .coinOverlayResult.settled .coinOverlaySettled{display:block}

    #coinOverlay .coinOverlayFace{
      position:absolute;
      inset:0;
      display:grid;
      place-items:center;
      overflow:hidden;
      border:4px solid #f1d47e;
      border-radius:50%;
      background:
        radial-gradient(circle at 34% 27%,rgba(255,255,255,.76) 0 4%,transparent 5%),
        radial-gradient(circle at 38% 34%,#ffe7aa 0 8%,#dbaa42 36%,#a66d17 68%,#683d08 100%);
      color:#5a3308;
      box-shadow:
        inset 0 0 0 3px rgba(83,45,5,.62),
        inset 0 0 0 8px rgba(255,232,164,.34),
        inset 0 0 22px rgba(61,31,2,.62),
        0 7px 14px rgba(0,0,0,.26)
    }
    #coinOverlay .coinOverlayFace::before{
      content:"";
      position:absolute;
      inset:9px;
      border:2px solid currentColor;
      border-radius:50%;
      opacity:.42
    }
    #coinOverlay .coinOverlayFace.tails{
      color:#332d12;
      border-color:#d8c683;
      background:
        radial-gradient(circle at 34% 27%,rgba(255,255,255,.62) 0 4%,transparent 5%),
        radial-gradient(circle at 38% 34%,#e4d79c 0 8%,#b49a50 36%,#75602c 68%,#433613 100%)
    }
    #coinOverlay .coinOverlayFace svg{
      position:relative;
      z-index:1;
      width:54%;
      height:54%;
      transform:translateY(-8%);
      fill:none;
      stroke:currentColor;
      stroke-width:34;
      stroke-linecap:round;
      stroke-linejoin:round;
      filter:drop-shadow(0 2px 0 rgba(255,244,201,.42))
    }
    #coinOverlay .coinOverlayWord{
      position:absolute;
      left:50%;
      bottom:13%;
      z-index:2;
      min-width:44px;
      padding:3px 9px 4px;
      transform:translateX(-50%);
      border:1px solid currentColor;
      border-radius:999px;
      background:rgba(255,242,194,.32);
      box-shadow:0 1px 0 rgba(255,255,255,.18);
      font-size:clamp(17px,calc(var(--tool-size) * .46),22px);
      font-weight:950;
      line-height:1;
      text-align:center;
      text-shadow:0 1px 0 rgba(255,255,255,.42)
    }
    #coinOverlay .coinOverlayShadow{
      position:absolute;
      left:50%;
      top:calc(50% + 78px);
      width:clamp(96px,calc(var(--tool-size) * 2.4),126px);
      height:22px;
      transform:translate(-50%,-50%);
      border-radius:50%;
      background:rgba(0,0,0,.46);
      filter:blur(8px);
      opacity:.68;
      will-change:transform,opacity
    }
  `;
  document.head.appendChild(style);

  const randomInt=max=>{
    if(window.crypto?.getRandomValues){
      const value=new Uint32Array(1);
      crypto.getRandomValues(value);
      return value[0]%max;
    }
    return Math.floor(Math.random()*max);
  };

  const art=side=>side==='heads'
    ?`<svg viewBox="0 0 512 512" aria-hidden="true"><circle cx="256" cy="220" r="72"></circle><path d="M256 43v55M256 342v55M79 220h55M378 220h55M131 95l39 39M342 306l39 39M381 95l-39 39M170 306l-39 39"></path></svg>`
    :`<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M329 77c-96 19-168 103-168 204 0 61 27 117 70 155-93-12-165-91-165-187 0-103 83-186 186-186 28 0 54 5 77 14Z"></path><path d="M341 181l17 36 39 6-28 27 7 39-35-18-35 18 7-39-28-27 39-6 17-36Z"></path></svg>`;

  const face=side=>{
    const label=side==='heads'?'表':'裏';
    return `<div class="coinOverlayFace ${side}">${art(side)}<span class="coinOverlayWord">${label}</span></div>`;
  };
  const clearCoin=()=>{overlay.replaceChildren()};

  function toss(){
    clearCoin();
    document.querySelectorAll('.coinTossResult').forEach(node=>node.remove());

    const side=randomInt(2)===0?'heads':'tails';
    const label=side==='heads'?'表':'裏';
    const result=document.createElement('div');
    result.className='coinOverlayResult';
    result.dataset.side=side;
    result.innerHTML=`
      <div class="coinOverlayShadow"></div>
      <div class="coinOverlayAnchor">
        <div class="coinOverlayFlight">${face('heads')}</div>
        <div class="coinOverlaySettled"></div>
      </div>`;
    overlay.appendChild(result);

    const flight=result.querySelector('.coinOverlayFlight');
    const settled=result.querySelector('.coinOverlaySettled');
    const shadow=result.querySelector('.coinOverlayShadow');
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let finished=false;
    const finish=()=>{
      if(finished||!result.isConnected)return;
      finished=true;
      flight.style.display='none';
      flight.style.transform='';
      flight.style.willChange='auto';
      settled.innerHTML=face(side);
      result.classList.add('settled');
      shadow.style.transform='translate(-50%,-50%) scaleX(1)';
      shadow.style.opacity='.68';
      shadow.style.willChange='auto';
      result.setAttribute('aria-label',`コイントス ${label}`);
    };

    if(reduced){finish();return}

    const duration=920;
    const turns=side==='heads'?4:4.5;
    const started=performance.now();
    let shown='heads';

    const frame=now=>{
      if(finished||!result.isConnected)return;
      const t=Math.min(1,(now-started)/duration);
      const phase=t*turns*2*Math.PI;
      const cosine=Math.cos(phase);
      const projected=Math.max(.16,Math.abs(cosine));
      const next=cosine>=0?'heads':'tails';
      if(next!==shown){
        shown=next;
        flight.innerHTML=face(shown);
      }

      const arc=Math.sin(Math.PI*t);
      const y=-(122*arc);
      flight.style.transform=`translateY(${y.toFixed(1)}px) scaleY(${projected.toFixed(3)})`;

      const shadowScale=.44+(.56*(1-arc));
      shadow.style.transform=`translate(-50%,-50%) scaleX(${shadowScale.toFixed(3)})`;
      shadow.style.opacity=String((.22+.46*(1-arc)).toFixed(3));

      if(t<1)requestAnimationFrame(frame);
      else finish();
    };

    requestAnimationFrame(frame);
    setTimeout(finish,duration+100);
    navigator.vibrate?.(18);
  }

  coinButton.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    toss();
  },true);

  document.addEventListener('pointerdown',event=>{
    if(!overlay.firstChild)return;
    if(coinButton.contains(event.target))return;
    clearCoin();
  },true);
})();