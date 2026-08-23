/**
 * Log lokal. Aplikasi luring: kegagalan dicatat, tidak dikirim ke luar
 * (MASTER SPECIFICATION FINAL §1 butir 7 — batas offline).
 */
type Tingkat = 'info' | 'peringatan' | 'galat';

export interface BarisLog {
  tingkat: Tingkat;
  waktu: string;
  pesan: string;
  detail?: unknown;
}

const BATAS_RIWAYAT = 100;
const riwayat: BarisLog[] = [];

function catat(tingkat: Tingkat, pesan: string, detail?: unknown): void {
  const baris: BarisLog = { tingkat, waktu: new Date().toISOString(), pesan, detail };
  riwayat.push(baris);
  if (riwayat.length > BATAS_RIWAYAT) riwayat.shift();

  if (typeof console === 'undefined') return;
  const tulis = tingkat === 'galat' ? console.error : tingkat === 'peringatan' ? console.warn : console.info;
  tulis.call(console, `[papan-interaktif] ${pesan}`, detail ?? '');
}

export const log = {
  info: (pesan: string, detail?: unknown) => catat('info', pesan, detail),
  peringatan: (pesan: string, detail?: unknown) => catat('peringatan', pesan, detail),
  galat: (pesan: string, detail?: unknown) => catat('galat', pesan, detail),
  riwayat: (): readonly BarisLog[] => [...riwayat],
  bersihkan: (): void => {
    riwayat.length = 0;
  },
};
