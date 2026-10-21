// Forja de Ejércitos · funcionamiento sin conexión
const V='forja-202610211145';
const CORE=['./','index.html','config.js','vendor/supabase.js','data/libros.json','manifest.webmanifest','icons/forja-192.png','icons/forja-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())) });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())) });
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET' || u.hostname.endsWith('supabase.co')) return;           // cuentas: siempre en directo
  if(u.origin===location.origin){                                                         // la app y los libros: primero la red, si no hay, la copia
    e.respondWith(fetch(e.request).then(r=>{ const cp=r.clone(); caches.open(V).then(c=>c.put(e.request,cp)); return r }).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
  } else {                                                                                  // librerías y fuentes externas: la copia si existe
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ const cp=res.clone(); caches.open(V).then(c=>c.put(e.request,cp)); return res })));
  }
});
