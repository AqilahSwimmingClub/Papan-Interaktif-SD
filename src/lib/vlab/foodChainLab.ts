/**
 * Food Chain Lab — hubungan makan dan keseimbangan populasi.
 *
 * Alat: petak ekosistem berisi rumput, belalang, katak, ular, elang, pengurai.
 * Variabel: populasi awal tiap organisme dan organisme yang dihilangkan.
 * Logika: model mangsa–pemangsa diskret bertahap; tiap organisme tumbuh dari
 * mangsanya dan berkurang karena pemangsanya. Tidak ada geometri cahaya di sini.
 */

export type KodeOrganisme = 'rumput' | 'belalang' | 'katak' | 'ular' | 'elang' | 'pengurai';

export interface Organisme {
  kode: KodeOrganisme;
  nama: string;
  peran: string;
  tingkat: number;
  /** Organisme yang dimakan; kosong untuk produsen. */
  mangsa: KodeOrganisme[];
  ikon: string;
  warna: string;
}

export const RANTAI_MAKANAN: readonly Organisme[] = [
  { kode: 'rumput', nama: 'Rumput', peran: 'Produsen', tingkat: 1, mangsa: [], ikon: '🌿', warna: '#7CB342' },
  { kode: 'belalang', nama: 'Belalang', peran: 'Konsumen I', tingkat: 2, mangsa: ['rumput'], ikon: '🦗', warna: '#AED581' },
  { kode: 'katak', nama: 'Katak', peran: 'Konsumen II', tingkat: 3, mangsa: ['belalang'], ikon: '🐸', warna: '#4DB6AC' },
  { kode: 'ular', nama: 'Ular', peran: 'Konsumen III', tingkat: 4, mangsa: ['katak'], ikon: '🐍', warna: '#8D6E63' },
  { kode: 'elang', nama: 'Elang', peran: 'Konsumen puncak', tingkat: 5, mangsa: ['ular'], ikon: '🦅', warna: '#795548' },
  { kode: 'pengurai', nama: 'Jamur pengurai', peran: 'Pengurai', tingkat: 0, mangsa: [], ikon: '🍄', warna: '#A1887F' },
];

export type Populasi = Record<KodeOrganisme, number>;

export interface KeadaanFoodChain {
  populasi: Populasi;
  /** Organisme yang dihapus siswa dari ekosistem. */
  dihilangkan: KodeOrganisme[];
  /** Jumlah musim yang disimulasikan. */
  musim: number;
}

export type StatusEkosistem = 'seimbang' | 'terganggu' | 'runtuh';

export interface HasilFoodChain {
  /** Populasi tiap musim, termasuk musim 0. */
  riwayat: Populasi[];
  populasiAkhir: Populasi;
  /** Perubahan populasi dari awal ke akhir, persen. */
  perubahanPersen: Record<KodeOrganisme, number>;
  status: StatusEkosistem;
  labelStatus: string;
  organismePunah: KodeOrganisme[];
  organismeMeledak: KodeOrganisme[];
  observasi: string;
  kesimpulan: string;
}

export const POPULASI_AWAL: Populasi = {
  rumput: 1000,
  belalang: 300,
  katak: 80,
  ular: 25,
  elang: 8,
  pengurai: 120,
};

export const KEADAAN_AWAL_FOOD_CHAIN: KeadaanFoodChain = {
  populasi: { ...POPULASI_AWAL },
  dihilangkan: [],
  musim: 8,
};

const LABEL_STATUS: Record<StatusEkosistem, string> = {
  seimbang: 'Ekosistem seimbang',
  terganggu: 'Ekosistem terganggu',
  runtuh: 'Rantai makanan terputus',
};

/** Daya dukung lingkungan untuk produsen. */
const DAYA_DUKUNG = 1600;

/**
 * Tetapan model mangsa–pemangsa.
 *
 * Nilainya dipilih agar populasi awal pada `POPULASI_AWAL` tepat berada di
 * titik seimbang: ekosistem lengkap bertahan stabil, dan setiap organisme yang
 * dihilangkan langsung menggeser seluruh rantai.
 */
const LAJU = {
  /** Pertumbuhan rumput dan tekanan makan belalang. */
  tumbuhRumput: 0.5,
  dimakanBelalang: 0.000625,
  /** Belalang: hasil makan rumput, kematian alami, tekanan katak. */
  belalangDariRumput: 0.0008,
  belalangMati: 0.48,
  dimakanKatak: 0.004,
  /** Katak: hasil makan belalang, kematian alami, tekanan ular. */
  katakDariBelalang: 0.0012,
  katakMati: 0.16,
  dimakanUlar: 0.008,
  /** Ular: hasil makan katak, kematian alami, tekanan elang. */
  ularDariKatak: 0.005,
  ularMati: 0.24,
  dimakanElang: 0.02,
  /** Elang: hasil makan ular dan kematian alami. */
  elangDariUlar: 0.012,
  elangMati: 0.3,
  /** Pertumbuhan pengurai menuju batas 200. */
  tumbuhPengurai: 0.12,
  batasPengurai: 200,
} as const;

function satuMusim(sekarang: Populasi, hilang: Set<KodeOrganisme>): Populasi {
  const ambil = (kode: KodeOrganisme) => (hilang.has(kode) ? 0 : Math.max(0, sekarang[kode]));
  const rumput = ambil('rumput');
  const belalang = ambil('belalang');
  const katak = ambil('katak');
  const ular = ambil('ular');
  const elang = ambil('elang');
  const pengurai = ambil('pengurai');

  // Pengurai mengembalikan hara; tanpa pengurai daya dukung rumput menyusut.
  const suburan = pengurai > 0 ? 1 : 0.55;
  const berikut: Populasi = {
    rumput:
      rumput +
      LAJU.tumbuhRumput * rumput * (1 - rumput / (DAYA_DUKUNG * suburan)) -
      LAJU.dimakanBelalang * rumput * belalang,
    belalang:
      belalang +
      belalang * (LAJU.belalangDariRumput * rumput - LAJU.belalangMati) -
      LAJU.dimakanKatak * belalang * katak,
    katak:
      katak +
      katak * (LAJU.katakDariBelalang * belalang - LAJU.katakMati) -
      LAJU.dimakanUlar * katak * ular,
    ular:
      ular +
      ular * (LAJU.ularDariKatak * katak - LAJU.ularMati) -
      LAJU.dimakanElang * ular * elang,
    elang: elang + elang * (LAJU.elangDariUlar * ular - LAJU.elangMati),
    pengurai:
      pengurai + pengurai * LAJU.tumbuhPengurai * (1 - pengurai / LAJU.batasPengurai),
  };

  const hasil = {} as Populasi;
  for (const organisme of RANTAI_MAKANAN) {
    hasil[organisme.kode] = hilang.has(organisme.kode)
      ? 0
      : Math.max(0, Math.round(berikut[organisme.kode]));
  }
  return hasil;
}

/** Menjalankan simulasi populasi selama sejumlah musim. */
export function hitungFoodChain(keadaan: KeadaanFoodChain): HasilFoodChain {
  const hilang = new Set(keadaan.dihilangkan);
  const awal = {} as Populasi;
  for (const organisme of RANTAI_MAKANAN) {
    awal[organisme.kode] = hilang.has(organisme.kode) ? 0 : Math.max(0, keadaan.populasi[organisme.kode]);
  }

  const riwayat: Populasi[] = [awal];
  for (let musim = 0; musim < Math.max(1, keadaan.musim); musim += 1) {
    riwayat.push(satuMusim(riwayat[riwayat.length - 1]!, hilang));
  }
  const populasiAkhir = riwayat[riwayat.length - 1]!;

  const perubahanPersen = {} as Record<KodeOrganisme, number>;
  const organismePunah: KodeOrganisme[] = [];
  const organismeMeledak: KodeOrganisme[] = [];
  for (const organisme of RANTAI_MAKANAN) {
    const mula = POPULASI_AWAL[organisme.kode];
    const akhir = populasiAkhir[organisme.kode];
    perubahanPersen[organisme.kode] = mula ? ((akhir - mula) / mula) * 100 : 0;
    if (akhir === 0 && !hilang.has(organisme.kode)) organismePunah.push(organisme.kode);
    if (akhir > mula * 1.8) organismeMeledak.push(organisme.kode);
  }

  const status: StatusEkosistem = organismePunah.length
    ? 'runtuh'
    : organismeMeledak.length || hilang.size
      ? 'terganggu'
      : 'seimbang';

  const namaDari = (kode: KodeOrganisme) =>
    RANTAI_MAKANAN.find((item) => item.kode === kode)?.nama ?? kode;

  return {
    riwayat,
    populasiAkhir,
    perubahanPersen,
    status,
    labelStatus: LABEL_STATUS[status],
    organismePunah,
    organismeMeledak,
    observasi: hilang.size
      ? `Setelah ${keadaan.musim} musim tanpa ${[...hilang].map(namaDari).join(' dan ')}, populasi berubah menjadi rumput ${populasiAkhir.rumput}, belalang ${populasiAkhir.belalang}, katak ${populasiAkhir.katak}, ular ${populasiAkhir.ular}, elang ${populasiAkhir.elang}.`
      : `Setelah ${keadaan.musim} musim ekosistem lengkap, populasi menjadi rumput ${populasiAkhir.rumput}, belalang ${populasiAkhir.belalang}, katak ${populasiAkhir.katak}, ular ${populasiAkhir.ular}, elang ${populasiAkhir.elang}.`,
    kesimpulan:
      status === 'runtuh'
        ? `Hilangnya satu mata rantai membuat ${organismePunah.map(namaDari).join(', ')} ikut punah — setiap organisme bergantung pada organisme lain.`
        : status === 'terganggu'
          ? 'Mengubah satu populasi menggeser seluruh rantai: mangsa dapat meledak dan pemangsa dapat kelaparan.'
          : 'Ketika seluruh mata rantai lengkap, populasi naik turun dalam batas wajar dan ekosistem tetap seimbang.',
  };
}

export function alihkanOrganisme(
  keadaan: KeadaanFoodChain,
  kode: KodeOrganisme,
): KeadaanFoodChain {
  const ada = keadaan.dihilangkan.includes(kode);
  return {
    ...keadaan,
    dihilangkan: ada
      ? keadaan.dihilangkan.filter((item) => item !== kode)
      : [...keadaan.dihilangkan, kode],
  };
}
