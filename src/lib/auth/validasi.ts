import { AppError } from '../errors/AppError';

export const PANJANG_SANDI_MINIMUM = 8;

const POLA_USERNAME = /^[a-z0-9](?:[a-z0-9._-]{1,30})[a-z0-9]$/;

export function validasiNama(nama: string): string {
  const bersih = nama.trim();
  if (bersih.length < 3) {
    throw new AppError('VALIDASI', 'Nama Admin minimal 3 karakter.', { field: 'nama' });
  }
  if (bersih.length > 80) {
    throw new AppError('VALIDASI', 'Nama Admin maksimal 80 karakter.', { field: 'nama' });
  }
  return bersih;
}

export function validasiUsername(username: string): string {
  const bersih = username.trim().toLowerCase();
  if (bersih.length < 3) {
    throw new AppError('VALIDASI', 'Username minimal 3 karakter.', { field: 'username' });
  }
  if (!POLA_USERNAME.test(bersih)) {
    throw new AppError(
      'VALIDASI',
      'Username hanya boleh huruf kecil, angka, titik, garis bawah, dan tanda hubung, serta diawali dan diakhiri huruf atau angka.',
      { field: 'username' },
    );
  }
  return bersih;
}

export function validasiSandi(sandi: string): string {
  if (sandi.length < PANJANG_SANDI_MINIMUM) {
    throw new AppError('VALIDASI', `Password minimal ${PANJANG_SANDI_MINIMUM} karakter.`, {
      field: 'password',
    });
  }
  if (sandi.length > 128) {
    throw new AppError('VALIDASI', 'Password maksimal 128 karakter.', { field: 'password' });
  }
  return sandi;
}

export function validasiKonfirmasi(sandi: string, konfirmasi: string): void {
  if (sandi !== konfirmasi) {
    throw new AppError('VALIDASI', 'Konfirmasi password belum sama.', { field: 'konfirmasi' });
  }
}

export type KekuatanSandi = 'lemah' | 'sedang' | 'kuat' | 'sangat_kuat';

/** Indikator empat batang pada layar Setup Admin (Tahap 11 §30). */
export function kekuatanSandi(sandi: string): { tingkat: KekuatanSandi; skor: number; label: string } {
  let skor = 0;
  if (sandi.length >= PANJANG_SANDI_MINIMUM) skor += 1;
  if (sandi.length >= 12) skor += 1;
  if (/[a-z]/.test(sandi) && /[A-Z]/.test(sandi)) skor += 1;
  if (/\d/.test(sandi)) skor += 1;
  if (/[^A-Za-z0-9]/.test(sandi)) skor += 1;

  const tingkat: KekuatanSandi =
    skor <= 1 ? 'lemah' : skor === 2 ? 'sedang' : skor === 3 || skor === 4 ? 'kuat' : 'sangat_kuat';
  const label =
    tingkat === 'lemah'
      ? 'Lemah'
      : tingkat === 'sedang'
        ? 'Sedang'
        : tingkat === 'kuat'
          ? 'Kuat'
          : 'Sangat kuat';

  return { tingkat, skor: Math.min(skor, 4), label };
}
