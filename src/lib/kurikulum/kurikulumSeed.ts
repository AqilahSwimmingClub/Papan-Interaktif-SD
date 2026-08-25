/**
 * Data struktur kurikulum bawaan: fase, jenjang kelas, mata pelajaran, agama,
 * cabang seni, dan dokumen rujukan.
 *
 * CP, elemen, TP Rekomendasi, dan daftar referensi lama TIDAK lagi diturunkan
 * di sini dan tidak lagi disemai ke basis data. Tabel `cp`, `elemen`, `tp`, dan
 * `referensi` tetap ada untuk keperluan migrasi, tetapi dibiarkan kosong sampai
 * Buku Referensi resmi sekolah dimasukkan. Rantai isi yang berlaku sekarang:
 * Kelas → Mata Pelajaran → Buku Referensi → Bab → Topik → CP → TP.
 */
import masterJson from '../../../uploads/PAPAN_INTERAKTIF_SD_MASTER_DATA_KURIKULUM.json';
import type {
  Agama,
  CabangSeni,
  DokumenKurikulum,
  Fase,
  JenjangKelas,
  KodeFase,
  MataPelajaran,
  StatusMataPelajaran,
} from '../types';

interface MasterMapel {
  kode: string;
  nama: string;
  fase: KodeFase[];
  kelas: number[];
  status: StatusMataPelajaran;
  bercabang: boolean;
  agama_kode?: string;
  dasar_hukum?: string;
}

type MasterDokumen = DokumenKurikulum;

interface MasterData {
  dokumen: MasterDokumen[];
  mata_pelajaran: MasterMapel[];
}

const master = masterJson as unknown as MasterData;

/**
 * Versi seed. Diubah saat isi seed berubah sehingga perangkat lama menyemai
 * ulang. Versi ini menandai penghapusan seluruh CP/TP lama dari alur aplikasi.
 */
export const VERSI_SEED_KURIKULUM = '2026.2|struktur-kelas-mapel|tanpa-cp-tp-lama';

const FASE: Fase[] = [
  {
    kode: 'A',
    nama: 'Fase A',
    kelas_awal: 1,
    kelas_akhir: 2,
    warna_penanda: '#FDF0D6',
    profil_game: 'visual, teks sedikit, satu langkah',
  },
  {
    kode: 'B',
    nama: 'Fase B',
    kelas_awal: 3,
    kelas_akhir: 4,
    warna_penanda: '#DFF0E7',
    profil_game: 'konsep, prosedur, dan pemecahan masalah bertahap',
  },
  {
    kode: 'C',
    nama: 'Fase C',
    kelas_awal: 5,
    kelas_akhir: 6,
    warna_penanda: '#ECE0F4',
    profil_game: 'analisis, strategi, dan penerapan lintas konteks',
  },
];

function faseUntukKelas(tingkat: number): KodeFase {
  if (tingkat <= 2) return 'A';
  if (tingkat <= 4) return 'B';
  return 'C';
}

const JENJANG: JenjangKelas[] = Array.from({ length: 6 }, (_, indeks) => {
  const tingkat = indeks + 1;
  return { tingkat, fase_kode: faseUntukKelas(tingkat), nama: `Kelas ${tingkat}` };
});

const MAPEL: MataPelajaran[] = master.mata_pelajaran.map((baris) => ({
  kode: baris.kode,
  nama: baris.nama,
  fase_tersedia: baris.fase,
  kelas_tersedia: baris.kelas,
  status: baris.status,
  punya_cabang: baris.bercabang,
  agama_kode: baris.agama_kode ?? null,
  dasar_hukum:
    baris.dasar_hukum ??
    (baris.kode === 'KKA' ? 'Permendikdasmen Nomor 13 Tahun 2025' : ''),
}));

const AGAMA: Agama[] = MAPEL.filter((mapel) => mapel.agama_kode).map((mapel) => ({
  kode: mapel.agama_kode ?? '',
  nama: mapel.nama
    .replace('Pendidikan Agama ', '')
    .replace(' dan Budi Pekerti', ''),
  mapel_kode: mapel.kode,
  aktif_di_sekolah: false,
}));

const CABANG_SENI: CabangSeni[] = MAPEL.filter((mapel) =>
  mapel.status.startsWith('pilihan_cabang_seni'),
).map((mapel) => ({
  kode: mapel.kode,
  nama: mapel.nama,
  bawaan: mapel.status === 'pilihan_cabang_seni_default',
}));

/** Dokumen rujukan struktur mata pelajaran; bukan sumber CP/TP. */
const DOKUMEN: DokumenKurikulum[] = master.dokumen;

export const DATA_KURIKULUM_FINAL = {
  fase: FASE,
  jenjangKelas: JENJANG,
  mataPelajaran: MAPEL,
  agama: AGAMA,
  cabangSeni: CABANG_SENI,
  dokumenKurikulum: DOKUMEN,
} as const;
