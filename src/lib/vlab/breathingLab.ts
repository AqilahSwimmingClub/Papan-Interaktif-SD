/**
 * Breathing Lab — mekanisme pernapasan dan pertukaran udara di paru-paru.
 *
 * Alat: model dada dengan diafragma, dua paru-paru, saluran napas.
 * Variabel: volume tidal, frekuensi napas, aktivitas tubuh, penyumbatan saluran.
 * Logika: ventilasi semenit = volume tidal × frekuensi, dikurangi ruang rugi
 * anatomis 150 ml untuk memperoleh ventilasi alveolar dan penyerapan oksigen.
 */

export interface Aktivitas {
  kode: string;
  nama: string;
  /** Kebutuhan oksigen, ml/menit. */
  kebutuhanOksigen: number;
  ikon: string;
}

export const AKTIVITAS_TUBUH: readonly Aktivitas[] = [
  { kode: 'tidur', nama: 'Tidur', kebutuhanOksigen: 200, ikon: '😴' },
  { kode: 'duduk', nama: 'Duduk santai', kebutuhanOksigen: 250, ikon: '🪑' },
  { kode: 'jalan', nama: 'Berjalan', kebutuhanOksigen: 700, ikon: '🚶' },
  { kode: 'lari', nama: 'Berlari', kebutuhanOksigen: 1800, ikon: '🏃' },
];

/** Ruang rugi anatomis saluran napas, ml. */
export const RUANG_RUGI_ML = 150;

export interface KeadaanBreathing {
  /** Volume udara sekali tarik napas, ml. */
  volumeTidalMl: number;
  /** Frekuensi napas, kali per menit. */
  frekuensiPerMenit: number;
  aktivitasKode: string;
  /** Penyempitan saluran napas, persen (0 = normal). */
  penyempitanPersen: number;
  /** Fase napas 0–1 untuk animasi; 0 = akhir embusan. */
  fase: number;
}

export type StatusNapas = 'kurang' | 'cukup' | 'berlebih';

export interface HasilBreathing {
  aktivitas: Aktivitas;
  /** Volume tidal efektif setelah penyempitan, ml. */
  volumeEfektifMl: number;
  /** Ventilasi semenit, ml/menit. */
  ventilasiSemenit: number;
  /** Ventilasi alveolar, ml/menit. */
  ventilasiAlveolar: number;
  /** Oksigen yang benar-benar terserap darah, ml/menit. */
  oksigenTerserap: number;
  /** Rasio pasokan terhadap kebutuhan. */
  rasioKecukupan: number;
  status: StatusNapas;
  labelStatus: string;
  /** 0 = diafragma naik (embus), 1 = diafragma turun (tarik napas). */
  posisiDiafragma: number;
  /** Skala paru-paru untuk animasi, 0.8–1.25. */
  skalaParu: number;
  sedangMenarikNapas: boolean;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_BREATHING: KeadaanBreathing = {
  volumeTidalMl: 500,
  frekuensiPerMenit: 16,
  aktivitasKode: 'duduk',
  penyempitanPersen: 0,
  fase: 0,
};

const LABEL: Record<StatusNapas, string> = {
  kurang: 'Pasokan oksigen kurang — tubuh terengah-engah',
  cukup: 'Pasokan oksigen cukup',
  berlebih: 'Napas terlalu cepat — tubuh kelebihan ventilasi',
};

export function aktivitasDariKode(kode: string): Aktivitas {
  return AKTIVITAS_TUBUH.find((item) => item.kode === kode) ?? AKTIVITAS_TUBUH[1]!;
}

/** Menghitung ventilasi paru dan kecukupan oksigen untuk aktivitas terpilih. */
export function hitungBreathing(keadaan: KeadaanBreathing): HasilBreathing {
  const aktivitas = aktivitasDariKode(keadaan.aktivitasKode);
  const lolos = 1 - Math.min(95, Math.max(0, keadaan.penyempitanPersen)) / 100;
  const volumeEfektifMl = Math.max(0, keadaan.volumeTidalMl) * lolos;
  const frekuensi = Math.max(0, keadaan.frekuensiPerMenit);
  const ventilasiSemenit = volumeEfektifMl * frekuensi;
  const ventilasiAlveolar = Math.max(0, volumeEfektifMl - RUANG_RUGI_ML) * frekuensi;
  // Sekitar 5% volume alveolar berpindah menjadi oksigen yang diserap darah.
  const oksigenTerserap = ventilasiAlveolar * 0.05;
  const rasioKecukupan = oksigenTerserap / aktivitas.kebutuhanOksigen;
  const status: StatusNapas =
    rasioKecukupan < 0.9 ? 'kurang' : rasioKecukupan > 1.8 ? 'berlebih' : 'cukup';

  const fase = ((keadaan.fase % 1) + 1) % 1;
  // Satu siklus: setengah pertama menarik napas, setengah kedua mengembuskan.
  const dorongan = Math.sin(fase * 2 * Math.PI);
  const proporsiVolume = volumeEfektifMl / 700;

  return {
    aktivitas,
    volumeEfektifMl,
    ventilasiSemenit,
    ventilasiAlveolar,
    oksigenTerserap,
    rasioKecukupan,
    status,
    labelStatus: LABEL[status],
    posisiDiafragma: (dorongan + 1) / 2,
    skalaParu: 1 + dorongan * 0.22 * Math.min(1.4, proporsiVolume),
    sedangMenarikNapas: fase < 0.5,
    observasi: `Volume tidal ${volumeEfektifMl.toFixed(0)} ml × ${frekuensi} kali/menit memberi ventilasi ${ventilasiSemenit.toFixed(0)} ml/menit; setelah dikurangi ruang rugi ${RUANG_RUGI_ML} ml, ventilasi alveolar ${ventilasiAlveolar.toFixed(0)} ml/menit dan oksigen terserap ${oksigenTerserap.toFixed(0)} ml/menit untuk kebutuhan ${aktivitas.kebutuhanOksigen} ml/menit saat ${aktivitas.nama.toLowerCase()}.`,
    kesimpulan:
      status === 'kurang'
        ? 'Ketika aktivitas berat atau saluran napas menyempit, napas harus lebih dalam dan lebih cepat agar oksigen mencukupi.'
        : status === 'berlebih'
          ? 'Bernapas terlalu cepat tidak menambah banyak oksigen, karena sebagian udara hanya mengisi saluran napas.'
          : 'Diafragma yang turun memperbesar rongga dada sehingga udara masuk; frekuensi dan kedalaman napas menyesuaikan kebutuhan tubuh.',
  };
}
