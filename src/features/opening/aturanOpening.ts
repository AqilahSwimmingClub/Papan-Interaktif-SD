/** Aturan pemutaran Opening — Tahap 11 §28 dan M24. Nilainya terkunci. */

/** Transisi lembut ke Login setelah video selesai. */
export const DURASI_TRANSISI_MS = 400;

/** Batas waktu aman: durasi video + 5 detik. */
export const MARGIN_BATAS_AMAN_MS = 5_000;

/** Bila metadata tidak pernah tiba, jangan biarkan guru menatap layar hitam. */
export const BATAS_METADATA_MS = 15_000;

/**
 * Masa tenggang setelah janji play() ditolak. Penolakan tidak langsung
 * dianggap kegagalan: sebagian peramban memulai pemutaran sesaat kemudian.
 * Bila setelah tenggang ini video tetap tidak berjalan, pemutarannya memang
 * tidak dapat dilakukan dan aplikasi meneruskan ke Login — layar hitam yang
 * menunggu sampai batas aman jauh lebih buruk bagi guru di kelas.
 */
export const TENGGANG_AUTOPLAY_MS = 1_200;

/** contain bila selisih rasio video dan layar > 0,25; cover bila lebih rapat. */
export const AMBANG_SELISIH_RASIO = 0.25;

/**
 * Rasio dipertahankan mutlak. contain menyisakan letterbox navy #071A2E pada
 * HP tegak; cover dipakai bila rasio sudah rapat agar papan 75 inci tidak
 * berpita hitam lebar.
 */
export function pilihObjectFit(rasioVideo: number, rasioLayar: number): 'contain' | 'cover' {
  if (!Number.isFinite(rasioVideo) || rasioVideo <= 0) return 'contain';
  return Math.abs(rasioVideo - rasioLayar) > AMBANG_SELISIH_RASIO ? 'contain' : 'cover';
}
