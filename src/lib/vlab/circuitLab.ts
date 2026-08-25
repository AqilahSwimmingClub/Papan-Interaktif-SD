/**
 * Circuit Lab — rangkaian listrik sederhana seri dan paralel.
 *
 * Alat: baterai, kabel, saklar, lampu.
 * Variabel: jumlah baterai, jumlah lampu, susunan rangkaian, saklar, kabel putus.
 * Logika: hukum Ohm pada rangkaian seri/paralel, daya tiap lampu, dan putusnya
 * arus saat salah satu lampu mati pada rangkaian seri.
 */

export type SusunanRangkaian = 'seri' | 'paralel';

/** Hambatan satu lampu, ohm. */
export const HAMBATAN_LAMPU = 6;
/** GGL satu baterai, volt. */
export const TEGANGAN_BATERAI = 1.5;
/** Daya nominal lampu, watt. */
export const DAYA_NOMINAL_LAMPU = 0.6;

export interface KeadaanCircuit {
  jumlahBaterai: number;
  jumlahLampu: number;
  susunan: SusunanRangkaian;
  saklarTertutup: boolean;
  /** Indeks lampu yang filamennya putus; kosong bila semua utuh. */
  lampuPutus: number[];
  kabelTerputus: boolean;
}

export type TerangLampu = 'padam' | 'redup' | 'normal' | 'sangat_terang' | 'putus';

export interface HasilCircuit {
  tegangan: number;
  hambatanTotal: number;
  /** Arus total dari baterai, ampere. */
  arusTotal: number;
  /** Arus yang melewati satu lampu, ampere. */
  arusPerLampu: number;
  dayaPerLampu: number;
  rangkaianTertutup: boolean;
  terang: TerangLampu[];
  labelTerang: string;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_CIRCUIT: KeadaanCircuit = {
  jumlahBaterai: 2,
  jumlahLampu: 2,
  susunan: 'seri',
  saklarTertutup: true,
  lampuPutus: [],
  kabelTerputus: false,
};

function nilaiTerang(daya: number): TerangLampu {
  if (daya <= 0.001) return 'padam';
  if (daya < DAYA_NOMINAL_LAMPU * 0.6) return 'redup';
  if (daya <= DAYA_NOMINAL_LAMPU * 1.6) return 'normal';
  return 'sangat_terang';
}

/** Menghitung arus, daya, dan nyala tiap lampu pada rangkaian. */
export function hitungCircuit(keadaan: KeadaanCircuit): HasilCircuit {
  const jumlahLampu = Math.max(1, keadaan.jumlahLampu);
  const putus = new Set(keadaan.lampuPutus.filter((indeks) => indeks < jumlahLampu));
  const tegangan = Math.max(0, keadaan.jumlahBaterai) * TEGANGAN_BATERAI;
  const saklarOn = keadaan.saklarTertutup && !keadaan.kabelTerputus;

  // Pada rangkaian seri, satu lampu putus memutus seluruh arus.
  const seriPutus = keadaan.susunan === 'seri' && putus.size > 0;
  const lampuMenyalaParalel = jumlahLampu - putus.size;
  const rangkaianTertutup =
    saklarOn && tegangan > 0 && !seriPutus && (keadaan.susunan === 'seri' || lampuMenyalaParalel > 0);

  const hambatanTotal =
    keadaan.susunan === 'seri'
      ? HAMBATAN_LAMPU * jumlahLampu
      : HAMBATAN_LAMPU / Math.max(1, lampuMenyalaParalel);
  const arusTotal = rangkaianTertutup ? tegangan / hambatanTotal : 0;
  const arusPerLampu =
    keadaan.susunan === 'seri' ? arusTotal : arusTotal / Math.max(1, lampuMenyalaParalel);
  const dayaPerLampu = arusPerLampu * arusPerLampu * HAMBATAN_LAMPU;

  const terang: TerangLampu[] = Array.from({ length: jumlahLampu }, (_, indeks) =>
    putus.has(indeks) ? 'putus' : nilaiTerang(dayaPerLampu),
  );
  const contohTerang = terang.find((nilai) => nilai !== 'putus') ?? 'padam';
  const LABEL: Record<TerangLampu, string> = {
    padam: 'Semua lampu padam',
    redup: 'Lampu menyala redup',
    normal: 'Lampu menyala normal',
    sangat_terang: 'Lampu menyala sangat terang dan berisiko putus',
    putus: 'Filamen lampu putus',
  };

  return {
    tegangan,
    hambatanTotal,
    arusTotal,
    arusPerLampu,
    dayaPerLampu,
    rangkaianTertutup,
    terang,
    labelTerang: LABEL[contohTerang],
    observasi: !saklarOn
      ? 'Rangkaian terbuka: saklar terbuka atau kabel terputus, sehingga arus tidak mengalir sama sekali.'
      : seriPutus
        ? 'Satu lampu putus pada rangkaian seri memutus jalur arus, sehingga semua lampu ikut padam.'
        : `${keadaan.jumlahBaterai} baterai (${tegangan.toFixed(1)} V) pada rangkaian ${keadaan.susunan} dengan ${jumlahLampu} lampu menghasilkan arus ${arusTotal.toFixed(2)} A dan daya ${dayaPerLampu.toFixed(2)} W per lampu.`,
    kesimpulan:
      !rangkaianTertutup
        ? 'Arus listrik hanya mengalir pada rangkaian tertutup; satu titik terputus membuat seluruh lampu padam.'
        : keadaan.susunan === 'seri'
          ? 'Pada rangkaian seri, menambah lampu membagi tegangan sehingga tiap lampu meredup dan satu lampu putus mematikan semuanya.'
          : 'Pada rangkaian paralel, tiap lampu memperoleh tegangan penuh sehingga tetap terang dan satu lampu putus tidak mematikan yang lain.',
  };
}

export function alihkanLampuPutus(keadaan: KeadaanCircuit, indeks: number): KeadaanCircuit {
  const ada = keadaan.lampuPutus.includes(indeks);
  return {
    ...keadaan,
    lampuPutus: ada
      ? keadaan.lampuPutus.filter((item) => item !== indeks)
      : [...keadaan.lampuPutus, indeks],
  };
}
