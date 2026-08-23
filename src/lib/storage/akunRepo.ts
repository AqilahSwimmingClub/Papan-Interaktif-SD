import type { Akun, Peran } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';

export async function jumlahAkun(): Promise<number> {
  return jalankanTransaksi(TOKO.akun, 'readonly', (toko) => kueri.jumlah(toko(TOKO.akun)));
}

export async function adaAdmin(): Promise<boolean> {
  const daftar = await semuaAkun();
  return daftar.some((akun) => akun.peran === 'admin');
}

export async function semuaAkun(): Promise<Akun[]> {
  return jalankanTransaksi(TOKO.akun, 'readonly', (toko) => kueri.semua<Akun>(toko(TOKO.akun)));
}

export async function akunLewatId(id: string): Promise<Akun | undefined> {
  return jalankanTransaksi(TOKO.akun, 'readonly', (toko) =>
    kueri.ambil<Akun>(toko(TOKO.akun), id),
  );
}

export async function akunLewatUsername(username: string): Promise<Akun | undefined> {
  const kunci = normalkanUsername(username);
  return jalankanTransaksi(TOKO.akun, 'readonly', (toko) =>
    kueri.ambilLewatIndeks<Akun>(toko(TOKO.akun), 'username', kunci),
  );
}

export async function simpanAkun(akun: Akun): Promise<void> {
  await jalankanTransaksi(TOKO.akun, 'readwrite', async (toko) => {
    await kueri.simpan(toko(TOKO.akun), akun);
  });
}

export async function akunPertamaBerperan(peran: Peran): Promise<Akun | undefined> {
  const daftar = await semuaAkun();
  return daftar.find((akun) => akun.peran === peran);
}

export function normalkanUsername(username: string): string {
  return username.trim().toLowerCase();
}
