export type AksiPembelajaranKelas1 = readonly [label: string, rute: string];

const MASTER = new Set(['PAI','PAK','PAKAT','PAH','PAB','PAKH','PP','BI','MAT','PJOK','RUPA']);

export function aksiPembelajaranKelas1(mapelKode: string): AksiPembelajaranKelas1[] {
  const kode = mapelKode.toUpperCase();
  if (!MASTER.has(kode)) return [];
  return [['Buka Pembelajaran Kelas 1', `/kelas1/${kode}`]];
}
