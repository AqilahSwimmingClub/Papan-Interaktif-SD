/**
 * Color Light Lab — pencampuran warna cahaya (aditif) dan tapis warna.
 *
 * Alat: tiga lampu sorot merah/hijau/biru, tapis warna, layar putih.
 * Variabel: intensitas tiap lampu, tapis yang dipasang di depan layar.
 * Logika: penjumlahan kanal RGB lalu penyaringan per kanal oleh tapis.
 * Tidak ada senter tunggal, papan berlubang, maupun berkas garis lurus.
 */

export type KanalWarna = 'merah' | 'hijau' | 'biru';

export interface TapisWarna {
  kode: string;
  nama: string;
  /** Bagian tiap kanal yang diloloskan tapis. */
  lolos: Record<KanalWarna, number>;
}

export const TAPIS_TERSEDIA: readonly TapisWarna[] = [
  { kode: 'tanpa', nama: 'Tanpa tapis', lolos: { merah: 1, hijau: 1, biru: 1 } },
  { kode: 'merah', nama: 'Tapis merah', lolos: { merah: 1, hijau: 0.05, biru: 0.05 } },
  { kode: 'hijau', nama: 'Tapis hijau', lolos: { merah: 0.05, hijau: 1, biru: 0.05 } },
  { kode: 'biru', nama: 'Tapis biru', lolos: { merah: 0.05, hijau: 0.05, biru: 1 } },
  { kode: 'kuning', nama: 'Tapis kuning', lolos: { merah: 1, hijau: 1, biru: 0.05 } },
];

export interface KeadaanColorLight {
  /** Intensitas tiap lampu sorot, 0–100. */
  intensitas: Record<KanalWarna, number>;
  lampuMenyala: Record<KanalWarna, boolean>;
  tapisKode: string;
}

export interface HasilColorLight {
  /** Nilai kanal keluaran 0–255 setelah tapis. */
  rgb: { r: number; g: number; b: number };
  warnaHex: string;
  namaWarna: string;
  /** Kecerahan relatif layar, 0–100. */
  kecerahan: number;
  lampuAktif: KanalWarna[];
  tapis: TapisWarna;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_COLOR_LIGHT: KeadaanColorLight = {
  intensitas: { merah: 100, hijau: 100, biru: 100 },
  lampuMenyala: { merah: true, hijau: true, biru: false },
  tapisKode: 'tanpa',
};

const URUTAN_KANAL: readonly KanalWarna[] = ['merah', 'hijau', 'biru'];

function keHex(nilai: number): string {
  return Math.round(Math.min(255, Math.max(0, nilai))).toString(16).padStart(2, '0');
}

/** Menamai warna hasil campuran dari perbandingan tiga kanal. */
export function namaiWarna(r: number, g: number, b: number): string {
  const puncak = Math.max(r, g, b);
  if (puncak < 18) return 'Hitam (layar gelap)';
  const tinggi = (nilai: number) => nilai > puncak * 0.6;
  const merah = tinggi(r);
  const hijau = tinggi(g);
  const biru = tinggi(b);
  if (merah && hijau && biru) return 'Putih';
  if (merah && hijau) return 'Kuning';
  if (merah && biru) return 'Magenta';
  if (hijau && biru) return 'Sian (cyan)';
  if (merah) return 'Merah';
  if (hijau) return 'Hijau';
  return 'Biru';
}

export function tapisDariKode(kode: string): TapisWarna {
  return TAPIS_TERSEDIA.find((tapis) => tapis.kode === kode) ?? TAPIS_TERSEDIA[0]!;
}

/** Mencampur cahaya tiga lampu secara aditif lalu melewatkannya pada tapis. */
export function hitungColorLight(keadaan: KeadaanColorLight): HasilColorLight {
  const tapis = tapisDariKode(keadaan.tapisKode);
  const kanal = URUTAN_KANAL.map((nama) => {
    const nyala = keadaan.lampuMenyala[nama];
    const nilai = nyala ? (keadaan.intensitas[nama] / 100) * 255 : 0;
    return { nama, nilai: nilai * tapis.lolos[nama] };
  });
  const r = kanal[0]!.nilai;
  const g = kanal[1]!.nilai;
  const b = kanal[2]!.nilai;
  const namaWarna = namaiWarna(r, g, b);
  const kecerahan = ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) * 100;
  const lampuAktif = URUTAN_KANAL.filter((nama) => keadaan.lampuMenyala[nama]);

  return {
    rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
    warnaHex: `#${keHex(r)}${keHex(g)}${keHex(b)}`,
    namaWarna,
    kecerahan,
    lampuAktif,
    tapis,
    observasi: lampuAktif.length
      ? `Lampu ${lampuAktif.join(' + ')} melalui ${tapis.nama.toLowerCase()} menghasilkan warna ${namaWarna.toLowerCase()} pada layar dengan kecerahan ${kecerahan.toFixed(0)}%.`
      : 'Semua lampu padam, layar tetap gelap.',
    kesimpulan:
      namaWarna === 'Putih'
        ? 'Merah, hijau, dan biru yang bercampur penuh menghasilkan cahaya putih — inilah tiga warna dasar cahaya.'
        : lampuAktif.length >= 2
          ? 'Mencampur dua warna cahaya menghasilkan warna baru yang lebih terang, bukan lebih gelap seperti mencampur cat.'
          : 'Satu lampu menyala hanya memberi satu warna; tambahkan lampu lain untuk melihat warna campuran.',
  };
}

export function alihkanLampu(keadaan: KeadaanColorLight, kanal: KanalWarna): KeadaanColorLight {
  return {
    ...keadaan,
    lampuMenyala: { ...keadaan.lampuMenyala, [kanal]: !keadaan.lampuMenyala[kanal] },
  };
}

export function aturIntensitas(
  keadaan: KeadaanColorLight,
  kanal: KanalWarna,
  nilai: number,
): KeadaanColorLight {
  return {
    ...keadaan,
    intensitas: { ...keadaan.intensitas, [kanal]: Math.min(100, Math.max(0, nilai)) },
  };
}
