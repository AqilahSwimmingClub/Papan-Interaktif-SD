import type { Sekolah } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';

/**
 * Satu perangkat melayani satu sekolah. Identitas sekolah TIDAK PERNAH ditulis
 * di kode (MASTER SPECIFICATION FINAL §1 butir 9) — seluruhnya dari tabel ini.
 */
export const ID_SEKOLAH_TUNGGAL = 'sekolah-perangkat-ini';

export function sekolahKosong(): Sekolah {
  return {
    id: ID_SEKOLAH_TUNGGAL,
    nama: '',
    npsn: '',
    alamat: '',
    kepala_sekolah: '',
    logo_berkas: null,
    kop_cetak: '',
    kertas_bawaan: 'A4',
  };
}

export async function bacaSekolah(): Promise<Sekolah | undefined> {
  return jalankanTransaksi(TOKO.sekolah, 'readonly', (toko) =>
    kueri.ambil<Sekolah>(toko(TOKO.sekolah), ID_SEKOLAH_TUNGGAL),
  );
}

export async function simpanSekolah(sekolah: Sekolah): Promise<void> {
  await jalankanTransaksi(TOKO.sekolah, 'readwrite', async (toko) => {
    await kueri.simpan(toko(TOKO.sekolah), { ...sekolah, id: ID_SEKOLAH_TUNGGAL });
  });
}
