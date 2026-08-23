/**
 * Bentuk data Zona 6 (akun & sesi) dan bagian Zona 2 yang dipakai Tahap 1.
 * Acuan: MASTER SPECIFICATION FINAL §4 dan Tahap 11 §30.
 */

export type Peran = 'admin' | 'guru';

/** Tabel `akun` — MASTER SPECIFICATION FINAL §4, Zona 6. */
export interface Akun {
  id: string;
  nama: string;
  /** Unik per perangkat. Disimpan huruf kecil. */
  username: string;
  /** Turunan kunci PBKDF2, base64. Tidak pernah teks terbuka. */
  hash_sandi: string;
  /** Imbuhan acak (salt) per akun, base64. */
  imbuhan: string;
  /** Parameter KDF disimpan bersama hash agar biaya kerja dapat dinaikkan kelak. */
  kdf_algoritma: string;
  kdf_iterasi: number;
  peran: Peran;
  aktif: boolean;
  dibuat: string;
  terakhir_masuk: string | null;
  gagal_berurutan: number;
  /** Waktu ISO saat jeda coba-coba berakhir; null bila tidak terkunci. */
  terkunci_sampai: string | null;
}

/** Tabel `sesi_login` — MASTER SPECIFICATION FINAL §4, Zona 6. */
export interface SesiLogin {
  token: string;
  akun_id: string;
  dibuat: string;
  kedaluwarsa: string;
  perangkat: string;
}

/** Tabel `sekolah` — Zona 2. Tahap 1 hanya mengisinya dari Setup Admin. */
export interface Sekolah {
  id: string;
  nama: string;
  npsn: string;
  alamat: string;
  kepala_sekolah: string;
  logo_berkas: string | null;
  kop_cetak: string;
  kertas_bawaan: 'A4' | 'F4';
}

/** Lima keadaan sesi — Tahap 11 §01. */
export type KeadaanSesi =
  | 'belum_setup'
  | 'belum_login'
  | 'login_admin'
  | 'login_guru'
  | 'logout';

export interface SesiAktif {
  akun: Akun;
  sesi: SesiLogin;
}

/** Zona 1 dan titik temu TP yang mulai dipakai pada Tahap 2. */
export type KodeFase = 'A' | 'B' | 'C';

export interface Fase {
  kode: KodeFase;
  nama: string;
  kelas_awal: number;
  kelas_akhir: number;
  warna_penanda: string;
  profil_game: string;
}

export interface JenjangKelas {
  tingkat: number;
  fase_kode: KodeFase;
  nama: string;
}

export type StatusMataPelajaran =
  | 'wajib'
  | 'wajib_sesuai_agama'
  | 'sesuai_konfigurasi_sekolah'
  | 'pilihan_cabang_seni'
  | 'pilihan_cabang_seni_default'
  | 'pilihan';

export interface MataPelajaran {
  kode: string;
  nama: string;
  fase_tersedia: KodeFase[];
  kelas_tersedia: number[];
  status: StatusMataPelajaran;
  punya_cabang: boolean;
  agama_kode: string | null;
  dasar_hukum: string;
}

export interface Agama {
  kode: string;
  nama: string;
  mapel_kode: string;
  aktif_di_sekolah: boolean;
}

export interface CabangSeni {
  kode: string;
  nama: string;
  bawaan: boolean;
}

export interface DokumenKurikulum {
  kode: string;
  judul: string;
  tanggal: string | null;
  versi: string;
  url_sumber: string;
  jumlah_halaman: number | null;
  status_verifikasi: string;
}

export interface CapaianPembelajaran {
  id: string;
  mapel_kode: string;
  fase_kode: KodeFase;
  cabang_kode: string | null;
  agama_kode: string | null;
  teks_capaian: string;
  dokumen_kode: string;
  halaman_lampiran: number | null;
  versi: string;
  terverifikasi: boolean;
}

export type StatusElemen = 'aktif' | 'tidak_berlaku';

export interface ElemenKurikulum {
  id: string;
  cp_id: string;
  nama: string;
  teks_elemen: string;
  urutan: number;
  kelompok: string | null;
  status: StatusElemen;
}

export type SumberTujuanPembelajaran = 'rekomendasi' | 'sekolah';

export interface TujuanPembelajaran {
  id: string;
  elemen_id: string;
  tingkat_kelas: number;
  kode_tampil: string;
  teks_tujuan: string;
  sumber: SumberTujuanPembelajaran;
  dibuat_oleh: string | null;
  semester: 1 | 2 | 'keduanya';
  status: 'aktif' | 'diarsipkan';
  halaman_lampiran: number | null;
}

/**
 * Kontrak konteks tunggal dari IMPLEMENTATION HANDOFF §4. Tahap 2 baru
 * mengisi rantai sampai TP; kolom lanjutan dipertahankan agar modul berikutnya
 * tidak perlu mengubah bentuk objek ini.
 */
export interface KonteksKurikulum {
  tingkat_kelas: number | null;
  fase_kode: KodeFase | null;
  mapel_kode: string | null;
  cabang_kode: string | null;
  agama_kode: string | null;
  cp_id: string | null;
  elemen_id: string | null;
  tp_id: string | null;
  materi_id: string | null;
  referensi_id: string | null;
  referensi_bab_id: string | null;
}
