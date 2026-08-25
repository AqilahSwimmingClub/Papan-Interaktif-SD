/**
 * Material Lab — menggolongkan bahan menurut kemampuan meneruskan cahaya.
 *
 * Alat: lampu sumber, baki bahan, sensor cahaya di belakang bahan.
 * Variabel: jenis bahan, ketebalan, daya lampu.
 * Logika: penyerapan Beer–Lambert I = I₀ · e^(−μ·t) dengan μ khas tiap bahan,
 * ditambah pemantulan permukaan. Tidak ada cermin dan tidak ada sudut sinar —
 * lab ini hanya mengukur intensitas yang tembus.
 */

export type KategoriBahan = 'transparan' | 'translusen' | 'opak';

export interface BahanUji {
  kode: string;
  nama: string;
  /** Koefisien serap per milimeter. */
  koefisienSerap: number;
  /** Bagian cahaya yang dipantulkan permukaan (0–1). */
  pantulanPermukaan: number;
  /** Bagian cahaya tembus yang dihamburkan sehingga bayangan mengabur. */
  hamburan: number;
  warna: string;
}

export const BAHAN_UJI: readonly BahanUji[] = [
  { kode: 'udara', nama: 'Tanpa bahan (udara)', koefisienSerap: 0, pantulanPermukaan: 0, hamburan: 0, warna: '#EAF4FF' },
  { kode: 'kaca-bening', nama: 'Kaca bening', koefisienSerap: 0.004, pantulanPermukaan: 0.08, hamburan: 0.02, warna: '#CFE9F7' },
  { kode: 'plastik-bening', nama: 'Plastik bening', koefisienSerap: 0.012, pantulanPermukaan: 0.06, hamburan: 0.05, warna: '#DDF1EA' },
  { kode: 'kertas-minyak', nama: 'Kertas minyak', koefisienSerap: 0.22, pantulanPermukaan: 0.1, hamburan: 0.72, warna: '#F6E7C1' },
  { kode: 'kaca-buram', nama: 'Kaca buram (es)', koefisienSerap: 0.16, pantulanPermukaan: 0.12, hamburan: 0.65, warna: '#DCE6EC' },
  { kode: 'karton', nama: 'Karton tebal', koefisienSerap: 2.4, pantulanPermukaan: 0.2, hamburan: 0.9, warna: '#C89B6A' },
  { kode: 'kayu', nama: 'Papan kayu', koefisienSerap: 3.1, pantulanPermukaan: 0.18, hamburan: 0.95, warna: '#9A6B3F' },
  { kode: 'seng', nama: 'Pelat seng', koefisienSerap: 9, pantulanPermukaan: 0.45, hamburan: 1, warna: '#9AA5AD' },
];

export interface KeadaanMaterial {
  bahanKode: string;
  /** Ketebalan bahan pada baki, milimeter. */
  tebalMm: number;
  /** Daya lampu sumber, 0–100. */
  dayaLampu: number;
  lampuMenyala: boolean;
}

export interface HasilMaterial {
  bahan: BahanUji;
  /** Bagian cahaya yang diteruskan bahan, 0–1. */
  transmisi: number;
  /** Bacaan sensor 0–100 lux relatif. */
  bacaanSensor: number;
  kategori: KategoriBahan;
  labelKategori: string;
  /** Ketajaman bayangan di layar belakang, 0–1. */
  ketajamanBayangan: number;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_MATERIAL: KeadaanMaterial = {
  bahanKode: 'kaca-bening',
  tebalMm: 6,
  dayaLampu: 80,
  lampuMenyala: true,
};

const LABEL: Record<KategoriBahan, string> = {
  transparan: 'Transparan',
  translusen: 'Translusen',
  opak: 'Opak',
};

export function bahanDariKode(kode: string): BahanUji {
  return BAHAN_UJI.find((bahan) => bahan.kode === kode) ?? BAHAN_UJI[0]!;
}

/** Menggolongkan bahan dari bagian cahaya yang benar-benar tembus. */
export function golongkanTransmisi(transmisi: number, hamburan: number): KategoriBahan {
  if (transmisi < 0.08) return 'opak';
  if (hamburan > 0.35 || transmisi < 0.55) return 'translusen';
  return 'transparan';
}

/** Mengukur cahaya yang lolos melewati bahan pada baki. */
export function hitungMaterial(keadaan: KeadaanMaterial): HasilMaterial {
  const bahan = bahanDariKode(keadaan.bahanKode);
  const tebal = Math.max(0, keadaan.tebalMm);
  const setelahPantul = 1 - bahan.pantulanPermukaan;
  const transmisi = keadaan.lampuMenyala
    ? setelahPantul * Math.exp(-bahan.koefisienSerap * tebal)
    : 0;
  const kategori = golongkanTransmisi(
    setelahPantul * Math.exp(-bahan.koefisienSerap * tebal),
    bahan.hamburan,
  );
  const bacaanSensor = transmisi * keadaan.dayaLampu;
  const ketajamanBayangan = Math.max(0, 1 - bahan.hamburan);

  return {
    bahan,
    transmisi,
    bacaanSensor,
    kategori,
    labelKategori: LABEL[kategori],
    ketajamanBayangan,
    observasi: keadaan.lampuMenyala
      ? `${bahan.nama} setebal ${tebal} mm meneruskan ${(transmisi * 100).toFixed(1)}% cahaya; sensor membaca ${bacaanSensor.toFixed(1)} lux.`
      : 'Lampu mati sehingga sensor membaca 0 lux untuk semua bahan.',
    kesimpulan:
      kategori === 'transparan'
        ? 'Bahan transparan meneruskan hampir seluruh cahaya dan benda di baliknya masih terlihat jelas.'
        : kategori === 'translusen'
          ? 'Bahan translusen meneruskan sebagian cahaya sambil menghamburkannya, sehingga bentuk di baliknya tampak kabur.'
          : 'Bahan opak menahan cahaya sehingga sensor nyaris tidak menerima cahaya dan terbentuk bayangan gelap.',
  };
}

export function gantiBahan(keadaan: KeadaanMaterial, bahanKode: string): KeadaanMaterial {
  return { ...keadaan, bahanKode };
}
