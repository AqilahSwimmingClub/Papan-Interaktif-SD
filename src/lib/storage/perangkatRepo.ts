import { TOKO, jalankanTransaksi, kueri } from './db';

interface BarisPerangkat<T> {
  kunci: string;
  nilai: T;
}

/**
 * Penanda tingkat perangkat: id perangkat, penanda setup selesai, dan
 * preferensi lain yang tidak dimiliki satu akun pun.
 */
export const KUNCI_PERANGKAT = {
  idPerangkat: 'id_perangkat',
  setupSelesai: 'setup_selesai',
  versiSeedKurikulum: 'versi_seed_kurikulum',
  modePapanInteraktif: 'mode_papan_interaktif',
} as const;

export async function bacaPenanda<T>(kunci: string): Promise<T | undefined> {
  return jalankanTransaksi(TOKO.perangkat, 'readonly', async (toko) => {
    const baris = await kueri.ambil<BarisPerangkat<T>>(toko(TOKO.perangkat), kunci);
    return baris?.nilai;
  });
}

export async function tulisPenanda<T>(kunci: string, nilai: T): Promise<void> {
  await jalankanTransaksi(TOKO.perangkat, 'readwrite', async (toko) => {
    await kueri.simpan<BarisPerangkat<T>>(toko(TOKO.perangkat), { kunci, nilai });
  });
}

/**
 * Id perangkat dibuat sekali lalu dipakai kembali. Perangkat A dan B berdiri
 * sendiri — tidak ada penyatuan akun (Tahap 11 §30).
 */
export async function idPerangkat(): Promise<string> {
  const tersimpan = await bacaPenanda<string>(KUNCI_PERANGKAT.idPerangkat);
  if (tersimpan) return tersimpan;
  const baru = crypto.randomUUID();
  await tulisPenanda(KUNCI_PERANGKAT.idPerangkat, baru);
  return baru;
}
