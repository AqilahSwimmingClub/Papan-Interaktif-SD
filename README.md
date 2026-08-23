# Papan Interaktif SD

Platform pembelajaran interaktif SD kelas 1–6 berbasis Kurikulum Merdeka.

Acuan implementasi — dan satu-satunya sumber kebenaran:

1. `MASTER SPECIFICATION FINAL.dc.html`
2. `IMPLEMENTATION HANDOFF FOR CODEX.dc.html`

Berkas desain hi-fi pendamping ada di `Tahap 2A` sampai `Tahap 11`.
**UI/UX terkunci per 23 Agustus 2026.** Perubahan pada arsitektur, UI/UX, atau
daftar fitur memerlukan persetujuan pemilik proyek terlebih dahulu.

---

## Status: Tahap 11 — Final

Yang sudah berdiri sampai tahap ini:

| Bagian | Isi |
| --- | --- |
| Fondasi aplikasi | Routing, state dasar, penyimpanan lokal offline-first, struktur komponen, proteksi rute, error handling |
| Layar 28 Opening | Video layar penuh, autoplay tanpa suara, tanpa Skip, tidak melooping, rasio terjaga, dua pengaman wajib |
| Layar 30 Setup Admin | Sekali per perangkat, akun Admin lokal, sandi ber-hash, identitas sekolah opsional |
| Layar 29 Login | Admin/Guru, sesi lokal, Logout, Lupa Password tanpa surel |
| Dashboard Guru | Kerangka kerja Guru adaptif, keadaan jadwal kosong, ringkasan kurikulum nyata, pilihan kelas |
| Navigasi kurikulum | Dashboard → Kelas → Mapel → Elemen/CP → TP → tujuan fitur pembelajaran |
| Database kurikulum | IndexedDB v4: 38 tabel domain dalam enam zona + penanda perangkat; seed offline final 47 CP, 221 elemen, 212 TP Rekomendasi |
| CP Agama | 18 CP enam agama × tiga fase dari dataset final Nomor 020 Tahun 2026; tanpa TP rekaan |
| Integritas data | Audit relasi kelas → fase → mapel → elemen → CP → TP → materi/referensi, deteksi relasi putus dan duplikat teknis |
| Konten lokal | Editor materi tujuh blok, kaitan TP, metadata tujuh referensi final repository, dan indeks pencarian offline |
| Layar pelengkap | Kelompok siswa, rekap CP/TP, media, pencarian, profil, backup/restore, status offline/PWA, Mode Siswa, dan Mode Kelas |
| Papan interaktif | 8 alat utama + 16 alat tambahan, halaman, undo/redo, skor kelompok, timer, undi nama, dan penyimpanan sesi lokal |
| State lokal | Konteks kurikulum per akun, kelas/siswa/kelompok, materi/media, hasil, pencarian, dan cadangan tersimpan lokal |
| Responsive | HP 6″ portrait/landscape, tablet 11″ portrait/landscape, desktop 14″, Full HD, dan penskalaan 4K |
| Offline/PWA | Manifest, service worker produksi, cache shell/runtime, status penyimpanan, serta antrean AI lokal |
| Finalisasi PWA | Manifest installable berikon final, precache seluruh bundle produksi, fallback navigasi, dukungan range video Opening, pembaruan cache aman, dan tombol pemasangan saat tersedia |
| Finalisasi lokal | Cadangan otomatis harian tersimpan di IndexedDB, antrean AI siap berjalan saat reconnect setelah pemroses Studio AI dipasang, serta pemantauan penyimpanan per jenis isi |
| Akun lokal | Admin dapat membuat, mengaktifkan/nonaktifkan, dan mengatur ulang sandi Guru; rute Kelola Akun dijaga pada lapisan rute |
| Identitas final | Halaman Tentang Aplikasi memakai komponen identitas pembuat tiga baris yang sama dengan Login dan Setup Admin |
| Pustaka game | 30 engine reusable, profil Fase A/B/C, empat penyaring, katalog minimal enam game per TP, runner layar penuh, dan penyimpanan hasil Mode Siswa |
| Kontrak isi aktif | Materi, game, LKPD, soal, dan asesmen memakai satu pembaca rantai kelas → fase → mapel → elemen → CP → TP |
| Multi-referensi | Referensi utama/pendamping, metadata bab/unit, relasi banyak-ke-banyak Bab → TP, dan pembatasan sumber metadata-saja |
| Impor kurikulum | Parser JSON/CSV 01–09, preview per baris, verifikasi operator, sepuluh aturan penolakan, versioning, dan transaksi rollback atomik |

Belum dikerjakan dan **memang tidak termasuk Tahap 11**: Studio AI/AI live,
generator final LKPD/soal/asesmen, dan pelaporan lanjutan.
Data yang belum diverifikasi operator dapat ditampilkan untuk pemeriksaan, tetapi
tidak dapat dipakai sebagai konteks atau sitasi AI.

---

## Menjalankan

```bash
npm install
npm run dev        # server pengembangan
npm run build      # typecheck + build produksi ke dist/
npm run preview    # meninjau hasil build
npm run lint       # eslint
npm run typecheck  # tsc -b
npm run test       # vitest (sekali jalan)
```

Akar proyek Vite adalah akar repositori supaya aset final di `assets/`
(`login-bg.png`, `opening.mp4`, `logo-tutwuri.png`, `logo-bekasi.png`)
dipakai langsung tanpa penggandaan.

---

## Struktur

```
src/
  main.tsx                     titik masuk, BrowserRouter
  App.tsx                      ErrorBoundary + AuthProvider + rute
  styles/
    tokens.css                 design token §12 + skala perangkat — terkunci
    base.css                   reset, fokus, target sentuh
  routes/
    paths.ts                   peta rute + daftar rute terbuka
    AppRoutes.tsx              tabel rute
    GerbangAwal.tsx            "/" → Opening → Setup Admin / Login / Dasbor
    RuteTerlindungi.tsx        penjagaan sesi + peran
    RuteLapisanMasuk.tsx       penjaga Opening/Setup/Login/Lupa Password
  state/
    AuthContext.ts             bentuk nilai auth
    AuthProvider.tsx           keadaan sesi, setup, masuk, keluar
    KurikulumProvider.tsx      seed + konteks kurikulum persisten per akun
    useAuth.ts useKurikulum.ts
  lib/
    types.ts                   kontrak 38 tabel domain dan tipe aplikasi
    storage/
      db.ts                    IndexedDB + migrasi bernomor v1–v4
      kurikulumRepo.ts         seed dataset final
      kurikulumAdminRepo.ts    audit relasi, TP sekolah, materi/referensi
      kelasRepo.ts             kelas, siswa, kelompok, hasil, sesi papan
      pelengkapRepo.ts         profil, media, cari, backup/restore, offline
      gameRepo.ts              katalog game dinamis, relasi, hasil siswa
      isiRepo.ts               pembaca CP/TP aktif dan gerbang sitasi AI
      referensiRepo.ts         referensi utama/pendamping dan Bab → TP
      akunRepo.ts sesiRepo.ts sekolahRepo.ts perangkatRepo.ts
    auth/
      sandi.ts                 PBKDF2-SHA256 210.000 iterasi + imbuhan acak
      validasi.ts              aturan formulir + kekuatan sandi
      authService.ts           setup, masuk, keluar, jeda coba-coba
      keadaanSesi.ts           lima keadaan sesi
    opening/pemutaranOpening.ts  penanda sekali per pembukaan aplikasi
    gameEngines.ts             registry dan profil 30 engine reusable
    kurikulumImport.ts         parser, preview, validasi, impor atomik
    errors/                    AppError, logger lokal, ErrorBoundary
  components/                  IdentitasPembuat, LayarMemuat, LayarGalat
  features/
    opening/                   layar 28
    auth/                      layar 29, 30, Lupa Password
    dashboard/                 Dashboard Guru
    guru/                      kerangka adaptif dan menu lengkap
    kurikulum/                 pilih Kelas/Mapel, CP/TP, basis data, TP sekolah, muat CP
    pembelajaran/              editor Materi tujuh blok
    pelengkap/                 sembilan layar pelengkap Tahap 5
    papan/                     papan interaktif 24 alat Tahap 6
    game/                      katalog dan runner game layar penuh
    referensi/                 referensi pembelajaran dan pemetaan Bab → TP
```

---

## Kontrak yang tidak boleh dilanggar

**Penjagaan sesi.** Hanya `/pembuka`, `/setup-admin`, `/masuk`, dan
`/lupa-password` terbuka tanpa sesi. Rute lain ditolak di lapisan rute
(`RuteTerlindungi`), bukan disembunyikan dari menu. Rute tahap berikutnya
ditambahkan **di dalam** `RuteTerlindungi`.

**Sandi.** Selalu lewat `lib/auth/sandi.ts`. Tidak ada kolom teks terbuka,
tidak ada hash cepat. Lima kegagalan berurutan memicu jeda menaik dari
30 detik sampai 300 detik.

**Identitas pembuat.** Selalu komponen `IdentitasPembuat` — satu container,
tiga baris, satu kolom rata tengah, pada setiap titik henti. Tata letak
kiri-kanan atau `space-between` ditolak. Baris hak cipta tidak boleh
dipendekkan.

**Identitas sekolah.** Tidak pernah ditulis di kode. Seluruhnya dari tabel
`sekolah` dan `guru`.

**Opening.** Tidak ada tombol Skip, Lewati, atau tutup; Esc, klik, dan
sentuhan tidak melewatkan video. Dua pengaman wajib tetap ada: video yang
gagal dimuat langsung meneruskan ke Login, dan batas waktu aman
durasi + 5 detik meneruskan sendiri.

**Batas offline.** Hanya pemanggilan AI, pemuatan CP, dan salinan awan yang
boleh memerlukan jaringan. Kode baru yang memerlukan jaringan di luar
ketiganya adalah pelanggaran.

---

## Rumus tata letak Login — jangan menyalin angka px

| Bidang | Rumus | Titik fokus |
| --- | --- | --- |
| Mendatar, tinggi ≥ 500px | `max(calc(100vh * 0.839), 55vw)` | `50% 30%` |
| Mendatar, tinggi < 500px | `calc(100vh * 0.839)` | `50% 30%` |
| Tegak, HP | `min(calc(100vw / 0.839), 44vh)` | `50% 30%` |
| Tegak, tablet | `min(calc(100vw / 0.839), 68vh)` + kartu 536px | `50% 26%` |

0,839 adalah rasio asli gambar 1149 ÷ 1369. Angka px pada maket hanya benar
pada satu lebar layar; yang disalin adalah rumusnya beserta `object-position`.

Hasil verifikasi di peramban sungguhan:

| Perangkat | Panel visual | Pembagian |
| --- | --- | --- |
| Laptop 1440×900 | 792px | 55% |
| Papan 75" 1920×1080 | 1056px | 55% |
| Tablet landscape 1194×834 | 700px (lantai rasio menang, gambar utuh) | 59% |
| HP landscape 844×390 | 327px (gambar utuh tanpa potongan) | 39% |
| HP portrait 390×844 | pita 371px | — |
| Tablet portrait 834×1112 | pita 756px, kartu 536px, tepi atas 44% | — |

Pada tablet portrait kartu login berhenti di 44% tinggi layar sehingga papan
nama sekolah, logo Kabupaten Bekasi, bendera, kedua wajah, bahu, dan kedua
tangan terangkat beserta api birunya tetap terlihat penuh.

---

## Status handoff

Tahap 11 berhenti pada finalisasi PWA/offline, lapisan masuk, autentikasi lokal,
dan theme final. Studio AI/AI live serta pelaporan lanjutan tetap pekerjaan
terpisah dan tidak dikerjakan pada tahap ini. Migrasi versi 1–4, seed kurikulum,
CP/TP, multi-referensi, dan 30 game engine tetap dipertahankan.

---

Dirancang & Dikembangkan oleh
**FAHMI DJAWAS, S.Pd.**
© 2026 PAPAN INTERAKTIF SD — Semua Hak Dilindungi
