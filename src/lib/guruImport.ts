export const KOLOM_TEMPLATE_GURU = ['Nama', 'Username', 'Kelas', 'Peran', 'Mapel'] as const;
export interface BarisGuruImpor { baris: number; nama: string; username: string; kelas: number[]; peran: 'guru'; mapel: string[]; valid: boolean; masalah: string[] }

function teks(nilai: unknown): string { return nilai === null || nilai === undefined ? '' : String(nilai).trim(); }
function kolom(baris: Record<string, unknown>, nama: string): string {
  const kunci = Object.keys(baris).find((item) => item.trim().toLocaleLowerCase('id') === nama.toLocaleLowerCase('id'));
  return teks(kunci ? baris[kunci] : '');
}

export async function bacaExcelGuru(data: ArrayBuffer): Promise<BarisGuruImpor[]> {
  const XLSX = await import('xlsx');
  const buku = XLSX.read(data, { type: 'array' });
  const lembar = buku.Sheets[buku.SheetNames[0] ?? ''];
  if (!lembar) return [];
  const username = new Set<string>();
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(lembar, { defval: '', raw: false }).map((item, indeks) => {
    const nama = kolom(item, 'Nama'); const akun = kolom(item, 'Username').toLocaleLowerCase('id');
    const masalah: string[] = [];
    if (nama.length < 2) masalah.push('Nama wajib diisi.');
    if (!/^[a-z0-9._-]{3,40}$/.test(akun)) masalah.push('Username tidak valid.');
    if (username.has(akun)) masalah.push('Username duplikat pada berkas.'); username.add(akun);
    const kelas = kolom(item, 'Kelas').split(/[,; ]+/).map(Number).filter((nilai) => Number.isInteger(nilai) && nilai >= 1 && nilai <= 6);
    const mapel = kolom(item, 'Mapel').split(/[,;]+/).map((nilai) => nilai.trim()).filter(Boolean);
    return { baris: indeks + 2, nama, username: akun, kelas, mapel, peran: 'guru', valid: masalah.length === 0, masalah };
  });
}

export async function unduhTemplateGuru(): Promise<void> {
  const XLSX = await import('xlsx');
  const lembar = XLSX.utils.aoa_to_sheet([[...KOLOM_TEMPLATE_GURU], ['Contoh Guru', 'guru.contoh', '1,2', 'guru', 'MAT,BI']]);
  lembar['!cols'] = KOLOM_TEMPLATE_GURU.map((nama) => ({ wch: Math.max(16, nama.length + 3) }));
  const buku = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(buku, lembar, 'Data Guru');
  const data = XLSX.write(buku, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
  const salinan = new Uint8Array(data.byteLength); salinan.set(data);
  const url = URL.createObjectURL(new Blob([salinan.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const tautan = document.createElement('a'); tautan.href = url; tautan.download = 'template-guru-papan-interaktif-sd.xlsx'; tautan.click(); URL.revokeObjectURL(url);
}
