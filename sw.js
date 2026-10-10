const CACHE="liveops-en-v1";
const CORE=["./","index.html","manifest.webmanifest","favicon.png","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png","icons/maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // network first for the page so updates arrive, cache fallback offline
    if(req.mode==="navigate"){e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put("index.html",c));return r;}).catch(()=>caches.match("index.html")));return;}
    e.respondWith(caches.match(req).then(r=>r||fetch(req)));return;
  }
  if(/fonts\.(googleapis|gstatic)\.com/.test(url.host)){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));return res;}).catch(()=>r)));
  }
});
