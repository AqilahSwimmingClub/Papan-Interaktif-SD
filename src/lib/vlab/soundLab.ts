/**
 * Sound Lab — gelombang bunyi, frekuensi, amplitudo, dan medium perambatan.
 *
 * Alat: sumber getar (garpu tala/pengeras suara), tabung medium, penerima.
 * Variabel: frekuensi, amplitudo, jenis medium, jarak penerima.
 * Logika: v bergantung medium, λ = v/f, peluruhan amplitudo terhadap jarak,
 * dan ambang pendengaran manusia 20–20.000 Hz. Tidak ada cahaya sama sekali.
 */

export interface MediumBunyi {
  kode: string;
  nama: string;
  /** Cepat rambat bunyi, m/s. */
  kecepatan: number;
  /** Peredaman per meter. */
  peredaman: number;
  warna: string;
}

export const MEDIUM_BUNYI: readonly MediumBunyi[] = [
  { kode: 'hampa', nama: 'Ruang hampa', kecepatan: 0, peredaman: 1, warna: '#2B2F3A' },
  { kode: 'udara', nama: 'Udara', kecepatan: 343, peredaman: 0.05, warna: '#DCEEFB' },
  { kode: 'air', nama: 'Air', kecepatan: 1480, peredaman: 0.02, warna: '#8FCBEA' },
  { kode: 'kayu', nama: 'Kayu', kecepatan: 3300, peredaman: 0.08, warna: '#C08B54' },
  { kode: 'besi', nama: 'Besi', kecepatan: 5120, peredaman: 0.01, warna: '#9AA5AD' },
];

export interface KeadaanSound {
  /** Frekuensi getaran, Hz. */
  frekuensiHz: number;
  /** Amplitudo sumber, 0–100. */
  amplitudo: number;
  mediumKode: string;
  /** Jarak penerima dari sumber, meter. */
  jarakMeter: number;
  sumberBergetar: boolean;
}

export type KategoriNada = 'infrasonik' | 'rendah' | 'sedang' | 'tinggi' | 'ultrasonik';

export interface HasilSound {
  medium: MediumBunyi;
  /** Cepat rambat pada medium terpilih, m/s. */
  kecepatan: number;
  /** Panjang gelombang, meter. 0 bila tidak merambat. */
  panjangGelombang: number;
  /** Amplitudo yang sampai di penerima, 0–100. */
  amplitudoDiterima: number;
  /** Waktu tempuh bunyi, detik. */
  waktuTempuh: number;
  terdengar: boolean;
  kategoriNada: KategoriNada;
  labelNada: string;
  /** Titik gelombang untuk digambar; sumbu x 0–100. */
  bentukGelombang: Array<{ x: number; y: number }>;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_SOUND: KeadaanSound = {
  frekuensiHz: 440,
  amplitudo: 70,
  mediumKode: 'udara',
  jarakMeter: 5,
  sumberBergetar: true,
};

const LABEL_NADA: Record<KategoriNada, string> = {
  infrasonik: 'Infrasonik — di bawah batas dengar manusia',
  rendah: 'Nada rendah',
  sedang: 'Nada sedang',
  tinggi: 'Nada tinggi',
  ultrasonik: 'Ultrasonik — di atas batas dengar manusia',
};

export function mediumBunyiDariKode(kode: string): MediumBunyi {
  return MEDIUM_BUNYI.find((medium) => medium.kode === kode) ?? MEDIUM_BUNYI[1]!;
}

export function golongkanNada(frekuensiHz: number): KategoriNada {
  if (frekuensiHz < 20) return 'infrasonik';
  if (frekuensiHz < 250) return 'rendah';
  if (frekuensiHz < 2000) return 'sedang';
  if (frekuensiHz <= 20000) return 'tinggi';
  return 'ultrasonik';
}

/** Merambatkan getaran sumber melalui medium menuju penerima. */
export function hitungSound(keadaan: KeadaanSound): HasilSound {
  const medium = mediumBunyiDariKode(keadaan.mediumKode);
  const bergetar = keadaan.sumberBergetar && keadaan.amplitudo > 0;
  const merambat = bergetar && medium.kecepatan > 0;
  const panjangGelombang = merambat ? medium.kecepatan / Math.max(1, keadaan.frekuensiHz) : 0;
  const amplitudoDiterima = merambat
    ? keadaan.amplitudo * Math.exp(-medium.peredaman * keadaan.jarakMeter)
    : 0;
  const kategoriNada = golongkanNada(keadaan.frekuensiHz);
  const terdengar =
    merambat &&
    amplitudoDiterima > 2 &&
    kategoriNada !== 'infrasonik' &&
    kategoriNada !== 'ultrasonik';

  // Satu periode gelombang dipetakan ke sumbu 0–100 agar frekuensi terlihat.
  const jumlahPuncak = Math.min(12, Math.max(1, Math.round(keadaan.frekuensiHz / 120)));
  const bentukGelombang = Array.from({ length: 101 }, (_, indeks) => ({
    x: indeks,
    y: merambat
      ? Math.sin((indeks / 100) * jumlahPuncak * 2 * Math.PI) * (amplitudoDiterima / 100)
      : 0,
  }));

  return {
    medium,
    kecepatan: medium.kecepatan,
    panjangGelombang,
    amplitudoDiterima,
    waktuTempuh: merambat ? keadaan.jarakMeter / medium.kecepatan : 0,
    terdengar,
    kategoriNada,
    labelNada: LABEL_NADA[kategoriNada],
    bentukGelombang,
    observasi: !bergetar
      ? 'Sumber tidak bergetar sehingga tidak ada gelombang bunyi yang dihasilkan.'
      : medium.kecepatan === 0
        ? 'Di ruang hampa tidak ada partikel perantara, jadi bunyi tidak merambat meskipun sumber bergetar.'
        : `Pada ${medium.nama.toLowerCase()} bunyi ${keadaan.frekuensiHz} Hz merambat ${medium.kecepatan} m/s dengan panjang gelombang ${panjangGelombang.toFixed(2)} m dan tiba setelah ${(keadaan.jarakMeter / medium.kecepatan).toFixed(4)} detik.`,
    kesimpulan:
      medium.kecepatan === 0
        ? 'Bunyi memerlukan medium perantara; di ruang hampa bunyi tidak dapat merambat.'
        : terdengar
          ? 'Frekuensi menentukan tinggi rendah nada, amplitudo menentukan kuat lemah bunyi, dan medium menentukan cepat rambatnya.'
          : 'Getaran tetap merambat, tetapi telinga manusia hanya menangkap bunyi 20–20.000 Hz dengan amplitudo yang cukup.',
  };
}

export function gantiMediumBunyi(keadaan: KeadaanSound, mediumKode: string): KeadaanSound {
  return { ...keadaan, mediumKode };
}
