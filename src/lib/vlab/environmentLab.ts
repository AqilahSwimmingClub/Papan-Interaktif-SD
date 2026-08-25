/**
 * Environment Lab — dampak perilaku manusia pada kualitas lingkungan desa.
 *
 * Alat: peta desa dengan sungai, permukiman, pepohonan, dan tempat sampah.
 * Variabel: sampah harian, cakupan pengelolaan sampah, jumlah pohon,
 * limbah cair, dan kendaraan bermotor.
 * Logika: tiga indeks terpisah (air, udara, tanah) dihitung dari tekanan
 * pencemar dikurangi daya pulih lingkungan, lalu diringkas menjadi skor desa.
 */

export interface KeadaanEnvironment {
  /** Sampah yang dihasilkan warga, kg/hari. */
  sampahKgPerHari: number;
  /** Sampah yang terkelola (diangkut/didaur ulang), persen. */
  pengelolaanPersen: number;
  /** Jumlah pohon di desa. */
  jumlahPohon: number;
  /** Limbah cair yang dibuang ke sungai, liter/hari. */
  limbahCairLiter: number;
  /** Kendaraan bermotor yang beroperasi tiap hari. */
  kendaraanBermotor: number;
}

export type KategoriLingkungan = 'sangat_baik' | 'baik' | 'sedang' | 'buruk' | 'kritis';

export interface HasilEnvironment {
  /** Sampah yang berakhir mencemari, kg/hari. */
  sampahTercecer: number;
  /** Indeks kualitas air 0–100. */
  indeksAir: number;
  /** Indeks kualitas udara 0–100. */
  indeksUdara: number;
  /** Indeks kesuburan tanah 0–100. */
  indeksTanah: number;
  skorLingkungan: number;
  kategori: KategoriLingkungan;
  labelKategori: string;
  /** Serapan karbon oleh pohon, kg CO₂/hari. */
  serapanKarbon: number;
  /** Ikan yang masih hidup di sungai, persen. */
  ikanBertahan: number;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_ENVIRONMENT: KeadaanEnvironment = {
  sampahKgPerHari: 300,
  pengelolaanPersen: 40,
  jumlahPohon: 120,
  limbahCairLiter: 2000,
  kendaraanBermotor: 250,
};

const LABEL: Record<KategoriLingkungan, string> = {
  sangat_baik: 'Lingkungan sangat baik',
  baik: 'Lingkungan baik',
  sedang: 'Lingkungan cukup, perlu perbaikan',
  buruk: 'Lingkungan buruk',
  kritis: 'Lingkungan kritis',
};

function batas(nilai: number): number {
  return Math.min(100, Math.max(0, nilai));
}

function golongkan(skor: number): KategoriLingkungan {
  if (skor >= 85) return 'sangat_baik';
  if (skor >= 70) return 'baik';
  if (skor >= 50) return 'sedang';
  if (skor >= 30) return 'buruk';
  return 'kritis';
}

/** Menilai kualitas air, udara, dan tanah desa dari tekanan pencemar. */
export function hitungEnvironment(keadaan: KeadaanEnvironment): HasilEnvironment {
  const terkelola = Math.min(100, Math.max(0, keadaan.pengelolaanPersen)) / 100;
  const sampahTercecer = Math.max(0, keadaan.sampahKgPerHari) * (1 - terkelola);
  const pohon = Math.max(0, keadaan.jumlahPohon);
  const serapanKarbon = pohon * 0.06;

  const indeksAir = batas(
    100 - keadaan.limbahCairLiter / 60 - sampahTercecer / 5 + pohon / 30,
  );
  const indeksUdara = batas(
    100 - keadaan.kendaraanBermotor / 6 - sampahTercecer / 12 + serapanKarbon * 1.6,
  );
  const indeksTanah = batas(100 - sampahTercecer / 4 + pohon / 12);
  const skorLingkungan = (indeksAir + indeksUdara + indeksTanah) / 3;
  const kategori = golongkan(skorLingkungan);

  return {
    sampahTercecer,
    indeksAir,
    indeksUdara,
    indeksTanah,
    skorLingkungan,
    kategori,
    labelKategori: LABEL[kategori],
    serapanKarbon,
    ikanBertahan: batas(indeksAir * 1.1 - 10),
    observasi: `Sampah tercecer ${sampahTercecer.toFixed(0)} kg/hari, limbah cair ${keadaan.limbahCairLiter} liter/hari, dan ${keadaan.kendaraanBermotor} kendaraan menghasilkan indeks air ${indeksAir.toFixed(0)}, udara ${indeksUdara.toFixed(0)}, tanah ${indeksTanah.toFixed(0)}; skor desa ${skorLingkungan.toFixed(0)}.`,
    kesimpulan:
      kategori === 'sangat_baik' || kategori === 'baik'
        ? 'Mengelola sampah dan menanam pohon menjaga air tetap jernih, udara segar, dan tanah subur.'
        : kategori === 'sedang'
          ? 'Lingkungan masih dapat pulih bila pengelolaan sampah ditingkatkan dan limbah cair dikurangi.'
          : 'Sampah yang tidak terkelola dan limbah yang dibuang ke sungai menurunkan kualitas air, udara, dan tanah sekaligus.',
  };
}
