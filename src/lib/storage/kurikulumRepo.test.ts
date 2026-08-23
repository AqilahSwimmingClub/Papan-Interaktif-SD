import { beforeEach, describe, expect, it } from 'vitest';
import agama020Json from '../../../uploads/PAPAN_INTERAKTIF_SD_UPDATE_SEMUA_PADB_020_2026_FINAL.json';
import { resetPenyimpanan } from '../../test/bantuan';
import type { CapaianPembelajaran, ElemenKurikulum, TujuanPembelajaran } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';
import {
  bacaDetailMapelKelas,
  bacaRingkasanKurikulum,
  daftarKelas,
  pastikanKurikulumTersedia,
} from './kurikulumRepo';

describe('database kurikulum Tahap 2', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
  });

  it('menyemai tepat 47 CP, 221 elemen, dan 212 TP Rekomendasi', async () => {
    expect(await bacaRingkasanKurikulum()).toEqual({
      jumlahCp: 47,
      jumlahElemen: 221,
      jumlahTp: 212,
      jumlahMapel: 17,
      cpAgama020: 18,
    });
  });

  it('mempertahankan 29 CP non-agama dan mengganti hanya agama dengan 020/2026', async () => {
    await pastikanKurikulumTersedia();
    const cp = await jalankanTransaksi(TOKO.cp, 'readonly', (toko) =>
      kueri.semua<CapaianPembelajaran>(toko(TOKO.cp)),
    );

    expect(cp.filter((baris) => baris.dokumen_kode === '046/H/KR/2025')).toHaveLength(29);
    expect(cp.filter((baris) => baris.dokumen_kode === '020/2026')).toHaveLength(18);
    expect(cp.every((baris) => baris.terverifikasi)).toBe(true);
    expect(
      new Set(
        cp.filter((baris) => baris.dokumen_kode === '020/2026').map((baris) => baris.mapel_kode),
      ).size,
    ).toBe(6);
  });

  it('mengambil teks CP Agama Islam verbatim dari dataset final 020/2026', async () => {
    const detail = await bacaDetailMapelKelas(1, 'PAI');
    const sumber = agama020Json.subjects.find((subjek) => subjek.code === 'PAIBP');
    const cpFaseA = sumber?.cp.A as unknown as Record<string, string | number[]>;

    expect(detail?.cp.dokumen_kode).toBe('020/2026');
    expect(detail?.elemen[0]?.teks_elemen).toBe(cpFaseA['Al-Qur’an Hadis']);
    expect(detail?.dokumen?.versi).toBe('2026.1');
  });

  it('menyimpan dua elemen Kristen Fase A sebagai tidak berlaku, bukan data kosong', async () => {
    const detail = await bacaDetailMapelKelas(1, 'PAK');
    const tidakBerlaku = detail?.elemen.filter((elemen) => elemen.status === 'tidak_berlaku');

    expect(tidakBerlaku?.map((elemen) => elemen.nama)).toEqual([
      'Allah Penyelamat',
      'Allah Pembaru',
    ]);
    expect(tidakBerlaku?.every((elemen) => elemen.teks_elemen === '')).toBe(true);
  });

  it('tidak membuat TP agama karena dokumen 020/2026 hanya memuat CP', async () => {
    await pastikanKurikulumTersedia();
    const [cpAgama, elemen, tp] = await jalankanTransaksi(
      [TOKO.cp, TOKO.elemen, TOKO.tp],
      'readonly',
      async (toko) => {
        const semuaCp = await kueri.semua<CapaianPembelajaran>(toko(TOKO.cp));
        return [
          semuaCp.filter((baris) => baris.dokumen_kode === '020/2026'),
          await kueri.semua<ElemenKurikulum>(toko(TOKO.elemen)),
          await kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)),
        ] as const;
      },
    );
    const idCpAgama = new Set(cpAgama.map((baris) => baris.id));
    const idElemenAgama = new Set(
      elemen.filter((baris) => idCpAgama.has(baris.cp_id)).map((baris) => baris.id),
    );

    expect(tp.filter((baris) => idElemenAgama.has(baris.elemen_id))).toHaveLength(0);
  });

  it('menyimpan seed secara idempoten dan menghitung TP per kelas dari dataset', async () => {
    await pastikanKurikulumTersedia();
    await pastikanKurikulumTersedia();

    expect((await daftarKelas()).map((kelas) => kelas.jumlahTp)).toEqual([44, 17, 52, 19, 56, 24]);
    expect((await bacaRingkasanKurikulum()).jumlahCp).toBe(47);
  });
});
