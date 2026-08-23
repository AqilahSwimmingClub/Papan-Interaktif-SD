const AWAL_CACHE = 'papan-interaktif-sd-';
const CACHE_SHELL = `${AWAL_CACHE}shell-v2`;
const CACHE_RUNTIME = `${AWAL_CACHE}runtime-v2`;
const BERKAS_ASET = 'pwa-assets.json';

function dalamScope(jalur) {
  return new URL(jalur.replace(/^\//, ''), self.registration.scope).toString();
}

async function simpanRespons(cache, url, respons) {
  if (respons.ok || respons.type === 'opaque') await cache.put(url, respons.clone());
  return respons;
}

async function perbaruiShell() {
  const cache = await caches.open(CACHE_SHELL);
  const responsDaftar = await fetch(dalamScope(BERKAS_ASET), { cache: 'no-store' });
  if (!responsDaftar.ok) throw new Error('Daftar aset PWA tidak dapat dimuat.');
  const salinanDaftar = responsDaftar.clone();
  const daftar = await responsDaftar.json();
  const keluaran = Object.values(daftar).flatMap((entri) => [
    entri.file,
    ...(entri.css ?? []),
    ...(entri.assets ?? []),
  ]);
  const semuaUrl = [
    ...new Set(
      ['./', './index.html', './manifest.webmanifest', './assets/logo-bekasi.png', ...keluaran]
        .filter(Boolean)
        .map(dalamScope),
    ),
  ];

  // Cache lama baru dibersihkan setelah seluruh bundle baru lengkap. Bila satu
  // aset gagal, instalasi/pembaruan ditunda agar aplikasi tidak setengah offline.
  await Promise.all(
    semuaUrl.map(async (url) => {
      const respons = await fetch(url, { cache: 'no-store' });
      if (!respons.ok) throw new Error(`Aset gagal dimuat: ${url}`);
      await cache.put(url, respons);
    }),
  );
  if (!(await cache.match(dalamScope('index.html')))) {
    throw new Error('Shell offline tidak memiliki index.html.');
  }

  // Buang bundle ber-hash lama setelah bundle baru lengkap agar cache tidak
  // tumbuh tanpa batas. Daftar aset sendiri disimpan untuk audit offline.
  const dipertahankan = new Set([...semuaUrl, dalamScope(BERKAS_ASET)]);
  await cache.put(dalamScope(BERKAS_ASET), salinanDaftar);
  const tersimpan = await cache.keys();
  await Promise.all(
    tersimpan
      .filter((permintaan) => !dipertahankan.has(permintaan.url))
      .map((permintaan) => cache.delete(permintaan)),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(perbaruiShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((kunci) =>
          Promise.all(
            kunci
              .filter(
                (nama) =>
                  nama.startsWith(AWAL_CACHE) && ![CACHE_SHELL, CACHE_RUNTIME].includes(nama),
              )
              .map((nama) => caches.delete(nama)),
          ),
        ),
      perbaruiShell().catch(() => undefined),
      self.clients.claim(),
    ]),
  );
});

async function responsNavigasi(permintaan, event) {
  try {
    const respons = await fetch(permintaan);
    const cache = await caches.open(CACHE_SHELL);
    await simpanRespons(cache, dalamScope('index.html'), respons);
    event.waitUntil(perbaruiShell().catch(() => undefined));
    return respons;
  } catch {
    return (
      (await caches.match(dalamScope('index.html'))) ?? (await caches.match(dalamScope('./')))
    );
  }
}

async function responsRentang(permintaan, tersimpan) {
  const rentang = permintaan.headers.get('range');
  if (!rentang || !tersimpan || tersimpan.status !== 200) return tersimpan;
  const isi = await tersimpan.arrayBuffer();
  const cocok = /bytes=(\d+)-(\d*)/.exec(rentang);
  if (!cocok) return tersimpan;
  const awal = Number(cocok[1]);
  const akhir = cocok[2] ? Number(cocok[2]) : isi.byteLength - 1;
  if (awal >= isi.byteLength || akhir < awal) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${isi.byteLength}` },
    });
  }
  const potongan = isi.slice(awal, Math.min(akhir + 1, isi.byteLength));
  return new Response(potongan, {
    status: 206,
    headers: {
      'Content-Range': `bytes ${awal}-${awal + potongan.byteLength - 1}/${isi.byteLength}`,
      'Content-Length': String(potongan.byteLength),
      'Content-Type': tersimpan.headers.get('Content-Type') ?? 'application/octet-stream',
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(responsNavigasi(event.request, event));
    return;
  }

  event.respondWith(
    (async () => {
      const tersimpan = await caches.match(event.request, { ignoreVary: true });
      if (tersimpan) return responsRentang(event.request, tersimpan);
      try {
        const respons = await fetch(event.request);
        const cache = await caches.open(CACHE_RUNTIME);
        await simpanRespons(cache, event.request, respons);
        return respons;
      } catch {
        return new Response('Konten belum tersedia offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    })(),
  );
});
