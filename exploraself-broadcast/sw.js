const CACHE='broadcast-preview-v1';
const SHELL=['/','/index.html','/style.css','/app.js','/assets/fonts.css','/assets/logo.webp','/assets/icon-192.png','/assets/icon-512.png','/assets/cover.webp','/assets/leadionaire.svg','/manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==location.origin)return;
 if(url.pathname==='/api/news'){
  e.respondWith(fetch(e.request).then(async r=>{if(!r.ok)throw Error('Unavailable');const cache=await caches.open(CACHE);cache.put(e.request,r.clone());return r;}).catch(async()=>{const cached=await caches.match(e.request);if(!cached)return new Response(JSON.stringify({error:'Offline. No saved edition yet.'}),{status:503,headers:{'Content-Type':'application/json'}});const data=await cached.json();return new Response(JSON.stringify({...data,stale:true,offline:true}),{headers:{'Content-Type':'application/json'}});}));return;
 }
 e.respondWith(fetch(e.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE);c.put(e.request,r.clone());}return r;}).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('/'):Response.error()))));
});
