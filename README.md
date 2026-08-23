# Papan Interaktif SD

Platform pembelajaran interaktif SD kelas 1–6 berbasis Kurikulum Merdeka.

Acuan implementasi — dan satu-satunya sumber kebenaran:

1. `MASTER SPECIFICATION FINAL.dc.html`
2. `IMPLEMENTATION HANDOFF FOR CODEX.dc.html`

Berkas desain hi-fi pendamping ada di `Tahap 2A` sampai `Tahap 11`.
**UI/UX terkunci per 23 Agustus 2026.** Perubahan pada arsitektur, UI/UX, atau
daftar fitur memerlukan persetujuan pemilik proyek terlebih dahulu.

---

## Status: Tahap 1 — Fondasi

Yang sudah berdiri pada tahap ini:

| Bagian | Isi |
| --- | --- |
| Fondasi aplikasi | Routing, state dasar, penyimpanan lokal offline-first, struktur komponen, proteksi rute, error handling |
| Layar 28 Opening | Video layar penuh, autoplay tanpa suara, tanpa Skip, tidak melooping, rasio terjaga, dua pengaman wajib |
| Layar 30 Setup Admin | Sekali per perangkat, akun Admin lokal, sandi ber-hash, identitas sekolah opsional |
| Layar 29 Login | Admin/Guru, sesi lokal, Logout, Lupa Password tanpa surel |
| Responsive | Enam titik henti perangkat sesuai handoff |

Belum dikerjakan dan **memang belum boleh** dikerjakan pada tahap ini:
Dashboard, jalur CP/TP, database kurikulum, impor data, AI, game engine,
materi, LKPD, soal, referensi buku, papan interaktif.

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
    tokens.css                 design token §12 + Tahap 11 §05 — terkunci
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
    useAuth.ts
  lib/
    types.ts                   tabel akun, sesi_login, sekolah
    storage/
      db.ts                    IndexedDB + migrasi bernomor
      akunRepo.ts sesiRepo.ts sekolahRepo.ts perangkatRepo.ts
    auth/
      sandi.ts                 PBKDF2-SHA256 210.000 iterasi + imbuhan acak
      validasi.ts              aturan formulir + kekuatan sandi
      authService.ts           setup, masuk, keluar, jeda coba-coba
      keadaanSesi.ts           lima keadaan sesi
    opening/pemutaranOpening.ts  penanda sekali per pembukaan aplikasi
    errors/                    AppError, logger lokal, ErrorBoundary
  components/                  IdentitasPembuat, LayarMemuat, LayarGalat
  features/
    opening/                   layar 28
    auth/                      layar 29, 30, Lupa Password
    dashboard/                 titik sambung Tahap 2 — BUKAN Dashboard
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

## Tahap berikutnya

Ganti `src/features/dashboard/BerandaTerlindungi.tsx` dengan Dashboard Guru
(Tahap 2A layar 1), lalu lanjutkan urutan pengerjaan pada
`IMPLEMENTATION HANDOFF FOR CODEX` bagian 3. Tambahkan tabel kurikulum
sebagai migrasi baru di `src/lib/storage/db.ts` — jangan membongkar migrasi
versi 1.

---

Dirancang & Dikembangkan oleh
**FAHMI DJAWAS, S.Pd.**
© 2026 PAPAN INTERAKTIF SD — Semua Hak Dilindungi
