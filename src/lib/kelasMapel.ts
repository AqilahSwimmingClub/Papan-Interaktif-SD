import { AppError } from './errors/AppError';
import type { KodeFase } from './types';

export interface MapelAktifSekolah {
  kode: 'PADB' | 'PP' | 'BI' | 'MAT' | 'IPAS' | 'PJOK' | 'SENI' | 'BING' | 'BSUN' | 'KKA';
  nama: string;
}

const MAPEL_DASAR: MapelAktifSekolah[] = [
  { kode: 'PADB', nama: 'Pendidikan Agama dan Budi Pekerti' },
  { kode: 'PP', nama: 'Pendidikan Pancasila' },
  { kode: 'BI', nama: 'Bahasa Indonesia' },
  { kode: 'MAT', nama: 'Matematika' },
  { kode: 'PJOK', nama: 'PJOK' },
  { kode: 'SENI', nama: 'Seni dan Budaya' },
  { kode: 'BING', nama: 'Bahasa Inggris' },
  { kode: 'BSUN', nama: 'Bahasa Sunda' },
];

export const KODE_MAPEL_AGAMA = ['PAI', 'PAK', 'PAKat', 'PAH', 'PAB', 'PAKh'] as const;
export const KODE_CABANG_SENI = ['RUPA', 'SMUS', 'TARI', 'TEATER'] as const;

/** Satu-satunya source of truth kelas -> fase untuk seluruh aplikasi. */
export function getFaseByKelas(kelas: number): KodeFase {
  if (!Number.isInteger(kelas) || kelas < 1 || kelas > 6) {
    throw new AppError('VALIDASI', 'Kelas harus berupa angka 1 sampai 6.', { field: 'kelas' });
  }
  if (kelas <= 2) return 'A';
  if (kelas <= 4) return 'B';
  return 'C';
}

/** Mapel sekolah bersifat otomatis; Admin tidak mengaktifkan mapel per Guru. */
export function getMapelAktifByKelas(kelas: number): MapelAktifSekolah[] {
  getFaseByKelas(kelas);
  const hasil = [...MAPEL_DASAR];
  if (kelas >= 3) hasil.splice(4, 0, { kode: 'IPAS', nama: 'IPAS' });
  if (kelas >= 5) hasil.push({ kode: 'KKA', nama: 'Koding dan Kecerdasan Artifisial' });
  return hasil;
}

export function getKodeMapelAktifByKelas(kelas: number): string[] {
  return getMapelAktifByKelas(kelas).map((item) => item.kode);
}

/** Kode fisik dataset untuk kelompok mapel logis PADB dan Seni. */
export function getKodeKurikulumAktifByKelas(kelas: number): Set<string> {
  const logis = new Set(getKodeMapelAktifByKelas(kelas));
  const fisik = new Set<string>([...logis]);
  if (logis.has('PADB')) KODE_MAPEL_AGAMA.forEach((kode) => fisik.add(kode));
  if (logis.has('SENI')) KODE_CABANG_SENI.forEach((kode) => fisik.add(kode));
  return fisik;
}

export function getMapelOtomatisUntukKelas(kelas: number[]): string[] {
  const hasil = new Set<string>();
  kelas.forEach((tingkat) => getKodeMapelAktifByKelas(tingkat).forEach((kode) => hasil.add(kode)));
  return [...hasil];
}
