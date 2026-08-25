# Kelas 1 Master Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan master referensi dan jalur pembelajaran Kelas 1 dengan pola aman yang sama seperti Kelas 5.

**Architecture:** Referensi Kelas 1 disimpan dalam modul seed terpisah dan disemai idempoten melalui `pastikanKurikulumTersedia()`. Hanya mapel yang memang tersedia di Kelas 1 yang diaktifkan; IPAS, Bahasa Inggris, dan KKA tidak dibuat untuk Kelas 1 karena struktur master tidak menawarkannya. Seni Rupa dipakai sebagai cabang seni bawaan, sementara enam pendidikan agama tetap tersedia sebagai cabang sesuai agama murid.

**Tech Stack:** React, TypeScript, Vite, IndexedDB, Vitest, GitHub Actions.

**Spec:** `uploads/PAPAN_INTERAKTIF_SD_MASTER_DATA_KURIKULUM.json`

## Global Constraints

- Jangan mengubah `main`; semua pekerjaan di `codex/kelas1-master-content`.
- Sumber buku diutamakan SIBI/Kemendikdasmen.
- Rantai isi tetap: Kelas → Mata Pelajaran → Buku Referensi → Bab → Topik → CP → TP.
- Seed harus idempoten dan tidak menghapus data pengguna.
- Kelas 1 tidak memiliki IPAS, Bahasa Inggris, atau KKA pada struktur master saat ini.
- Seni Rupa adalah cabang seni bawaan.

---

### Task 1: Kontrak dan seed referensi Kelas 1

**Files:**
- Create: `src/lib/referensi/kelas1MasterSeed.ts`
- Modify: `src/lib/storage/kurikulumRepo.ts`
- Modify/Test: `src/lib/storage/kurikulumRepo.test.ts`

**Interfaces:**
- Produces: `BUKU_MASTER_KELAS1`, `BAB_MASTER_KELAS1`, `TOPIK_MASTER_KELAS1`, `semaiReferensiMasterKelas1()`.
- Consumes: `BukuReferensi`, `BukuBab`, `BukuTopik`, `TOKO`, `jalankanTransaksi`, `kueri`.

- [ ] Tambahkan test bahwa Kelas 1 memiliki referensi aktif setelah seed dan tidak memiliki buku IPAS/BING/KKA.
- [ ] Verifikasi test gagal sebelum seed Kelas 1 dihubungkan.
- [ ] Tambahkan metadata buku resmi untuk enam agama, Pendidikan Pancasila, Bahasa Indonesia, Matematika, PJOK, dan Seni Rupa.
- [ ] Hubungkan `semaiReferensiMasterKelas1()` ke `pastikanKurikulumTersedia()`.
- [ ] Verifikasi test lulus.

### Task 2: Bab/topik dari sumber yang terverifikasi

**Files:**
- Modify: `src/lib/referensi/kelas1MasterSeed.ts`
- Test: `src/lib/referensi/kelas1MasterSeed.test.ts`

**Interfaces:**
- Produces struktur bab/topik tanpa relasi putus.

- [ ] Tambahkan bab/topik yang benar-benar dapat diverifikasi dari buku siswa/panduan resmi.
- [ ] Jangan mengarang judul bab/topik yang belum didukung sumber.
- [ ] Uji keunikan ID, relasi buku→bab→topik, serta mapel/kelas yang benar.

### Task 3: Navigasi pembelajaran Kelas 1

**Files:**
- Modify/Create pada `src/features/pembelajaran/` sesuai pola Kelas 5.
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/routes/paths.ts`
- Test: rute pembelajaran Kelas 1.

**Interfaces:**
- Consumes konteks Kelas 1 dan mapel terpilih.
- Produces rute aman buku → bab → topik → aktivitas.

- [ ] Tulis test rute Kelas 1.
- [ ] Implementasikan navigasi dengan profil Fase A: visual, teks sedikit, satu langkah.
- [ ] Pastikan IPAS/BING/KKA tidak muncul pada Kelas 1.

### Task 4: Quality gate final

**Files:**
- Modify workflow hanya jika dibutuhkan untuk mencakup Kelas 1.

- [ ] Jalankan typecheck.
- [ ] Jalankan lint.
- [ ] Jalankan seluruh test.
- [ ] Jalankan production build.
- [ ] Audit relasi buku/bab/topik tanpa orphan.
- [ ] Selesaikan hanya jika seluruh quality gate hijau.
