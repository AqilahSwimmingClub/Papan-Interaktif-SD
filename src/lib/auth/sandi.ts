import { AppError } from '../errors/AppError';

/**
 * Turunan kunci sandi.
 *
 * Aturan terkunci (Tahap 11 §30, MASTER SPECIFICATION FINAL §4 Zona 6):
 * sandi TIDAK PERNAH disimpan sebagai teks terbuka; yang disimpan adalah hash
 * berimbuhan acak dari fungsi turunan kunci LAMBAT berbiaya kerja tinggi —
 * bukan hash cepat seperti SHA-256 sekali jalan.
 */
export const KDF_ALGORITMA = 'PBKDF2-SHA256';
export const KDF_ITERASI = 210_000;
const PANJANG_IMBUHAN = 16;
const PANJANG_KUNCI_BIT = 256;

export interface HasilTurunan {
  hash: string;
  imbuhan: string;
  algoritma: string;
  iterasi: number;
}

function subtle(): SubtleCrypto {
  const kripto = globalThis.crypto;
  if (!kripto?.subtle) {
    throw new AppError(
      'KRIPTO_TIDAK_TERSEDIA',
      'Peramban ini tidak menyediakan Web Crypto. Buka aplikasi lewat HTTPS atau localhost.',
    );
  }
  return kripto.subtle;
}

export function keBase64(data: ArrayBuffer | Uint8Array): string {
  const bita = data instanceof Uint8Array ? data : new Uint8Array(data);
  let teks = '';
  for (const nilai of bita) teks += String.fromCharCode(nilai);
  return btoa(teks);
}

export function dariBase64(teks: string): Uint8Array {
  const biner = atob(teks);
  const bita = new Uint8Array(biner.length);
  for (let i = 0; i < biner.length; i += 1) bita[i] = biner.charCodeAt(i);
  return bita;
}

export function imbuhanAcak(panjang = PANJANG_IMBUHAN): Uint8Array {
  const bita = new Uint8Array(panjang);
  globalThis.crypto.getRandomValues(bita);
  return bita;
}

async function turunkan(
  sandi: string,
  imbuhan: Uint8Array,
  iterasi: number,
): Promise<ArrayBuffer> {
  const kunciDasar = await subtle().importKey(
    'raw',
    new TextEncoder().encode(sandi),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return subtle().deriveBits(
    {
      name: 'PBKDF2',
      // Salinan agar tipe BufferSource cocok di seluruh runtime.
      salt: imbuhan.slice() as unknown as BufferSource,
      iterations: iterasi,
      hash: 'SHA-256',
    },
    kunciDasar,
    PANJANG_KUNCI_BIT,
  );
}

/** Membuat hash baru beserta imbuhan acaknya. */
export async function hashSandi(sandi: string, iterasi = KDF_ITERASI): Promise<HasilTurunan> {
  const imbuhan = imbuhanAcak();
  const kunci = await turunkan(sandi, imbuhan, iterasi);
  return {
    hash: keBase64(kunci),
    imbuhan: keBase64(imbuhan),
    algoritma: KDF_ALGORITMA,
    iterasi,
  };
}

/** Perbandingan waktu tetap — panjang sama, tanpa keluar lebih awal. */
export function samaWaktuTetap(a: string, b: string): boolean {
  const kiri = new TextEncoder().encode(a);
  const kanan = new TextEncoder().encode(b);
  if (kiri.length !== kanan.length) return false;
  let beda = 0;
  for (let i = 0; i < kiri.length; i += 1) beda |= kiri[i] ^ kanan[i];
  return beda === 0;
}

export async function periksaSandi(
  sandi: string,
  hashTersimpan: string,
  imbuhanTersimpan: string,
  iterasi = KDF_ITERASI,
): Promise<boolean> {
  const kunci = await turunkan(sandi, dariBase64(imbuhanTersimpan), iterasi);
  return samaWaktuTetap(keBase64(kunci), hashTersimpan);
}

/** Token sesi acak 256 bit, heksadesimal. */
export function tokenAcak(): string {
  const bita = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bita);
  return Array.from(bita, (nilai) => nilai.toString(16).padStart(2, '0')).join('');
}
