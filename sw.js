const CACHE_NAME='edh-life-v52-center-controls';
const APP_SHELL=[
  './',
  './index.html',
  './styles.css?v=33',
  './counters.css?v=34',
  './v2.css?v=1',
  './v2-compact.css?v=2',
  './layout.js?v=30',
  './app.js?v=33',
  './edh-features.js?v=2',
  './multitouch.js?v=4',
  './dice-extra.js?v=1',
  './table-state-hub.js?v=2',
  './v2-compact-interactions.js?v=2',
  './v2-layout.js?v=1',
  './manifest.webmanifest',
  './icon.svg'
];

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
      fetch(event.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>{
      if(cached)return cached;
      return fetch(event.request).then(response=>{
        if(!response||response.status!==200||response.type==='opaque')return response;
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        return response;
      });
    })
  );
});
