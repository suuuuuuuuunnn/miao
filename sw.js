const CACHE_NAME = 'tasklist-v1';
const ASSETS = [
  './',
  './工作清单PWA.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 安装：预缓存核心文件
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求：缓存优先，离线可用
self.addEventListener('fetch', e => {
  // 只处理同源 GET 请求
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      // 动态缓存新请求的资源
      if (resp.ok) {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return resp;
    }).catch(() => {
      // 离线降级：如果是导航请求，返回缓存的 HTML
      if (e.request.mode === 'navigate') {
        return caches.match('./工作清单PWA.html');
      }
    }))
  );
});
