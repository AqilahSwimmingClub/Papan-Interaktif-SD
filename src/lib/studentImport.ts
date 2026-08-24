import type { DataSiswaBaru } from './storage/kelasRepo';

export const KOLOM_TEMPLATE_SISWA = [
  'NIS', 'NISN', 'Nama', 'JK', 'Agama', 'Tempat/Tanggal Lahir', 'Orang Tua', 'Telepon', 'Alamat',
] as const;

export interface BarisPratinjauSiswa extends DataSiswaBaru {
  baris: number;
  valid: boolean;
  masalah: string[];
}

function teks(nilai: unknown): string {
  if (nilai === null || nilai === undefined) return '';
  return String(nilai).trim();
}

function nilaiKolom(baris: Record<string, unknown>, nama: string): string {
  const kunci = Object.keys(baris).find((item) => item.trim().toLocaleLowerCase('id') === nama.toLocaleLowerCase('id'));
  return teks(kunci ? baris[kunci] : '');
}

/** Parser murni: identitas utama Nama wajib, seluruh data pendamping boleh kosong. */
export function validasiBarisSiswa(baris: Record<string, unknown>[], identitasAda: string[] = []): BarisPratinjauSiswa[] {
  const ditemukan = new Set(identitasAda.map((item) => item.toLocaleLowerCase('id')));
  return baris.map((mentah, indeks) => {
    const nama = nilaiKolom(mentah, 'Nama');
    const nis = nilaiKolom(mentah, 'NIS');
    const nisn = nilaiKolom(mentah, 'NISN');
    const jkMentah = nilaiKolom(mentah, 'JK').toUpperCase();
    const masalah: string[] = [];
    if (nama.length < 2 || nama.length > 80) masalah.push('Nama wajib 2-80 karakter.');
    if (jkMentah && !['L', 'P'].includes(jkMentah)) masalah.push('JK harus L, P, atau kosong.');
    const identitas = `${nisn}|${nis}|${nama}`.toLocaleLowerCase('id');
    if (ditemukan.has(identitas)) masalah.push('Duplikat identitas siswa.');
    ditemukan.add(identitas);
    return {
      baris: indeks + 2, valid: masalah.length === 0, masalah, nama, nis, nisn,
      jk: (jkMentah === 'L' || jkMentah === 'P' ? jkMentah : '') as DataSiswaBaru['jk'],
      agama: nilaiKolom(mentah, 'Agama'),
      tempat_tanggal_lahir: nilaiKolom(mentah, 'Tempat/Tanggal Lahir'),
      orang_tua: nilaiKolom(mentah, 'Orang Tua'), telepon: nilaiKolom(mentah, 'Telepon'),
      alamat: nilaiKolom(mentah, 'Alamat'),
    };
  });
}

export async function bacaExcelSiswa(data: ArrayBuffer): Promise<BarisPratinjauSiswa[]> {
  const XLSX = await import('xlsx');
  const buku = XLSX.read(data, { type: 'array', cellDates: false });
  const namaLembar = buku.SheetNames[0];
  if (!namaLembar) return [];
  const lembar = buku.Sheets[namaLembar];
  if (!lembar) return [];
  const baris = XLSX.utils.sheet_to_json<Record<string, unknown>>(lembar, { defval: '', raw: false });
  return validasiBarisSiswa(baris);
}

export async function buatTemplateSiswa(): Promise<Uint8Array> {
  const XLSX = await import('xlsx');
  const lembar = XLSX.utils.aoa_to_sheet([
    [...KOLOM_TEMPLATE_SISWA],
    ['', '', 'Contoh Nama Siswa', '', '', '', '', '', ''],
  ]);
  lembar['!cols'] = KOLOM_TEMPLATE_SISWA.map((nama) => ({ wch: Math.max(14, nama.length + 2) }));
  const buku = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(buku, lembar, 'Data Siswa');
  return XLSX.write(buku, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}

export async function unduhTemplateSiswa(): Promise<void> {
  const data = await buatTemplateSiswa();
  const salinan = new Uint8Array(data.byteLength); salinan.set(data);
  const url = URL.createObjectURL(new Blob([salinan.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const tautan = document.createElement('a');
  tautan.href = url;
  tautan.download = 'template-data-siswa-papan-interaktif-sd.xlsx';
  tautan.click();
  URL.revokeObjectURL(url);
}
