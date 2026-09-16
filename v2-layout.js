(()=>{
  const style=document.createElement('style');
  style.textContent=`
    /* v2 full-bleed board: player backgrounds reach the screen edges. */
    html.v2-portrait #app,
    html.v2-portrait .diceLayer{
      inset:0!important;
    }

    /* Top-side players are rotated 180deg, so pre-rotation bottom padding becomes visual top padding. */
    html.v2-portrait #app.c4 .p:nth-child(1) .pc,
    html.v2-portrait #app.c4 .p:nth-child(2) .pc,
    html.v2-portrait #app.c3 .p:nth-child(1) .pc,
    html.v2-portrait #app.c2 .p:nth-child(1) .pc{
      padding-bottom:calc(var(--v2-panel-pad) + var(--v2-safe-top))!important;
    }

    /* Keep bottom-player controls clear of the floating toolbar/home indicator without reserving a black band. */
    html.v2-portrait #app.c4 .p:nth-child(3) .pc,
    html.v2-portrait #app.c4 .p:nth-child(4) .pc,
    html.v2-portrait #app.c3 .p:nth-child(2) .pc,
    html.v2-portrait #app.c3 .p:nth-child(3) .pc,
    html.v2-portrait #app.c2 .p:nth-child(2) .pc{
      padding-bottom:calc(var(--v2-panel-pad) + var(--v2-safe-bottom) + var(--tool-size) + 12px)!important;
    }

    /* Keep the floating tool rail inside the home-indicator safe area. */
    html.v2-portrait #tools{
      bottom:calc(var(--v2-safe-bottom) + 5px)!important;
    }
  `;
  document.head.appendChild(style);
})();
