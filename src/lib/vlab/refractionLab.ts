/**
 * Refraction Lab — pembiasan cahaya saat berpindah medium.
 *
 * Alat: laser tipis, bak dua medium, busur derajat.
 * Variabel: sudut datang terhadap garis normal, medium atas, medium bawah.
 * Logika: hukum Snellius n₁·sin θ₁ = n₂·sin θ₂, lengkap dengan sudut kritis
 * dan pemantulan sempurna. Tidak ada cermin dan tidak ada papan berlubang.
 */

export interface Medium {
  kode: string;
  nama: string;
  /** Indeks bias. */
  indeks: number;
  warna: string;
}

export const MEDIUM_TERSEDIA: readonly Medium[] = [
  { kode: 'udara', nama: 'Udara', indeks: 1.0, warna: '#EAF6FF' },
  { kode: 'air', nama: 'Air', indeks: 1.33, warna: '#9CD3F2' },
  { kode: 'minyak', nama: 'Minyak goreng', indeks: 1.47, warna: '#F2D98C' },
  { kode: 'kaca', nama: 'Kaca', indeks: 1.52, warna: '#BFD8DE' },
  { kode: 'intan', nama: 'Intan', indeks: 2.42, warna: '#DCE8F5' },
];

export interface KeadaanRefraction {
  /** Sudut datang terhadap garis normal, derajat (0–89). */
  sudutDatang: number;
  mediumAtasKode: string;
  mediumBawahKode: string;
  laserMenyala: boolean;
}

export type ArahPembelokan = 'mendekati_normal' | 'menjauhi_normal' | 'lurus';

export interface HasilRefraction {
  mediumAtas: Medium;
  mediumBawah: Medium;
  /** Sudut bias terhadap normal, derajat. null saat pemantulan sempurna. */
  sudutBias: number | null;
  /** Sudut kritis, derajat. null bila tidak mungkin terjadi. */
  sudutKritis: number | null;
  pemantulanSempurna: boolean;
  arah: ArahPembelokan;
  labelArah: string;
  /** Laju cahaya relatif di medium bawah terhadap ruang hampa. */
  lajuRelatifBawah: number;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_REFRACTION: KeadaanRefraction = {
  sudutDatang: 35,
  mediumAtasKode: 'udara',
  mediumBawahKode: 'air',
  laserMenyala: true,
};

const LABEL: Record<ArahPembelokan, string> = {
  mendekati_normal: 'Sinar bias membelok mendekati garis normal',
  menjauhi_normal: 'Sinar bias membelok menjauhi garis normal',
  lurus: 'Sinar diteruskan lurus tanpa dibelokkan',
};

export function mediumDariKode(kode: string): Medium {
  return MEDIUM_TERSEDIA.find((medium) => medium.kode === kode) ?? MEDIUM_TERSEDIA[0]!;
}

/** Menerapkan hukum Snellius pada batas dua medium. */
export function hitungRefraction(keadaan: KeadaanRefraction): HasilRefraction {
  const mediumAtas = mediumDariKode(keadaan.mediumAtasKode);
  const mediumBawah = mediumDariKode(keadaan.mediumBawahKode);
  const rad = Math.PI / 180;
  const sudutDatang = Math.min(89.5, Math.max(0, keadaan.sudutDatang));
  const sinBias = (mediumAtas.indeks * Math.sin(sudutDatang * rad)) / mediumBawah.indeks;
  const pemantulanSempurna = keadaan.laserMenyala && sinBias > 1;
  const sudutBias = pemantulanSempurna || !keadaan.laserMenyala
    ? null
    : Math.asin(Math.min(1, sinBias)) / rad;
  const sudutKritis =
    mediumAtas.indeks > mediumBawah.indeks
      ? Math.asin(mediumBawah.indeks / mediumAtas.indeks) / rad
      : null;
  const arah: ArahPembelokan =
    mediumBawah.indeks === mediumAtas.indeks
      ? 'lurus'
      : mediumBawah.indeks > mediumAtas.indeks
        ? 'mendekati_normal'
        : 'menjauhi_normal';

  return {
    mediumAtas,
    mediumBawah,
    sudutBias,
    sudutKritis,
    pemantulanSempurna,
    arah,
    labelArah: LABEL[arah],
    lajuRelatifBawah: 1 / mediumBawah.indeks,
    observasi: !keadaan.laserMenyala
      ? 'Laser mati, tidak ada sinar datang maupun sinar bias.'
      : pemantulanSempurna
        ? `Sudut datang ${sudutDatang.toFixed(0)}° melampaui sudut kritis ${sudutKritis?.toFixed(1) ?? '-'}°, sehingga cahaya tidak menembus batas dan seluruhnya dipantulkan kembali.`
        : `Sudut datang ${sudutDatang.toFixed(0)}° di ${mediumAtas.nama} menjadi sudut bias ${sudutBias?.toFixed(1) ?? '-'}° di ${mediumBawah.nama}.`,
    kesimpulan:
      arah === 'lurus'
        ? 'Kedua medium memiliki indeks bias sama, sehingga cahaya tidak berubah arah.'
        : arah === 'mendekati_normal'
          ? 'Saat masuk medium lebih rapat, laju cahaya berkurang dan sinar dibelokkan mendekati garis normal.'
          : 'Saat masuk medium lebih renggang, laju cahaya bertambah dan sinar dibelokkan menjauhi garis normal.',
  };
}

export function ubahSudutDatang(keadaan: KeadaanRefraction, sudut: number): KeadaanRefraction {
  return { ...keadaan, sudutDatang: Math.min(89, Math.max(0, sudut)) };
}
