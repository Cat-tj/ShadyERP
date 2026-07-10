const CACHE_VERSION = "altora-v3";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const PRECACHE_URLS = ["/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function isImmutableStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:png|jpg|jpeg|svg|webp|avif|ico|woff2?)$/.test(url.pathname)
  );
}

function isLocalDevOrigin(url) {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Data & auth endpoints selalu ambil fresh dari server — jangan pernah cache.
  if (url.pathname.startsWith("/api/")) return;

  // Aset statis (JS/CSS hash, font, gambar) aman di-cache selamanya karena
  // nama filenya berubah tiap build — cache-first bikin load berikutnya instan.
  if (isImmutableStaticAsset(url)) {
    if (isLocalDevOrigin(url) && url.pathname.startsWith("/_next/static/")) {
      event.respondWith(
        fetch(request).catch(() => caches.match(request).then((cached) => cached ?? Response.error()))
      );
      return;
    }

    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // Halaman (HTML/navigasi) berisi data per-tenant yang harus selalu fresh,
  // jadi network-first. Response sukses tetap disimpan sebagai fallback supaya
  // POS yang sudah pernah dibuka bisa tetap tampil saat koneksi putus.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(PAGE_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? Response.error()))
    );
  }
});
