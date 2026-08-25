import type {
  BukuBab,
  BukuReferensi,
  BukuTopik,
  JenjangKelas,
  KonteksKurikulum,
  MataPelajaran,
} from '../types';
import { DATA_KURIKULUM_FINAL, VERSI_SEED_KURIKULUM } from '../kurikulum/kurikulumSeed';
import { semaiReferensiMasterKelas5 } from '../referensi/kelas5MasterSeed';
import { TOKO, jalankanTransaksi, kueri, type NamaToko } from './db';
import { bacaPenanda, KUNCI_PERANGKAT, tulisPenanda } from './perangkatRepo';

/**
 * Toko struktur yang disemai bawaan. Tabel `cp`, `elemen`, `tp`, dan
 * `referensi` sengaja tidak lagi ikut disemai — isinya menunggu Buku Referensi.
 */
const TOKO_KURIKULUM: NamaToko[] = [
  TOKO.fase,
  TOKO.jenjangKelas,
  TOKO.mataPelajaran,
  TOKO.agama,
  TOKO.cabangSeni,
  TOKO.dokumenKurikulum,
];

export interface RingkasanKurikulum {
  jumlahKelas: number;
  jumlahMapel: number;
  jumlahBuku: number;
  jumlahBab: number;
  jumlahTopik: number;
}

export interface RingkasanKelas {
  tingkat: number;
  fase_kode: 'A' | 'B' | 'C';
  jumlahPilihanMapel: number;
  jumlahBuku: number;
}

export interface RingkasanMapel extends MataPelajaran {
  jumlahBuku: number;
  jumlahBab: number;
  jumlahTopik: number;
}

export const KONTEKS_KURIKULUM_KOSONG: KonteksKurikulum = {
  tingkat_kelas: null,
  fase_kode: null,
  mapel_kode: null,
  cabang_kode: null,
  agama_kode: null,
  cp_id: null,
  elemen_id: null,
  tp_id: null,
  materi_id: null,
  referensi_id: null,
  referensi_bab_id: null,
};

let prosesSeed: Promise<void> | null = null;

export function lepaskanPenandaSeedKurikulum(): void {
  prosesSeed = null;
}

/** Seed idempoten struktur kurikulum dan referensi master Kelas 5. */
export async function pastikanKurikulumTersedia(): Promise<void> {
  if (prosesSeed) return prosesSeed;

  const operasi = (async () => {
    await semaiBilaPerlu();
    await semaiReferensiMasterKelas5();
  })();
  prosesSeed = operasi;
  try {
    await operasi;
  } finally {
    if (prosesSeed === operasi) prosesSeed = null;
  }
}

async function semaiBilaPerlu(): Promise<void> {
  const versiTersimpan = await bacaPenanda<string>(KUNCI_PERANGKAT.versiSeedKurikulum);
  if (versiTersimpan === VERSI_SEED_KURIKULUM) return;

  await jalankanTransaksi(TOKO_KURIKULUM, 'readwrite', async (toko) => {
    const pasangan: Array<[NamaToko, readonly unknown[]]> = [
      [TOKO.fase, DATA_KURIKULUM_FINAL.fase],
      [TOKO.jenjangKelas, DATA_KURIKULUM_FINAL.jenjangKelas],
      [TOKO.mataPelajaran, DATA_KURIKULUM_FINAL.mataPelajaran],
      [TOKO.agama, DATA_KURIKULUM_FINAL.agama],
      [TOKO.cabangSeni, DATA_KURIKULUM_FINAL.cabangSeni],
      [TOKO.dokumenKurikulum, DATA_KURIKULUM_FINAL.dokumenKurikulum],
    ];

    for (const [namaToko, baris] of pasangan) {
      await Promise.all(baris.map((nilai) => kueri.simpan(toko(namaToko), nilai)));
    }
  });

  await tulisPenanda(KUNCI_PERANGKAT.versiSeedKurikulum, VERSI_SEED_KURIKULUM);
}

export async function bacaRingkasanKurikulum(): Promise<RingkasanKurikulum> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [TOKO.jenjangKelas, TOKO.mataPelajaran, TOKO.bukuReferensi, TOKO.bukuBab, TOKO.bukuTopik],
    'readonly',
    async (toko) => {
      const [jumlahKelas, jumlahMapel, buku, jumlahBab, jumlahTopik] = await Promise.all([
        kueri.jumlah(toko(TOKO.jenjangKelas)),
        kueri.jumlah(toko(TOKO.mataPelajaran)),
        kueri.semua<BukuReferensi>(toko(TOKO.bukuReferensi)),
        kueri.jumlah(toko(TOKO.bukuBab)),
        kueri.jumlah(toko(TOKO.bukuTopik)),
      ]);
      return {
        jumlahKelas,
        jumlahMapel,
        jumlahBuku: buku.filter((baris) => baris.status === 'aktif').length,
        jumlahBab,
        jumlahTopik,
      };
    },
  );
}

export async function daftarKelas(): Promise<RingkasanKelas[]> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [TOKO.jenjangKelas, TOKO.mataPelajaran, TOKO.bukuReferensi],
    'readonly',
    async (toko) => {
      const [kelas, mapel, buku] = await Promise.all([
        kueri.semua<JenjangKelas>(toko(TOKO.jenjangKelas)),
        kueri.semua<MataPelajaran>(toko(TOKO.mataPelajaran)),
        kueri.semua<BukuReferensi>(toko(TOKO.bukuReferensi)),
      ]);
      return kelas
        .sort((a, b) => a.tingkat - b.tingkat)
        .map((baris) => ({
          tingkat: baris.tingkat,
          fase_kode: baris.fase_kode,
          jumlahPilihanMapel: mapel.filter((item) => item.kelas_tersedia.includes(baris.tingkat)).length,
          jumlahBuku: buku.filter((item) => item.status === 'aktif' && item.tingkat_kelas === baris.tingkat).length,
        }));
    },
  );
}

export async function daftarMapelUntukKelas(tingkat: number): Promise<RingkasanMapel[]> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [TOKO.mataPelajaran, TOKO.bukuReferensi, TOKO.bukuBab, TOKO.bukuTopik],
    'readonly',
    async (toko) => {
      const [mapel, buku, bab, topik] = await Promise.all([
        kueri.semua<MataPelajaran>(toko(TOKO.mataPelajaran)),
        kueri.semua<BukuReferensi>(toko(TOKO.bukuReferensi)),
        kueri.semua<BukuBab>(toko(TOKO.bukuBab)),
        kueri.semua<BukuTopik>(toko(TOKO.bukuTopik)),
      ]);

      return mapel
        .filter((item) => item.kelas_tersedia.includes(tingkat))
        .map((item) => {
          const bukuMapel = buku.filter((baris) => baris.status === 'aktif' && baris.tingkat_kelas === tingkat && baris.mapel_kode === item.kode);
          const idBuku = new Set(bukuMapel.map((baris) => baris.id));
          const babMapel = bab.filter((baris) => idBuku.has(baris.buku_id));
          const idBab = new Set(babMapel.map((baris) => baris.id));
          return {
            ...item,
            jumlahBuku: bukuMapel.length,
            jumlahBab: babMapel.length,
            jumlahTopik: topik.filter((baris) => idBab.has(baris.bab_id)).length,
          };
        });
    },
  );
}

function kunciKonteks(akunId: string): string {
  return `konteks_kurikulum_${akunId}`;
}

export async function bacaKonteksKurikulum(akunId: string): Promise<KonteksKurikulum> {
  return ((await bacaPenanda<KonteksKurikulum>(kunciKonteks(akunId))) ?? { ...KONTEKS_KURIKULUM_KOSONG });
}

export async function simpanKonteksKurikulum(akunId: string, konteks: KonteksKurikulum): Promise<void> {
  await tulisPenanda(kunciKonteks(akunId), konteks);
}
