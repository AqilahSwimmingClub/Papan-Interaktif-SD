import type { SesiLogin } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';

export async function simpanSesi(sesi: SesiLogin): Promise<void> {
  await jalankanTransaksi(TOKO.sesiLogin, 'readwrite', async (toko) => {
    await kueri.simpan(toko(TOKO.sesiLogin), sesi);
  });
}

export async function sesiLewatToken(token: string): Promise<SesiLogin | undefined> {
  return jalankanTransaksi(TOKO.sesiLogin, 'readonly', (toko) =>
    kueri.ambil<SesiLogin>(toko(TOKO.sesiLogin), token),
  );
}

/** Logout membuang token sesi saja — tidak ada data lain yang tersentuh. */
export async function hapusSesi(token: string): Promise<void> {
  await jalankanTransaksi(TOKO.sesiLogin, 'readwrite', async (toko) => {
    await kueri.hapus(toko(TOKO.sesiLogin), token);
  });
}

export async function hapusSesiKedaluwarsa(sekarang = new Date()): Promise<number> {
  return jalankanTransaksi(TOKO.sesiLogin, 'readwrite', async (toko) => {
    const daftar = await kueri.semua<SesiLogin>(toko(TOKO.sesiLogin));
    const basi = daftar.filter((sesi) => new Date(sesi.kedaluwarsa).getTime() <= sekarang.getTime());
    for (const sesi of basi) {
      await kueri.hapus(toko(TOKO.sesiLogin), sesi.token);
    }
    return basi.length;
  });
}
