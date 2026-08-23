# Paket Data Kurikulum Papan Interaktif SD — v1

## Status nyata
- CP non-Agama SD: **29/29 terisi** dari Keputusan Kepala BSKAP 046/H/KR/2025 (sumber resmi).
- Elemen non-Agama: **125 baris**.
- TP Rekomendasi: **212 baris**, dibuat sebagai turunan operasional dari CP; **bukan TP resmi pemerintah**.
- CP Agama: **18 baris sengaja PENDING**, karena Keputusan Kepala BKPDM 020/2026 mengubah khusus Agama dan Budi Pekerti. Keberadaan dan ruang lingkup perubahan sudah terverifikasi di siaran pers resmi Kemendikdasmen, tetapi teks keputusan langsung belum ditemukan pada URL resmi yang dapat diakses saat paket ini dibuat. Data agama lama dari 046/2025 tidak dimasukkan agar aplikasi tidak memakai CP kedaluwarsa.
- Referensi: indeks Panduan Mapel resmi + beberapa PDF resmi terverifikasi + katalog SIBI.

## Prinsip integritas
1. CP resmi tidak diparafrasekan sebagai sumber resmi.
2. TP diberi label TP Rekomendasi.
3. Buku berhak cipta tidak disalin penuh; hanya metadata/tautan/pemetaan yang disiapkan.
4. Baris PENDING tidak boleh digunakan AI sebagai kutipan resmi.

## Berkas Tahap 10
01-dokumen.json, 02-mapel.json, 03-cp.csv, 04-elemen.csv, 05-tp-rekomendasi.csv, 06-referensi.csv, 07-referensi-bab.csv, 08-materi.csv, 09-pemetaan.csv, plus kurikulum_sd_import.json.

## Catatan penting untuk Codex/Claude
Importer harus menolak CP Agama yang kosong dan berstatus pending. Begitu PDF resmi 020/2026 tersedia, isi 18 CP agama dari dokumen tersebut, audit 47/47, lalu baru tandai database kurikulum final.

## Audit parser
CP terverifikasi: 29; elemen: 125; TP rekomendasi: 212; isu parser: 0.
