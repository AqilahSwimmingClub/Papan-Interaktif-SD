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

/** Zona 2 — konfigurasi sekolah. */
export interface Guru {
  id: string;
  sekolah_id: string;
  nama: string;
  peran: 'kepala_sekolah' | 'operator' | 'guru';
  kelas_diampu: number[];
  mapel_diampu: string[];
}

export interface TahunAjaran {
  id: string;
  label: string;
  semester_aktif: 1 | 2;
  tanggal_mulai: string;
  tanggal_selesai: string;
  aktif: boolean;
}

export interface KonfigurasiKurikulumSekolah {
  id: string;
  sekolah_id: string;
  tingkat_kelas: number;
  mapel_kode: string;
  aktif: boolean;
  cabang_kode: string | null;
  nama_kustom: string;
  agama_kode: string | null;
}

/** Zona 3 — isi pembelajaran. */
export type JenisBlokMateri =
  | 'judul'
  | 'teks'
  | 'gambar'
  | 'video'
  | 'audio'
  | 'dokumen'
  | 'aktivitas';

export interface BlokMateri {
  id: string;
  jenis: JenisBlokMateri;
  isi: string;
  urutan: number;
}

export interface Materi {
  id: string;
  tp_id: string;
  judul: string;
  blok: BlokMateri[];
  sumber: 'bawaan' | 'guru' | 'ai';
  perkiraan_menit: number;
  diperbarui: string;
  referensi_bab_id: string | null;
}

export interface MediaPembelajaran {
  id: string;
  jenis: 'gambar' | 'video' | 'audio' | 'pdf' | 'tautan' | 'dokumen';
  nama_berkas: string;
  ukuran_byte: number;
  durasi: number | null;
  tersedia_offline: boolean;
  diunggah_oleh: string;
  tp_id: string | null;
  data_berkas: Blob | null;
}

export type StatusPersetujuan = 'belum_disetujui' | 'disetujui' | 'ditolak';

export interface Lkpd {
  id: string;
  tp_id: string;
  judul: string;
  blok: BlokMateri[];
  jumlah_halaman: number;
  kertas: 'A4' | 'F4';
  mode_cetak: 'hemat_tinta' | 'berwarna';
  prompt_ai_id: string | null;
  status_persetujuan: StatusPersetujuan;
  versi_siswa: string;
  versi_kunci: string;
  referensi_bab_id: string | null;
}

export interface Soal {
  id: string;
  tp_id: string;
  bentuk: string;
  level_kognitif: 'LOTS' | 'MOTS' | 'HOTS';
  teks: string;
  pilihan: string[];
  kunci: string;
  pembahasan: string;
  rubrik: string;
  prompt_ai_id: string | null;
  status_persetujuan: StatusPersetujuan;
  referensi_bab_id: string | null;
}

export interface Asesmen {
  id: string;
  tp_id: string;
  jenis: 'formatif' | 'sumatif';
  soal_id: string[];
  jumlah_butir: number;
  bobot: number;
  referensi_bab_id: string | null;
}

export interface GamePembelajaran {
  id: string;
  tp_id: string;
  tingkat_kelas: number;
  fase_kode: KodeFase;
  mapel_kode: string;
  cp_id: string;
  materi_id: string | null;
  engine_kode: string;
  judul: string;
  tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit';
  mode_permainan: ModePermainanGame;
  durasi_menit: number;
  jumlah_butir: number;
  detik_per_butir: number | null;
  butir: ButirGame[];
  prompt_ai_id: string | null;
  status_persetujuan: StatusPersetujuan;
  jumlah_dimainkan: number;
  referensi_bab_id: string | null;
}

export type ModePermainanGame = 'individu' | 'kelompok' | 'battle' | 'seluruh_kelas';
export type DukunganFaseGame = 'cocok' | 'disederhanakan' | 'tidak';
export type MekanikGame =
  | 'pilihan'
  | 'benar_salah'
  | 'pasangan'
  | 'urutan'
  | 'klasifikasi'
  | 'papan'
  | 'simulasi';

export interface ProfilFaseGame {
  fase_kode: KodeFase;
  jumlah_pilihan: number;
  ukuran_kartu_min: number;
  detik_per_butir: number | null;
  jumlah_butir_maks: number;
  bacakan_wajib: boolean;
  peringkat: 'tidak_ada' | 'kelompok' | 'tiga_teratas_kelas';
}

export interface ButirGame {
  id: string;
  pertanyaan: string;
  pilihan: string[];
  jawaban: string;
  penjelasan: string;
  sumber: 'cp' | 'tp' | 'materi' | 'elemen';
}

export interface GameEngine {
  kode: string;
  nama: string;
  yang_diukur: string;
  mode_didukung: ModePermainanGame[];
  fase_didukung: KodeFase[];
  dukungan_fase: Record<KodeFase, DukunganFaseGame>;
  mapel_cocok: string[];
  kata_kerja_tp: string[];
  mekanik: MekanikGame;
  petunjuk: string;
}

export interface JawabanButirGame {
  butir_id: string;
  jawaban: string;
  benar: boolean;
  skor: number;
}

export interface RingkasanPermainan {
  skor: number;
  skor_maksimal: number;
  jawaban: JawabanButirGame[];
}

export interface TautanTp {
  tp_id: string;
  jenis_isi: 'materi' | 'game' | 'lkpd' | 'soal' | 'asesmen';
  isi_id: string;
  peran: 'utama' | 'pengayaan' | 'remedial';
  dibuat_oleh_ai: boolean;
}

export interface PromptAi {
  id: string;
  teks_guru_utuh: string;
  konteks_json: KonteksKurikulum;
  jenis_keluaran: string;
  kendali_json: Record<string, unknown>;
  riwayat_revisi: string[];
  dibuat_oleh: string;
  waktu: string;
}

/** Zona 4 — kelas, kegiatan, dan hasil. */
export interface Kelas {
  id: string;
  tingkat: number;
  fase_kode: KodeFase;
  tahun_ajaran_id: string;
  rombel: string;
  wali_guru_id: string;
  jumlah_siswa: number;
}

export interface Siswa {
  id: string;
  kelas_id: string;
  nama: string;
  nomor_absen: number;
  kelompok_id: string | null;
  catatan_guru: string;
  perlu_pendampingan: boolean;
}

export interface Kelompok {
  id: string;
  kelas_id: string;
  nama: string;
  semester: 1 | 2;
  poin_total: number;
}

export interface Kehadiran {
  siswa_id: string;
  tanggal: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa';
}

export interface ObjekPapan {
  id: string;
  jenis: 'goresan' | 'teks' | 'bentuk' | 'media' | 'alat_ukur';
  data: string;
  warna: string;
  ukuran: number;
}

export interface HalamanPapan {
  id: string;
  latar: 'kosong' | 'petak' | 'garis' | 'titik';
  objek: ObjekPapan[];
}

export interface SesiPembelajaran {
  id: string;
  tp_id: string;
  kelas_id: string;
  guru_id: string;
  kode_gabung: string;
  waktu_mulai: string;
  waktu_selesai: string | null;
  halaman_papan: HalamanPapan[];
  skor_kelompok: Array<{ kelompok_id: string; skor: number }>;
}

export type StatusKetuntasan = 'tuntas' | 'berkembang' | 'perlu_bimbingan';

export interface HasilBelajar {
  id: string;
  siswa_id: string;
  tp_id: string;
  sesi_id: string;
  jenis_aktivitas: 'game' | 'lkpd' | 'asesmen';
  isi_id: string;
  skor: number;
  skor_maksimal: number;
  ketuntasan: StatusKetuntasan;
  waktu: string;
  dinilai_oleh: string;
}

export interface PoinBadge {
  siswa_id: string;
  poin_total: number;
  badge_diraih: string[];
  riwayat: Array<{ waktu: string; poin: number; alasan: string }>;
}

export interface AntreanAi {
  id: string;
  prompt_ai_id: string;
  status: 'menunggu' | 'jalan' | 'selesai' | 'gagal';
  waktu_dibuat: string;
  percobaan: number;
}

export interface Cadangan {
  id: string;
  waktu: string;
  ukuran_byte: number;
  tujuan: 'berkas' | 'awan';
  cakupan: string[];
  otomatis: boolean;
  /** Paket lokal hanya disimpan untuk cadangan otomatis dan pra-restore. */
  paket?: unknown;
}

export interface IndeksPencarian {
  jenis_isi: string;
  isi_id: string;
  teks_terindeks: string;
  tp_id: string | null;
  kelas: number | null;
  diperbarui: string;
}

/** Zona 5 — referensi pembelajaran. */
export interface ReferensiPembelajaran {
  id: string;
  jenis: 'panduan_resmi' | 'buku_guru' | 'buku_siswa' | 'buku_lain' | 'materi_guru' | 'katalog_resmi';
  judul: string;
  mapel_kode: string | null;
  fase_kode: KodeFase | null;
  kelas_relevan: number[];
  penerbit: string;
  tahun: string;
  versi: string;
  url_sumber: string;
  isbn: string;
  status: 'aktif' | 'arsip';
  tanggal_diperbarui: string;
  lingkup_izin: 'metadata_saja' | 'isi_boleh_disimpan';
  ditambahkan_oleh: string | null;
}

export interface ReferensiBab {
  id: string;
  referensi_id: string;
  nomor_tampil: string;
  judul_bab: string;
  halaman_awal: number | null;
  urutan: number;
  ruang_lingkup: string;
}

export interface PemetaanBabTp {
  referensi_bab_id: string;
  tp_id: string;
  kesesuaian: 'penuh' | 'sebagian' | 'pengayaan';
  dipetakan_oleh: string;
  catatan: string;
}

export interface ReferensiSekolah {
  sekolah_id: string;
  referensi_id: string;
  tingkat_kelas: number;
  utama: boolean;
  aktif: boolean;
  dipilih_oleh: string;
}

/**
 * Zona 5 baru — Buku Referensi sekolah.
 *
 * Rantai: Kelas → Mata Pelajaran → Buku Referensi → Bab → Topik/Lingkup Materi.
 * Seluruh tabel di bawah sengaja dibiarkan kosong sampai buku pelajaran resmi
 * yang dipakai sekolah dimasukkan. CP, TP, kuis, game, LKPD, dan bank soal
 * baru dibuat setelah pemetaan buku tersedia.
 */
export interface BukuReferensi {
  id: string;
  tingkat_kelas: number;
  mapel_kode: string;
  judul: string;
  penulis: string;
  penerbit: string;
  tahun: string;
  edisi: string;
  isbn: string;
  /** Buku utama yang dipakai guru untuk kelas + mapel ini. */
  utama: boolean;
  status: 'aktif' | 'arsip';
  ditambahkan_oleh: string | null;
  ditambahkan_pada: string;
}

export interface BukuBab {
  id: string;
  buku_id: string;
  nomor_tampil: string;
  judul_bab: string;
  halaman_awal: number | null;
  halaman_akhir: number | null;
  urutan: number;
}

export interface BukuTopik {
  id: string;
  bab_id: string;
  nomor_tampil: string;
  judul_topik: string;
  /** Lingkup materi ringkas sebagaimana tertulis pada buku. */
  lingkup_materi: string;
  halaman_awal: number | null;
  urutan: number;
}
