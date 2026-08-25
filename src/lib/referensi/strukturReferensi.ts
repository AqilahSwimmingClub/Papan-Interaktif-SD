/**
 * Struktur referensi baru — kerangka kosong yang menunggu Buku Referensi.
 *
 * Rantai resmi aplikasi setelah pembersihan CP/TP dan game lama:
 *
 *   Kelas → Mata Pelajaran → Buku Referensi → Bab → Topik/Lingkup Materi
 *         → CP → TP → Kuis → Game Edukasi → VLAB/Simulasi → LKPD → Bank Soal
 *
 * Berkas ini hanya mendefinisikan bentuk rantai dan keadaan tiap simpul.
 * Tidak ada CP, TP, game, kuis, LKPD, atau butir soal yang dibuat di sini —
 * seluruh isinya akan diturunkan dari buku pelajaran resmi yang dipakai
 * sekolah, setelah buku tersebut dimasukkan ke aplikasi.
 */

export type KodeSimpulReferensi =
  | 'kelas'
  | 'mapel'
  | 'buku'
  | 'bab'
  | 'topik'
  | 'cp'
  | 'tp'
  | 'kuis'
  | 'game'
  | 'vlab'
  | 'lkpd'
  | 'bank-soal';

/**
 * `tersedia` — simpul sudah berisi dan dipakai UI.
 * `menunggu_buku` — sengaja dikosongkan sampai Buku Referensi dimasukkan.
 * `mandiri` — sudah berfungsi penuh tanpa perlu menunggu buku.
 */
export type KeadaanSimpul = 'tersedia' | 'menunggu_buku' | 'mandiri';

export interface SimpulReferensi {
  kode: KodeSimpulReferensi;
  nama: string;
  keterangan: string;
  keadaan: KeadaanSimpul;
  /** Simpul induk pada rantai; null untuk akar. */
  induk: KodeSimpulReferensi | null;
}

export const PESAN_MENUNGGU_BUKU =
  'Konten akan tersedia setelah Buku Referensi dimasukkan.';

export const PESAN_MENUNGGU_BUKU_GAME =
  'Konten Game Edukasi akan tersedia setelah Buku Referensi dimasukkan.';

/** Rantai referensi berurutan dari kelas sampai bank soal. */
export const RANTAI_REFERENSI: readonly SimpulReferensi[] = [
  {
    kode: 'kelas',
    nama: 'Kelas',
    keterangan: 'Kelas 1 sampai 6 beserta fasenya.',
    keadaan: 'tersedia',
    induk: null,
  },
  {
    kode: 'mapel',
    nama: 'Mata Pelajaran',
    keterangan: 'Struktur mata pelajaran yang tersedia pada tiap kelas.',
    keadaan: 'tersedia',
    induk: 'kelas',
  },
  {
    kode: 'buku',
    nama: 'Buku Referensi',
    keterangan: 'Buku pelajaran resmi yang benar-benar dipakai sekolah.',
    keadaan: 'menunggu_buku',
    induk: 'mapel',
  },
  {
    kode: 'bab',
    nama: 'Bab',
    keterangan: 'Pembagian bab atau unit di dalam buku referensi.',
    keadaan: 'menunggu_buku',
    induk: 'buku',
  },
  {
    kode: 'topik',
    nama: 'Topik / Lingkup Materi',
    keterangan: 'Topik dan lingkup materi pada tiap bab.',
    keadaan: 'menunggu_buku',
    induk: 'bab',
  },
  {
    kode: 'cp',
    nama: 'CP',
    keterangan: 'Capaian Pembelajaran, dipetakan dari buku referensi.',
    keadaan: 'menunggu_buku',
    induk: 'topik',
  },
  {
    kode: 'tp',
    nama: 'TP',
    keterangan: 'Tujuan Pembelajaran, diturunkan dari CP dan topik buku.',
    keadaan: 'menunggu_buku',
    induk: 'cp',
  },
  {
    kode: 'kuis',
    nama: 'Kuis',
    keterangan: 'Kuis singkat per topik.',
    keadaan: 'menunggu_buku',
    induk: 'tp',
  },
  {
    kode: 'game',
    nama: 'Game Edukasi',
    keterangan: 'Permainan pembelajaran yang dibuat mengikuti isi buku.',
    keadaan: 'menunggu_buku',
    induk: 'tp',
  },
  {
    kode: 'vlab',
    nama: 'VLAB / Simulasi',
    keterangan:
      'Laboratorium virtual. Sudah berjalan mandiri dan tinggal dikaitkan ke topik buku.',
    keadaan: 'mandiri',
    induk: 'tp',
  },
  {
    kode: 'lkpd',
    nama: 'LKPD',
    keterangan: 'Lembar kerja peserta didik per topik.',
    keadaan: 'menunggu_buku',
    induk: 'tp',
  },
  {
    kode: 'bank-soal',
    nama: 'Bank Soal',
    keterangan: 'Kumpulan butir soal per topik dan tingkat kognitif.',
    keadaan: 'menunggu_buku',
    induk: 'tp',
  },
];

export interface RingkasanStrukturReferensi {
  jumlahSimpul: number;
  siap: number;
  menungguBuku: number;
  mandiri: number;
}

export function ringkasStrukturReferensi(
  rantai: readonly SimpulReferensi[] = RANTAI_REFERENSI,
): RingkasanStrukturReferensi {
  return {
    jumlahSimpul: rantai.length,
    siap: rantai.filter((simpul) => simpul.keadaan === 'tersedia').length,
    menungguBuku: rantai.filter((simpul) => simpul.keadaan === 'menunggu_buku').length,
    mandiri: rantai.filter((simpul) => simpul.keadaan === 'mandiri').length,
  };
}

export function simpulReferensi(kode: KodeSimpulReferensi): SimpulReferensi | undefined {
  return RANTAI_REFERENSI.find((simpul) => simpul.kode === kode);
}
