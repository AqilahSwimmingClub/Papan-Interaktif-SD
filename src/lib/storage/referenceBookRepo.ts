import type { PemetaanBabTp, ReferensiBab, ReferensiPembelajaran } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';

/** Model distribusi buku. Isi buku tidak disalin; hanya metadata dan pemetaan. */
export interface ReferenceBook {
  id: string;
  title: string;
  subjectCode: string | null;
  grades: number[];
  publisher: string;
  year: string;
  sourceUrl: string;
  copyrightScope: 'metadata_saja' | 'isi_boleh_disimpan';
  chapters: ReferenceChapter[];
}

export interface ReferenceChapter {
  id: string;
  number: string;
  title: string;
  order: number;
  topics: ReferenceTopic[];
}

export interface ReferenceTopic {
  id: string;
  title: string;
  summary: string;
  tpIds: string[];
}

/** Adapter non-destruktif atas tabel referensi versi lama: Buku → Bab → Topik → TP. */
export async function daftarReferenceBook(tingkat?: number, mapelKode?: string): Promise<ReferenceBook[]> {
  return jalankanTransaksi([TOKO.referensi, TOKO.referensiBab, TOKO.pemetaanBabTp], 'readonly', async (toko) => {
    const [buku, bab, relasi] = await Promise.all([
      kueri.semua<ReferensiPembelajaran>(toko(TOKO.referensi)),
      kueri.semua<ReferensiBab>(toko(TOKO.referensiBab)),
      kueri.semua<PemetaanBabTp>(toko(TOKO.pemetaanBabTp)),
    ]);
    return buku.filter((item) => item.status === 'aktif' && (!tingkat || item.kelas_relevan.includes(tingkat)) && (!mapelKode || !item.mapel_kode || item.mapel_kode === mapelKode)).map((item) => ({
      id: item.id,
      title: item.judul,
      subjectCode: item.mapel_kode,
      grades: item.kelas_relevan,
      publisher: item.penerbit,
      year: item.tahun,
      sourceUrl: item.url_sumber,
      copyrightScope: item.lingkup_izin,
      chapters: bab.filter((bagian) => bagian.referensi_id === item.id).sort((a, b) => a.urutan - b.urutan).map((bagian) => ({
        id: bagian.id,
        number: bagian.nomor_tampil,
        title: bagian.judul_bab,
        order: bagian.urutan,
        topics: [{ id: `${bagian.id}-TOPIK-1`, title: bagian.judul_bab, summary: bagian.ruang_lingkup, tpIds: relasi.filter((baris) => baris.referensi_bab_id === bagian.id).map((baris) => baris.tp_id) }],
      })),
    }));
  });
}

export async function cariReferenceTopic(tpId: string): Promise<Array<{ book: ReferenceBook; chapter: ReferenceChapter; topic: ReferenceTopic }>> {
  const buku = await daftarReferenceBook();
  return buku.flatMap((book) => book.chapters.flatMap((chapter) => chapter.topics.filter((topic) => topic.tpIds.includes(tpId)).map((topic) => ({ book, chapter, topic }))));
}
