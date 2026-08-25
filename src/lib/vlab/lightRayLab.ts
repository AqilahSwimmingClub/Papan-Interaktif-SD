/**
 * Light Ray Lab — membuktikan cahaya merambat lurus.
 *
 * Alat: satu senter, tiga papan berlubang, satu layar target.
 * Variabel: tinggi senter, tinggi lubang tiap papan, jarak papan.
 * Logika: berkas dianggap satu garis lurus mendatar pada ketinggian senter.
 * Papan meneruskan cahaya hanya bila lubangnya memotong garis itu. Papan
 * pertama yang tidak sejajar menghentikan berkas — tidak ada pemantulan sama
 * sekali di lab ini.
 */

export const LEBAR_PANGGUNG_LIGHT_RAY = 100;
export const TINGGI_PANGGUNG_LIGHT_RAY = 60;
/** Setengah tinggi lubang papan, dalam satuan panggung. */
export const JARI_LUBANG = 3.5;

export interface PapanBerlubang {
  id: string;
  /** Jarak papan dari senter (0–100). */
  jarak: number;
  /** Titik tengah lubang, diukur dari dasar panggung (0–60). */
  tinggiLubang: number;
}

export interface KeadaanLightRay {
  /** Tinggi senter dari dasar panggung. */
  tinggiSenter: number;
  senterMenyala: boolean;
  papan: PapanBerlubang[];
  /** Jarak layar target dari senter. */
  jarakLayar: number;
}

export interface HasilLightRay {
  /** Titik akhir berkas pada sumbu jarak. */
  jarakBerkasBerhenti: number;
  /** Indeks papan yang menghalangi; null bila berkas lolos semuanya. */
  papanPenghalang: number | null;
  papanLolos: number;
  sampaiLayar: boolean;
  /** Simpangan tiap lubang terhadap garis berkas, satuan panggung. */
  simpangan: number[];
  /** Titik lintasan berkas untuk digambar SVG. */
  lintasan: Array<{ jarak: number; tinggi: number }>;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_LIGHT_RAY: KeadaanLightRay = {
  tinggiSenter: 30,
  senterMenyala: true,
  papan: [
    { id: 'papan-1', jarak: 25, tinggiLubang: 30 },
    { id: 'papan-2', jarak: 50, tinggiLubang: 22 },
    { id: 'papan-3', jarak: 72, tinggiLubang: 36 },
  ],
  jarakLayar: 92,
};

function batas(nilai: number, terkecil: number, terbesar: number): number {
  return Math.min(terbesar, Math.max(terkecil, nilai));
}

/** Menghitung perjalanan berkas lurus melewati deretan papan. */
export function hitungLightRay(keadaan: KeadaanLightRay): HasilLightRay {
  const tinggiBerkas = batas(keadaan.tinggiSenter, 0, TINGGI_PANGGUNG_LIGHT_RAY);
  const urut = [...keadaan.papan].sort((a, b) => a.jarak - b.jarak);
  const simpangan = urut.map((papan) => Math.abs(papan.tinggiLubang - tinggiBerkas));

  if (!keadaan.senterMenyala) {
    return {
      jarakBerkasBerhenti: 0,
      papanPenghalang: null,
      papanLolos: 0,
      sampaiLayar: false,
      simpangan,
      lintasan: [],
      observasi: 'Senter mati sehingga tidak ada berkas yang dapat diamati.',
      kesimpulan: 'Nyalakan senter lebih dulu, lalu sejajarkan lubang papan.',
    };
  }

  const indeksPenghalang = simpangan.findIndex((jarak) => jarak > JARI_LUBANG);
  const papanPenghalang = indeksPenghalang === -1 ? null : indeksPenghalang;
  const papanLolos = papanPenghalang === null ? urut.length : papanPenghalang;
  const jarakBerhenti =
    papanPenghalang === null
      ? Math.max(keadaan.jarakLayar, urut.at(-1)?.jarak ?? 0)
      : urut[papanPenghalang]!.jarak;
  const sampaiLayar = papanPenghalang === null && keadaan.jarakLayar >= (urut.at(-1)?.jarak ?? 0);

  return {
    jarakBerkasBerhenti: jarakBerhenti,
    papanPenghalang,
    papanLolos,
    sampaiLayar,
    simpangan,
    lintasan: [
      { jarak: 0, tinggi: tinggiBerkas },
      { jarak: jarakBerhenti, tinggi: tinggiBerkas },
    ],
    observasi: sampaiLayar
      ? `Ketiga lubang sejajar pada ketinggian ${tinggiBerkas.toFixed(0)} cm dan bercak cahaya muncul di layar.`
      : `Berkas berhenti di papan ${papanLolos + 1} karena lubangnya menyimpang ${simpangan[papanLolos]?.toFixed(1) ?? '0'} cm dari garis senter.`,
    kesimpulan: sampaiLayar
      ? 'Cahaya hanya sampai ke layar ketika seluruh lubang berada pada satu garis lurus — cahaya merambat lurus.'
      : 'Cahaya tidak dapat membelok mengikuti lubang yang bergeser, sehingga berkas terhenti pada papan yang tidak sejajar.',
  };
}

/** Menggeser lubang satu papan tanpa mengubah papan lain. */
export function geserLubang(
  keadaan: KeadaanLightRay,
  papanId: string,
  tinggiLubang: number,
): KeadaanLightRay {
  return {
    ...keadaan,
    papan: keadaan.papan.map((papan) =>
      papan.id === papanId
        ? { ...papan, tinggiLubang: batas(tinggiLubang, 4, TINGGI_PANGGUNG_LIGHT_RAY - 4) }
        : papan,
    ),
  };
}

/** Menggeser posisi papan pada sumbu jarak. */
export function geserPapan(
  keadaan: KeadaanLightRay,
  papanId: string,
  jarak: number,
): KeadaanLightRay {
  return {
    ...keadaan,
    papan: keadaan.papan.map((papan) =>
      papan.id === papanId
        ? { ...papan, jarak: batas(jarak, 8, keadaan.jarakLayar - 4) }
        : papan,
    ),
  };
}

/** Menyejajarkan seluruh lubang ke garis senter — tombol bantuan guru. */
export function sejajarkanSemuaLubang(keadaan: KeadaanLightRay): KeadaanLightRay {
  return {
    ...keadaan,
    papan: keadaan.papan.map((papan) => ({ ...papan, tinggiLubang: keadaan.tinggiSenter })),
  };
}
