(()=>{
  const overlay=document.getElementById('counters');
  const panel=overlay?.querySelector('.counterPanel');
  const title=document.getElementById('counterTitle');
  const player=document.getElementById('counterPlayer');
  const close=document.getElementById('counterClose');
  if(!overlay||!panel||!title||!player||!close)return;

  /* Player settings intentionally follows the standard modal layout: title at the
     top, content in the middle, and Close in the bottom action row. */
  if(panel.querySelector('.playerCoreSettings'))return;

  if(!panel.querySelector('.counterStickyHeader')){
    const header=document.createElement('div');
    header.className='counterStickyHeader';
    const heading=document.createElement('div');
    heading.className='counterStickyHeading';
    panel.insertBefore(header,panel.firstChild);
    header.appendChild(heading);
    heading.append(title,player);
    header.appendChild(close);
    close.closest('.acts')?.remove();
  }

  if(!document.getElementById('v2-counter-sticky-header-style')){
    const style=document.createElement('style');
    style.id='v2-counter-sticky-header-style';
    style.textContent=`
      #counters .counterPanel{position:relative}
      #counters .counterStickyHeader{
        position:sticky;
        top:-14px;
        z-index:30;
        min-height:78px;
        margin:-14px -16px 12px;
        padding:14px 72px 10px 16px;
        display:flex;
        align-items:flex-start;
        justify-content:center;
        border-bottom:1px solid rgba(255,255,255,.10);
        border-radius:21px 21px 0 0;
        background:linear-gradient(180deg,rgba(21,25,35,.995),rgba(21,25,35,.96));
        -webkit-backdrop-filter:blur(18px) saturate(130%);
        backdrop-filter:blur(18px) saturate(130%);
        box-shadow:0 8px 18px rgba(0,0,0,.18);
      }
      #counters .counterStickyHeading{
        min-width:0;
        text-align:center;
      }
      #counters .counterStickyHeader #counterTitle{
        margin:0 0 3px;
      }
      #counters .counterStickyHeader #counterPlayer{
        margin:0;
      }
      #counters .counterStickyHeader #counterClose{
        position:absolute;
        top:14px;
        right:16px;
        min-width:48px;
        min-height:48px;
        padding:0 10px;
        display:grid;
        place-items:center;
        font-size:14px;
        border-radius:12px;
      }
    `;
    document.head.appendChild(style);
  }
})();
