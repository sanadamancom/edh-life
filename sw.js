const CACHE_NAME='edh-life-v133-stable-orientation-geometry';
const APP_SHELL=[
  './',
  './index.html',
  './styles.css?v=34',
  './counters.css?v=34',
  './v2.css?v=9',
  './boot-splash.css?v=1',
  './v2-base.css?v=1',
  './v2-compact.css?v=13',
  './v2-utility.css?v=4',
  './v2-responsive.css?v=4',
  './v2-owner-status.css?v=5',
  './v2-polish.css?v=3',
  './v2-seatmap.css?v=2',
  './v2-life-surface.css?v=5',
  './v2-results.css?v=2',
  './layout.js?v=31',
  './app.js?v=34',
  './edh-features.js?v=2',
  './multitouch.js?v=6',
  './dice-extra.js?v=1',
  './viewport-sync.js?v=4',
  './v2-fluid-scale.js?v=13',
  './v2-life-stability.js?v=1',
  './v2-compact-interactions.js?v=8',
  './v2-utility-behavior.js?v=7',
  './v2-quick-dice-coin.js?v=5',
  './v2-coin-overlay-fix.js?v=3',
  './v2-commander-owner-settings.js?v=6',
  './v2-counter-sticky-header.js?v=2',
  './v2-layout.js?v=4',
  './manifest.webmanifest',
  './icon.svg'
];
const NETWORK_FIRST_DESTINATIONS=new Set(['style','script','worker']);

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>Promise.all(APP_SHELL.map(async url=>{
        const response=await fetch(url,{cache:'reload'});
        if(!response.ok)throw new Error(`Failed to cache ${url}: ${response.status}`);
        await cache.put(url,response);
      })))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request,{cache:'reload'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  if(event.request.url.startsWith(self.location.origin)&&NETWORK_FIRST_DESTINATIONS.has(event.request.destination)){
    event.respondWith(
      fetch(event.request,{cache:'reload'})
        .then(response=>{
          if(response&&response.status===200&&response.type!=='opaque'){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
          }
          return response;
        })
        .catch(()=>caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request))
  );
});
