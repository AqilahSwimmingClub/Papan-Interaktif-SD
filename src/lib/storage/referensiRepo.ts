import { AppError } from '../errors/AppError';
import type {
  CapaianPembelajaran,
  ElemenKurikulum,
  MataPelajaran,
  PemetaanBabTp,
  ReferensiBab,
  ReferensiPembelajaran,
  ReferensiSekolah,
  TujuanPembelajaran,
} from '../types';
import { ID_SEKOLAH_TUNGGAL } from './sekolahRepo';
import { TOKO, jalankanTransaksi, kueri } from './db';
import { pastikanKurikulumTersedia } from './kurikulumRepo';

export interface ReferensiDenganStatus extends ReferensiPembelajaran {
  jumlah_bab: number;
  jumlah_tp: number;
  pilihan: ReferensiSekolah | null;
}

export async function daftarReferensiLengkap(
  tingkat: number,
  mapelKode: string,
): Promise<ReferensiDenganStatus[]> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [TOKO.referensi, TOKO.referensiBab, TOKO.pemetaanBabTp, TOKO.referensiSekolah],
    'readonly',
    async (toko) => {
      const [referensi, bab, pemetaan, pilihan] = await Promise.all([
        kueri.semua<ReferensiPembelajaran>(toko(TOKO.referensi)),
        kueri.semua<ReferensiBab>(toko(TOKO.referensiBab)),
        kueri.semua<PemetaanBabTp>(toko(TOKO.pemetaanBabTp)),
        kueri.semua<ReferensiSekolah>(toko(TOKO.referensiSekolah)),
      ]);
      return referensi
        .filter(
          (baris) =>
            baris.status === 'aktif' &&
            (!baris.mapel_kode || baris.mapel_kode === mapelKode) &&
            baris.kelas_relevan.includes(tingkat),
        )
        .map((baris) => {
          const idBab = new Set(bab.filter((item) => item.referensi_id === baris.id).map((item) => item.id));
          return {
            ...baris,
            jumlah_bab: idBab.size,
            jumlah_tp: new Set(pemetaan.filter((item) => idBab.has(item.referensi_bab_id)).map((item) => item.tp_id)).size,
            pilihan:
              pilihan.find(
                (item) =>
                  item.sekolah_id === ID_SEKOLAH_TUNGGAL &&
                  item.referensi_id === baris.id &&
                  item.tingkat_kelas === tingkat,
              ) ?? null,
          };
        })
        .sort((a, b) => Number(Boolean(b.pilihan?.utama)) - Number(Boolean(a.pilihan?.utama)) || a.judul.localeCompare(b.judul, 'id'));
    },
  );
}

export async function simpanReferensi(referensi: ReferensiPembelajaran): Promise<void> {
  if (!referensi.id.trim() || !referensi.judul.trim()) {
    throw new AppError('VALIDASI', 'ID dan judul referensi wajib diisi.');
  }
  await pastikanKurikulumTersedia();
  await jalankanTransaksi([TOKO.referensi, TOKO.mataPelajaran], 'readwrite', async (toko) => {
    if (referensi.mapel_kode) {
      const mapel = await kueri.ambil<MataPelajaran>(toko(TOKO.mataPelajaran), referensi.mapel_kode);
      if (!mapel) throw new AppError('VALIDASI', 'Mata pelajaran referensi tidak ditemukan.');
    }
    await kueri.simpan(toko(TOKO.referensi), {
      ...referensi,
      id: referensi.id.trim(),
      judul: referensi.judul.trim(),
      tanggal_diperbarui: new Date().toISOString(),
    });
  });
}

export async function simpanBabReferensi(bab: ReferensiBab): Promise<void> {
  if (!bab.judul_bab.trim()) throw new AppError('VALIDASI', 'Judul bab wajib diisi.');
  await jalankanTransaksi([TOKO.referensi, TOKO.referensiBab], 'readwrite', async (toko) => {
    const sumber = await kueri.ambil<ReferensiPembelajaran>(toko(TOKO.referensi), bab.referensi_id);
    if (!sumber || sumber.status !== 'aktif') throw new AppError('VALIDASI', 'Referensi aktif tidak ditemukan.');
    // Untuk metadata_saja, ruang lingkup dibatasi sebagai ringkasan, bukan isi penuh buku.
    if (sumber.lingkup_izin === 'metadata_saja' && bab.ruang_lingkup.length > 500) {
      throw new AppError('VALIDASI', 'Ringkasan bab metadata-saja maksimal 500 karakter.');
    }
    await kueri.simpan(toko(TOKO.referensiBab), { ...bab, judul_bab: bab.judul_bab.trim() });
  });
}

export async function daftarBabReferensi(referensiId: string): Promise<ReferensiBab[]> {
  return jalankanTransaksi(TOKO.referensiBab, 'readonly', async (toko) => {
    const semua = await kueri.semuaLewatIndeks<ReferensiBab>(toko(TOKO.referensiBab), 'referensi_id', referensiId);
    return semua.sort((a, b) => a.urutan - b.urutan);
  });
}

export async function petakanBabKeTp(pemetaan: PemetaanBabTp): Promise<void> {
  await jalankanTransaksi(
    [TOKO.referensi, TOKO.referensiBab, TOKO.pemetaanBabTp, TOKO.tp, TOKO.elemen, TOKO.cp],
    'readwrite',
    async (toko) => {
      const [bab, tp] = await Promise.all([
        kueri.ambil<ReferensiBab>(toko(TOKO.referensiBab), pemetaan.referensi_bab_id),
        kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), pemetaan.tp_id),
      ]);
      if (!bab || !tp || tp.status !== 'aktif') throw new AppError('VALIDASI', 'Bab atau TP aktif tidak ditemukan.');
      const [referensi, elemen] = await Promise.all([
        kueri.ambil<ReferensiPembelajaran>(toko(TOKO.referensi), bab.referensi_id),
        kueri.ambil<ElemenKurikulum>(toko(TOKO.elemen), tp.elemen_id),
      ]);
      const cp = elemen ? await kueri.ambil<CapaianPembelajaran>(toko(TOKO.cp), elemen.cp_id) : undefined;
      if (!referensi || !cp) throw new AppError('VALIDASI', 'Relasi referensi atau CP tidak ditemukan.');
      if (referensi.mapel_kode && referensi.mapel_kode !== cp.mapel_kode) {
        throw new AppError('VALIDASI', 'Bab dan TP berasal dari mata pelajaran yang berbeda.');
      }
      if (!referensi.kelas_relevan.includes(tp.tingkat_kelas)) {
        throw new AppError('VALIDASI', 'Referensi tidak berlaku untuk kelas TP ini.');
      }
      await kueri.simpan(toko(TOKO.pemetaanBabTp), pemetaan);
    },
  );
}

export async function hapusPemetaanBabTp(referensiBabId: string, tpId: string): Promise<void> {
  await jalankanTransaksi(TOKO.pemetaanBabTp, 'readwrite', (toko) =>
    kueri.hapus(toko(TOKO.pemetaanBabTp), [referensiBabId, tpId]),
  );
}

export async function daftarPemetaanReferensi(referensiId: string): Promise<
  Array<PemetaanBabTp & { bab: ReferensiBab; tp: TujuanPembelajaran }>
> {
  return jalankanTransaksi(
    [TOKO.referensiBab, TOKO.pemetaanBabTp, TOKO.tp],
    'readonly',
    async (toko) => {
      const bab = await kueri.semuaLewatIndeks<ReferensiBab>(toko(TOKO.referensiBab), 'referensi_id', referensiId);
      const hasil: Array<PemetaanBabTp & { bab: ReferensiBab; tp: TujuanPembelajaran }> = [];
      for (const item of bab) {
        const pemetaan = await kueri.semua<PemetaanBabTp>(toko(TOKO.pemetaanBabTp));
        for (const relasi of pemetaan.filter((baris) => baris.referensi_bab_id === item.id)) {
          const tp = await kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), relasi.tp_id);
          if (tp) hasil.push({ ...relasi, bab: item, tp });
        }
      }
      return hasil.sort((a, b) => a.bab.urutan - b.bab.urutan || a.tp.kode_tampil.localeCompare(b.tp.kode_tampil, 'id'));
    },
  );
}

export async function pilihReferensiSekolah(
  referensiId: string,
  tingkat: number,
  utama: boolean,
  dipilihOleh: string,
): Promise<void> {
  await jalankanTransaksi(
    [TOKO.referensi, TOKO.referensiSekolah],
    'readwrite',
    async (toko) => {
      const referensi = await kueri.ambil<ReferensiPembelajaran>(toko(TOKO.referensi), referensiId);
      if (!referensi || referensi.status !== 'aktif' || !referensi.kelas_relevan.includes(tingkat)) {
        throw new AppError('VALIDASI', 'Referensi aktif tidak tersedia untuk kelas ini.');
      }
      if (utama) {
        const semua = await kueri.semua<ReferensiSekolah>(toko(TOKO.referensiSekolah));
        for (const lama of semua) {
          if (lama.sekolah_id !== ID_SEKOLAH_TUNGGAL || lama.tingkat_kelas !== tingkat || !lama.utama) continue;
          const sumberLama = await kueri.ambil<ReferensiPembelajaran>(toko(TOKO.referensi), lama.referensi_id);
          if ((sumberLama?.mapel_kode ?? null) === (referensi.mapel_kode ?? null)) {
            await kueri.simpan(toko(TOKO.referensiSekolah), { ...lama, utama: false });
          }
        }
      }
      await kueri.simpan(toko(TOKO.referensiSekolah), {
        sekolah_id: ID_SEKOLAH_TUNGGAL,
        referensi_id: referensiId,
        tingkat_kelas: tingkat,
        utama,
        aktif: true,
        dipilih_oleh: dipilihOleh,
      } satisfies ReferensiSekolah);
    },
  );
}

export async function nonaktifkanReferensiSekolah(referensiId: string, tingkat: number): Promise<void> {
  await jalankanTransaksi(TOKO.referensiSekolah, 'readwrite', async (toko) => {
    const lama = await kueri.ambil<ReferensiSekolah>(
      toko(TOKO.referensiSekolah),
      [ID_SEKOLAH_TUNGGAL, referensiId, tingkat],
    );
    if (lama) await kueri.simpan(toko(TOKO.referensiSekolah), { ...lama, aktif: false, utama: false });
  });
}
