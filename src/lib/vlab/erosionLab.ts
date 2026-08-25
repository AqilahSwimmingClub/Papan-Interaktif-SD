/**
 * Erosion Lab — pengaruh hujan, kemiringan, vegetasi, dan jenis tanah pada erosi.
 *
 * Alat: bak miring berisi tanah, penyiram hujan, penutup vegetasi, penampung air.
 * Variabel: curah hujan, sudut kemiringan, tutupan vegetasi, jenis tanah.
 * Logika: pendekatan sederhana model USLE — erosi sebanding dengan daya rusak
 * hujan, faktor kemiringan, faktor tanah, dan faktor penutup vegetasi.
 */

export interface JenisTanah {
  kode: string;
  nama: string;
  /** Faktor keterkikisan tanah. */
  keterkikisan: number;
  /** Daya serap air, mm/jam. */
  serapan: number;
  warna: string;
}

export const JENIS_TANAH: readonly JenisTanah[] = [
  { kode: 'pasir', nama: 'Tanah berpasir', keterkikisan: 0.42, serapan: 45, warna: '#E8CFA0' },
  { kode: 'lempung', nama: 'Tanah lempung', keterkikisan: 0.28, serapan: 22, warna: '#B98A5A' },
  { kode: 'liat', nama: 'Tanah liat', keterkikisan: 0.16, serapan: 8, warna: '#8C5A3C' },
  { kode: 'humus', nama: 'Tanah humus', keterkikisan: 0.11, serapan: 55, warna: '#5E4536' },
];

export interface KeadaanErosion {
  /** Curah hujan, mm/jam. */
  curahHujan: number;
  /** Kemiringan lereng, derajat. */
  kemiringan: number;
  /** Tutupan vegetasi, persen. */
  vegetasiPersen: number;
  tanahKode: string;
  hujanMenyala: boolean;
  /** Lama pengamatan, menit. */
  durasiMenit: number;
}

export type TingkatErosi = 'sangat_ringan' | 'ringan' | 'sedang' | 'berat' | 'sangat_berat';

export interface HasilErosion {
  tanah: JenisTanah;
  /** Air yang mengalir di permukaan, mm/jam. */
  limpasan: number;
  /** Tanah terkikis, ton per hektar selama durasi pengamatan. */
  tanahTerkikis: number;
  /** Kekeruhan air tampungan, 0–100. */
  kekeruhan: number;
  tingkat: TingkatErosi;
  labelTingkat: string;
  /** Ketinggian sisa lapisan tanah subur, persen. */
  sisaLapisanSubur: number;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_EROSION: KeadaanErosion = {
  curahHujan: 40,
  kemiringan: 20,
  vegetasiPersen: 30,
  tanahKode: 'lempung',
  hujanMenyala: true,
  durasiMenit: 30,
};

const LABEL: Record<TingkatErosi, string> = {
  sangat_ringan: 'Erosi sangat ringan',
  ringan: 'Erosi ringan',
  sedang: 'Erosi sedang',
  berat: 'Erosi berat',
  sangat_berat: 'Erosi sangat berat',
};

export function tanahDariKode(kode: string): JenisTanah {
  return JENIS_TANAH.find((tanah) => tanah.kode === kode) ?? JENIS_TANAH[1]!;
}

function golongkan(tonPerHektar: number): TingkatErosi {
  if (tonPerHektar < 0.5) return 'sangat_ringan';
  if (tonPerHektar < 2) return 'ringan';
  if (tonPerHektar < 6) return 'sedang';
  if (tonPerHektar < 15) return 'berat';
  return 'sangat_berat';
}

/** Menghitung limpasan dan tanah terkikis pada bak percobaan. */
export function hitungErosion(keadaan: KeadaanErosion): HasilErosion {
  const tanah = tanahDariKode(keadaan.tanahKode);
  const hujan = keadaan.hujanMenyala ? Math.max(0, keadaan.curahHujan) : 0;
  const vegetasi = Math.min(100, Math.max(0, keadaan.vegetasiPersen)) / 100;
  // Vegetasi menambah serapan tanah dan menahan butiran hujan.
  const serapanEfektif = tanah.serapan * (1 + vegetasi);
  const limpasan = Math.max(0, hujan - serapanEfektif);
  const faktorLereng = Math.pow(Math.sin((keadaan.kemiringan * Math.PI) / 180), 1.3) * 6.5;
  const faktorPenutup = Math.pow(1 - vegetasi, 2.2);
  const jam = Math.max(0, keadaan.durasiMenit) / 60;
  const tanahTerkikis =
    limpasan * 0.09 * tanah.keterkikisan * faktorLereng * faktorPenutup * jam * 10;
  const kekeruhan = Math.min(100, tanahTerkikis * 7 + limpasan * 0.4);
  const tingkat = golongkan(tanahTerkikis);

  return {
    tanah,
    limpasan,
    tanahTerkikis,
    kekeruhan,
    tingkat,
    labelTingkat: LABEL[tingkat],
    sisaLapisanSubur: Math.max(0, 100 - tanahTerkikis * 4),
    observasi: !keadaan.hujanMenyala
      ? 'Hujan dimatikan; tanpa air pengalir tidak terjadi erosi pada bak percobaan.'
      : `Hujan ${hujan} mm/jam pada lereng ${keadaan.kemiringan}° dengan tutupan vegetasi ${keadaan.vegetasiPersen}% menghasilkan limpasan ${limpasan.toFixed(1)} mm/jam dan mengikis ${tanahTerkikis.toFixed(2)} ton/ha; air tampungan keruh ${kekeruhan.toFixed(0)}%.`,
    kesimpulan:
      vegetasi >= 0.7
        ? 'Tutupan vegetasi rapat menahan butiran hujan dan mengikat tanah, sehingga air tampungan tetap jernih.'
        : keadaan.kemiringan >= 30
          ? 'Lereng yang curam mempercepat aliran air, sehingga tanah semakin banyak terbawa.'
          : 'Erosi bertambah ketika hujan makin deras, lereng makin curam, dan permukaan tanah makin terbuka.',
  };
}
