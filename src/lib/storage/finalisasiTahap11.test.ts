import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import {
  JEDA_CADANGAN_HARIAN_MS,
  daftarCadangan,
  pastikanCadanganHarian,
} from './pelengkapRepo';

describe('cadangan otomatis Tahap 11', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
  });

  it('menyimpan paket lengkap paling banyak sekali per 24 jam', async () => {
    const bersamaan = await Promise.all([pastikanCadanganHarian(), pastikanCadanganHarian()]);
    expect(bersamaan).toEqual([true, true]);
    const pertama = (await daftarCadangan())[0];
    expect(pertama).toMatchObject({ otomatis: true, tujuan: 'berkas' });
    expect(pertama?.paket).toMatchObject({ format: 'papan-interaktif-sd-backup', versi: 1 });
    expect(await daftarCadangan()).toHaveLength(1);

    const waktuPertama = new Date(pertama!.waktu).getTime();
    expect(await pastikanCadanganHarian(waktuPertama + 60_000)).toBe(false);
    expect(await daftarCadangan()).toHaveLength(1);

    expect(await pastikanCadanganHarian(waktuPertama + JEDA_CADANGAN_HARIAN_MS + 1)).toBe(true);
    expect(await daftarCadangan()).toHaveLength(2);
  });
});
