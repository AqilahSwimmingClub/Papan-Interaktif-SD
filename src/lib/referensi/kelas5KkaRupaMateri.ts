export type MateriKelas5Tambahan = {
  kode: string;
  mapel: 'KKA' | 'RUPA';
  nomor: string;
  judul: string;
  topik: string[];
  sumber: string;
};

export const MATERI_KKA_RUPA_KELAS5: MateriKelas5Tambahan[] = [
  {
    kode: 'KKA-5-1', mapel: 'KKA', nomor: 'M1', judul: 'Berpikir Komputasional dan Instruksi Logis',
    topik: ['Pengenalan berpikir komputasional','Konsep dasar berpikir komputasional','Pemecahan masalah dalam kehidupan sehari-hari','Pemecahan masalah multi-langkah','Proyek pemecahan masalah multi-langkah','Menuliskan urutan instruksi secara logis'],
    sumber: 'Panduan Koding dan Kecerdasan Artifisial Fase C Kelas 5 — Kemendikdasmen'
  },
  {
    kode: 'KKA-5-2', mapel: 'KKA', nomor: 'M2', judul: 'Literasi Digital dan Keamanan Informasi',
    topik: ['Konsep dasar teknologi digital','Sistem komputer tingkat pra dasar','Keamanan informasi pribadi','Interaksi aman dan efektif di beranda digital'],
    sumber: 'Panduan Koding dan Kecerdasan Artifisial Fase C Kelas 5 — Kemendikdasmen'
  },
  {
    kode: 'KKA-5-3', mapel: 'KKA', nomor: 'M3', judul: 'Mengenal Kecerdasan Artifisial',
    topik: ['Pengenalan kecerdasan artifisial','Perbedaan manusia dan komputer dalam penginderaan','Mesin cerdas versus mesin non-cerdas','Manfaat kecerdasan artifisial dalam kehidupan sehari-hari'],
    sumber: 'Panduan Koding dan Kecerdasan Artifisial Fase C Kelas 5 — Kemendikdasmen'
  },
  {
    kode: 'KKA-5-4', mapel: 'KKA', nomor: 'M4', judul: 'Pola, Klasifikasi, dan Prediksi Kecerdasan Artifisial',
    topik: ['Konsep mengenali pola dan klasifikasi dalam situasi kehidupan','Mengenali pola dan klasifikasi oleh kecerdasan artifisial','Simulasi prediksi pola dan klasifikasi sistem kecerdasan artifisial','Pengaruh data input terhadap hasil mengenali pola dan klasifikasi kecerdasan artifisial'],
    sumber: 'Panduan Koding dan Kecerdasan Artifisial Fase C Kelas 5 — Kemendikdasmen'
  },
  {
    kode: 'RUPA-5-1', mapel: 'RUPA', nomor: 'M1', judul: 'Prinsip Keseimbangan dalam Karya Seni',
    topik: ['Mengenali prinsip keseimbangan','Keseimbangan simetris','Keseimbangan memancar','Keseimbangan sederajat dan tersembunyi','Mengamati keseimbangan pada objek dan karya seni'],
    sumber: 'Seni Rupa Kelas 5 untuk SD/MI — Widiarti Tri Astuti, CV Gilang Pratama; materi pembelajaran terverifikasi'
  },
  {
    kode: 'RUPA-5-2', mapel: 'RUPA', nomor: 'M2', judul: 'Menggambar Ekspresif dengan Prinsip Keseimbangan',
    topik: ['Gambar ekspresif','Proporsi','Aksentuasi atau pusat perhatian','Garis, warna, tekstur, bentuk, dan gelap-terang','Membuat karya ekspresif yang seimbang'],
    sumber: 'Seni Rupa Kelas 5 untuk SD/MI — Widiarti Tri Astuti, CV Gilang Pratama; materi pembelajaran terverifikasi'
  },
  {
    kode: 'RUPA-5-3', mapel: 'RUPA', nomor: 'M3', judul: 'Jenis dan Pola Ragam Hias',
    topik: ['Pengertian dan fungsi ragam hias','Pola simetris dan asimetris','Ragam hias flora','Ragam hias fauna','Ragam hias figuratif dan geometris','Pola tepi dan pola beraturan'],
    sumber: 'Seni Rupa Kelas 5 untuk SD/MI — Widiarti Tri Astuti, CV Gilang Pratama; materi ragam hias terverifikasi'
  },
  {
    kode: 'RUPA-5-4', mapel: 'RUPA', nomor: 'M4', judul: 'Eksplorasi Unsur dan Komposisi Seni Rupa',
    topik: ['Garis dan bentuk','Warna dan nilai gelap-terang','Tekstur','Ruang dan proporsi','Irama atau ritme','Komposisi dan kesatuan karya'],
    sumber: 'Capaian Seni Rupa Fase C dan materi yang digunakan bersama buku referensi sekolah'
  }
];

export function materiTambahanUntukMapel(mapel: string) {
  return MATERI_KKA_RUPA_KELAS5.filter(item => item.mapel === mapel);
}
