/**
 * Magnet Lab — gaya tarik dan tolak kutub magnet serta bahan magnetis.
 *
 * Alat: dua magnet batang, penggaris jarak, kotak bahan uji.
 * Variabel: kutub yang berhadapan, jarak antarmagnet, kekuatan magnet, bahan uji.
 * Logika: besar gaya berbanding terbalik dengan kuadrat jarak; arah gaya
 * ditentukan pasangan kutub. Bahan uji dipisah magnetis dan non-magnetis.
 */

export type Kutub = 'utara' | 'selatan';

export interface BahanMagnetis {
  kode: string;
  nama: string;
  /** Kerentanan bahan terhadap magnet, 0–1. */
  kerentanan: number;
  ikon: string;
}

export const BAHAN_MAGNET: readonly BahanMagnetis[] = [
  { kode: 'besi', nama: 'Paku besi', kerentanan: 1, ikon: '🔩' },
  { kode: 'baja', nama: 'Klip baja', kerentanan: 0.85, ikon: '📎' },
  { kode: 'nikel', nama: 'Koin nikel', kerentanan: 0.55, ikon: '🪙' },
  { kode: 'alumunium', nama: 'Lembar alumunium', kerentanan: 0.02, ikon: '🥫' },
  { kode: 'plastik', nama: 'Sendok plastik', kerentanan: 0, ikon: '🥄' },
  { kode: 'kayu', nama: 'Balok kayu', kerentanan: 0, ikon: '🪵' },
];

export interface KeadaanMagnet {
  kutubKiri: Kutub;
  kutubKanan: Kutub;
  /** Jarak antar ujung magnet, cm. */
  jarakCm: number;
  /** Kekuatan tiap magnet, 1–10. */
  kekuatanKiri: number;
  kekuatanKanan: number;
  bahanUjiKode: string;
}

export type ArahGaya = 'tarik' | 'tolak';

export interface HasilMagnet {
  arah: ArahGaya;
  labelArah: string;
  /** Besar gaya dalam satuan sembarang, sebanding 1/r². */
  besarGaya: number;
  /** Perpindahan magnet kanan pada animasi, cm. Negatif = mendekat. */
  geseranMagnet: number;
  bahanUji: BahanMagnetis;
  bahanTertarik: boolean;
  /** Jarak maksimum bahan uji masih tertarik, cm. */
  jangkauanTarikBahan: number;
  /** Titik garis gaya untuk digambar. */
  garisGaya: Array<{ dari: number; ke: number; lengkung: number }>;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_MAGNET: KeadaanMagnet = {
  kutubKiri: 'utara',
  kutubKanan: 'selatan',
  jarakCm: 6,
  kekuatanKiri: 6,
  kekuatanKanan: 6,
  bahanUjiKode: 'besi',
};

export function bahanMagnetDariKode(kode: string): BahanMagnetis {
  return BAHAN_MAGNET.find((bahan) => bahan.kode === kode) ?? BAHAN_MAGNET[0]!;
}

/** Menghitung gaya antarkutub dan reaksi bahan uji. */
export function hitungMagnet(keadaan: KeadaanMagnet): HasilMagnet {
  const jarak = Math.max(0.5, keadaan.jarakCm);
  const arah: ArahGaya = keadaan.kutubKiri === keadaan.kutubKanan ? 'tolak' : 'tarik';
  const besarGaya = (keadaan.kekuatanKiri * keadaan.kekuatanKanan) / (jarak * jarak);
  const bahanUji = bahanMagnetDariKode(keadaan.bahanUjiKode);
  const jangkauanTarikBahan = bahanUji.kerentanan * keadaan.kekuatanKiri * 1.2;
  const bahanTertarik = bahanUji.kerentanan > 0.1 && jarak <= jangkauanTarikBahan;

  const jumlahGaris = Math.max(2, Math.min(7, Math.round(besarGaya * 2)));
  const garisGaya = Array.from({ length: jumlahGaris }, (_, indeks) => {
    const sisi = indeks - (jumlahGaris - 1) / 2;
    return {
      dari: 0,
      ke: arah === 'tarik' ? 1 : -1,
      lengkung: sisi * (arah === 'tarik' ? 6 : 11),
    };
  });

  return {
    arah,
    labelArah: arah === 'tarik' ? 'Kutub berbeda saling tarik-menarik' : 'Kutub sama saling tolak-menolak',
    besarGaya,
    geseranMagnet: (arah === 'tarik' ? -1 : 1) * Math.min(4, besarGaya),
    bahanUji,
    bahanTertarik,
    jangkauanTarikBahan,
    garisGaya,
    observasi: `Kutub ${keadaan.kutubKiri} berhadapan dengan kutub ${keadaan.kutubKanan} pada jarak ${jarak} cm: gaya ${arah === 'tarik' ? 'tarik' : 'tolak'} sebesar ${besarGaya.toFixed(2)} satuan. ${bahanUji.nama} ${bahanTertarik ? 'tertarik magnet' : 'tidak tertarik magnet'}.`,
    kesimpulan:
      arah === 'tarik'
        ? 'Kutub yang berbeda saling menarik, dan gaya itu menguat dengan cepat saat jarak diperkecil.'
        : 'Kutub yang sama saling menolak, dan gaya tolak melemah cepat saat jarak diperbesar.',
  };
}

export function balikKutub(keadaan: KeadaanMagnet, sisi: 'kiri' | 'kanan'): KeadaanMagnet {
  const balik = (kutub: Kutub): Kutub => (kutub === 'utara' ? 'selatan' : 'utara');
  return sisi === 'kiri'
    ? { ...keadaan, kutubKiri: balik(keadaan.kutubKiri) }
    : { ...keadaan, kutubKanan: balik(keadaan.kutubKanan) };
}
