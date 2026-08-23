import type {
  CapaianPembelajaran,
  DokumenKurikulum,
  ElemenKurikulum,
  JenjangKelas,
  KonteksKurikulum,
  MataPelajaran,
  TujuanPembelajaran,
} from '../types';
import { DATA_KURIKULUM_FINAL, VERSI_SEED_KURIKULUM } from '../kurikulum/kurikulumSeed';
import { TOKO, jalankanTransaksi, kueri, type NamaToko } from './db';
import { bacaPenanda, KUNCI_PERANGKAT, tulisPenanda } from './perangkatRepo';

const TOKO_KURIKULUM: NamaToko[] = [
  TOKO.fase,
  TOKO.jenjangKelas,
  TOKO.mataPelajaran,
  TOKO.agama,
  TOKO.cabangSeni,
  TOKO.dokumenKurikulum,
  TOKO.cp,
  TOKO.elemen,
  TOKO.tp,
];

export interface RingkasanKurikulum {
  jumlahCp: number;
  jumlahElemen: number;
  jumlahTp: number;
  jumlahMapel: number;
  cpAgama020: number;
}

export interface RingkasanKelas {
  tingkat: number;
  fase_kode: 'A' | 'B' | 'C';
  jumlahTp: number;
  jumlahPilihanMapel: number;
}

export interface RingkasanMapel extends MataPelajaran {
  jumlahCp: number;
  jumlahElemen: number;
  jumlahTp: number;
  dokumen_kode: string | null;
}

export interface DetailMapelKelas {
  kelas: JenjangKelas;
  mapel: MataPelajaran;
  cp: CapaianPembelajaran;
  dokumen: DokumenKurikulum | null;
  elemen: Array<
    ElemenKurikulum & {
      tpRekomendasi: TujuanPembelajaran[];
      tpSekolah: TujuanPembelajaran[];
    }
  >;
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

/** Seed idempoten dari dua dataset final repository. Tidak ada pemanggilan jaringan. */
export async function pastikanKurikulumTersedia(): Promise<void> {
  if (prosesSeed) return prosesSeed;

  const operasi = semaiBilaPerlu();
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
      [TOKO.cp, DATA_KURIKULUM_FINAL.cp],
      [TOKO.elemen, DATA_KURIKULUM_FINAL.elemen],
      [TOKO.tp, DATA_KURIKULUM_FINAL.tp],
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
    [TOKO.cp, TOKO.elemen, TOKO.tp, TOKO.mataPelajaran],
    'readonly',
    async (toko) => {
      const [cp, jumlahElemen, jumlahTp, jumlahMapel] = await Promise.all([
        kueri.semua<CapaianPembelajaran>(toko(TOKO.cp)),
        kueri.jumlah(toko(TOKO.elemen)),
        kueri.jumlah(toko(TOKO.tp)),
        kueri.jumlah(toko(TOKO.mataPelajaran)),
      ]);
      return {
        jumlahCp: cp.length,
        jumlahElemen,
        jumlahTp,
        jumlahMapel,
        cpAgama020: cp.filter((baris) => baris.dokumen_kode === '020/2026').length,
      };
    },
  );
}

export async function daftarKelas(): Promise<RingkasanKelas[]> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [TOKO.jenjangKelas, TOKO.mataPelajaran, TOKO.tp],
    'readonly',
    async (toko) => {
      const [kelas, mapel, tp] = await Promise.all([
        kueri.semua<JenjangKelas>(toko(TOKO.jenjangKelas)),
        kueri.semua<MataPelajaran>(toko(TOKO.mataPelajaran)),
        kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)),
      ]);
      return kelas
        .sort((a, b) => a.tingkat - b.tingkat)
        .map((baris) => ({
          tingkat: baris.tingkat,
          fase_kode: baris.fase_kode,
          jumlahTp: tp.filter((tujuan) => tujuan.tingkat_kelas === baris.tingkat).length,
          jumlahPilihanMapel: mapel.filter((item) =>
            item.kelas_tersedia.includes(baris.tingkat),
          ).length,
        }));
    },
  );
}

export async function daftarMapelUntukKelas(tingkat: number): Promise<RingkasanMapel[]> {
  await pastikanKurikulumTersedia();
  const faseKode = tingkat <= 2 ? 'A' : tingkat <= 4 ? 'B' : 'C';
  return jalankanTransaksi(
    [TOKO.mataPelajaran, TOKO.cp, TOKO.elemen, TOKO.tp],
    'readonly',
    async (toko) => {
      const [mapel, cp, elemen, tp] = await Promise.all([
        kueri.semua<MataPelajaran>(toko(TOKO.mataPelajaran)),
        kueri.semua<CapaianPembelajaran>(toko(TOKO.cp)),
        kueri.semua<ElemenKurikulum>(toko(TOKO.elemen)),
        kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)),
      ]);

      return mapel
        .filter((item) => item.kelas_tersedia.includes(tingkat))
        .map((item) => {
          const cpMapel = cp.filter(
            (capaian) => capaian.mapel_kode === item.kode && capaian.fase_kode === faseKode,
          );
          const idCp = new Set(cpMapel.map((capaian) => capaian.id));
          const elemenMapel = elemen.filter((baris) => idCp.has(baris.cp_id));
          const idElemen = new Set(elemenMapel.map((baris) => baris.id));
          return {
            ...item,
            jumlahCp: cpMapel.length,
            jumlahElemen: elemenMapel.length,
            jumlahTp: tp.filter(
              (tujuan) =>
                tujuan.tingkat_kelas === tingkat &&
                tujuan.status === 'aktif' &&
                idElemen.has(tujuan.elemen_id),
            ).length,
            dokumen_kode: cpMapel[0]?.dokumen_kode ?? null,
          };
        });
    },
  );
}

export async function bacaDetailMapelKelas(
  tingkat: number,
  mapelKode: string,
): Promise<DetailMapelKelas | null> {
  await pastikanKurikulumTersedia();
  const faseKode = tingkat <= 2 ? 'A' : tingkat <= 4 ? 'B' : 'C';
  return jalankanTransaksi(
    [TOKO.jenjangKelas, TOKO.mataPelajaran, TOKO.cp, TOKO.elemen, TOKO.tp, TOKO.dokumenKurikulum],
    'readonly',
    async (toko) => {
      const [kelas, mapel, daftarCp] = await Promise.all([
        kueri.ambil<JenjangKelas>(toko(TOKO.jenjangKelas), tingkat),
        kueri.ambil<MataPelajaran>(toko(TOKO.mataPelajaran), mapelKode),
        kueri.semuaLewatIndeks<CapaianPembelajaran>(
          toko(TOKO.cp),
          'mapel_fase',
          [mapelKode, faseKode],
        ),
      ]);
      const cp = daftarCp[0];
      if (!kelas || !mapel || !cp || !mapel.kelas_tersedia.includes(tingkat)) return null;

      const [dokumen, elemen, semuaTp] = await Promise.all([
        kueri.ambil<DokumenKurikulum>(toko(TOKO.dokumenKurikulum), cp.dokumen_kode),
        kueri.semuaLewatIndeks<ElemenKurikulum>(toko(TOKO.elemen), 'cp_id', cp.id),
        kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)),
      ]);

      return {
        kelas,
        mapel,
        cp,
        dokumen: dokumen ?? null,
        elemen: elemen
          .sort((a, b) => a.urutan - b.urutan)
          .map((baris) => ({
            ...baris,
            tpRekomendasi: semuaTp
              .filter(
                (tujuan) =>
                  tujuan.elemen_id === baris.id &&
                  tujuan.tingkat_kelas === tingkat &&
                  tujuan.sumber === 'rekomendasi' &&
                  tujuan.status === 'aktif',
              )
              .sort((a, b) => a.kode_tampil.localeCompare(b.kode_tampil, 'id', { numeric: true })),
            tpSekolah: semuaTp
              .filter(
                (tujuan) =>
                  tujuan.elemen_id === baris.id &&
                  tujuan.tingkat_kelas === tingkat &&
                  tujuan.sumber === 'sekolah' &&
                  tujuan.status === 'aktif',
              )
              .sort((a, b) => a.kode_tampil.localeCompare(b.kode_tampil, 'id', { numeric: true })),
          })),
      };
    },
  );
}

function kunciKonteks(akunId: string): string {
  return `konteks_kurikulum_${akunId}`;
}

export async function bacaKonteksKurikulum(akunId: string): Promise<KonteksKurikulum> {
  return (
    (await bacaPenanda<KonteksKurikulum>(kunciKonteks(akunId))) ?? {
      ...KONTEKS_KURIKULUM_KOSONG,
    }
  );
}

export async function simpanKonteksKurikulum(
  akunId: string,
  konteks: KonteksKurikulum,
): Promise<void> {
  await tulisPenanda(kunciKonteks(akunId), konteks);
}
