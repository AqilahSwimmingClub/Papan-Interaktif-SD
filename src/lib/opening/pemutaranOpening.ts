import { log } from '../errors/logger';

/**
 * Opening diputar sekali per PEMBUKAAN APLIKASI, bukan sekali per muat halaman
 * (Tahap 11 §28). Penandanya sessionStorage: navigasi ke Login lalu kembali
 * tidak memutar ulang, tetapi menutup lalu membuka aplikasi memutarnya lagi.
 */
export const KUNCI_OPENING = 'papan-interaktif-sd:opening-selesai';

function simpanan(): Storage | null {
  try {
    return globalThis.sessionStorage ?? null;
  } catch (galat) {
    log.peringatan('sessionStorage tidak tersedia; Opening dianggap sudah tampil.', galat);
    return null;
  }
}

export function openingSudahTampil(): boolean {
  const toko = simpanan();
  // Tanpa sessionStorage, video tidak boleh terjebak berulang: anggap selesai.
  if (!toko) return true;
  return toko.getItem(KUNCI_OPENING) === '1';
}

export function tandaiOpeningSelesai(): void {
  simpanan()?.setItem(KUNCI_OPENING, '1');
}

export function resetOpening(): void {
  simpanan()?.removeItem(KUNCI_OPENING);
}
