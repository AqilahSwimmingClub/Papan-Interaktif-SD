// Materi pelengkap Kelas V berbasis sumber yang dapat diverifikasi.
// KKA: Panduan Mata Pelajaran Koding & KA Fase C Kemendikdasmen 2025/2026.
// Seni Rupa: buku sekolah Widiarti Tri Astuti, CV Gilang Pratama; materi yang dapat diverifikasi
// diperlakukan sebagai lingkup materi, bukan klaim nomor/judul bab buku jika daftar isi lengkap belum tersedia.

export interface LingkupKelas5 {
  id: string;
  mapel: 'KKA' | 'RUPA';
  nomor: string;
  judul: string;
  topik: string[];
  sumber: string;
}

export const LINGKUP_KKA_KELAS5: LingkupKelas5[] = [
  { id:'KKA-BK', mapel:'KKA', nomor:'Materi 1', judul:'Berpikir Komputasional dan Instruksi Logis', topik:['Pengenalan berpikir komputasional','Konsep dasar berpikir komputasional','Pemecahan masalah dalam kehidupan sehari-hari','Pemecahan masalah multi-langkah','Proyek pemecahan masalah multi-langkah','Menuliskan urutan instruksi secara logis'], sumber:'Panduan Mata Pelajaran Koding dan Kecerdasan Artifisial Fase C Kelas 5 — Kemendikdasmen' },
  { id:'KKA-LD', mapel:'KKA', nomor:'Materi 2', judul:'Literasi Digital dan Keamanan Informasi', topik:['Konsep dasar teknologi digital','Sistem komputer tingkat pra dasar','Keamanan informasi pribadi','Interaksi aman dan efektif di ruang digital'], sumber:'Panduan Mata Pelajaran Koding dan Kecerdasan Artifisial Fase C Kelas 5 — Kemendikdasmen' },
  { id:'KKA-AI', mapel:'KKA', nomor:'Materi 3', judul:'Mengenal Kecerdasan Artifisial', topik:['Pengenalan kecerdasan artifisial','Perbedaan manusia dan komputer dalam penginderaan','Mesin cerdas versus mesin non-cerdas','Manfaat kecerdasan artifisial dalam kehidupan sehari-hari'], sumber:'Panduan Mata Pelajaran Koding dan Kecerdasan Artifisial Fase C Kelas 5 — Kemendikdasmen' },
  { id:'KKA-KLAS', mapel:'KKA', nomor:'Materi 4', judul:'Pola, Klasifikasi, dan Prediksi Kecerdasan Artifisial', topik:['Konsep mengenali pola dan klasifikasi dalam situasi kehidupan','Mengenali pola dan klasifikasi oleh kecerdasan artifisial','Simulasi prediksi pola dan klasifikasi sistem kecerdasan artifisial','Pengaruh data input terhadap hasil mengenali pola dan klasifikasi kecerdasan artifisial'], sumber:'Panduan Mata Pelajaran Koding dan Kecerdasan Artifisial Fase C Kelas 5 — Kemendikdasmen' },
];

export const LINGKUP_RUPA_KELAS5: LingkupKelas5[] = [
  { id:'RUPA-SEIMBANG', mapel:'RUPA', nomor:'Materi 1', judul:'Prinsip Keseimbangan dalam Karya Seni', topik:['Mengenali prinsip keseimbangan','Keseimbangan simetris','Keseimbangan memancar','Keseimbangan sederajat dan tersembunyi','Mengamati keseimbangan pada objek dan karya seni'], sumber:'Seni Rupa Kelas 5 untuk SD/MI — Widiarti Tri Astuti, CV Gilang Pratama; materi pembelajaran terverifikasi' },
  { id:'RUPA-EKSP', mapel:'RUPA', nomor:'Materi 2', judul:'Menggambar Ekspresif dengan Prinsip Keseimbangan', topik:['Gambar ekspresif','Proporsi','Aksentuasi atau pusat perhatian','Garis, warna, tekstur, bentuk, dan gelap-terang','Membuat karya ekspresif yang seimbang'], sumber:'Seni Rupa Kelas 5 untuk SD/MI — Widiarti Tri Astuti, CV Gilang Pratama; materi pembelajaran terverifikasi' },
  { id:'RUPA-RAGAM', mapel:'RUPA', nomor:'Materi 3', judul:'Jenis dan Pola Ragam Hias', topik:['Pengertian dan fungsi ragam hias','Pola simetris dan asimetris','Ragam hias flora','Ragam hias fauna','Ragam hias figuratif dan geometris','Pola tepi dan pola beraturan'], sumber:'Seni Rupa Kelas 5 untuk SD/MI — Widiarti Tri Astuti, CV Gilang Pratama; materi ragam hias terverifikasi' },
  { id:'RUPA-UNSUR', mapel:'RUPA', nomor:'Materi 4', judul:'Eksplorasi Unsur dan Komposisi Seni Rupa', topik:['Garis dan bentuk','Warna dan nilai gelap-terang','Tekstur','Ruang dan proporsi','Irama atau ritme','Komposisi dan kesatuan karya'], sumber:'Seni Rupa Fase C dan buku referensi sekolah Widiarti Tri Astuti, CV Gilang Pratama' },
];

export const LINGKUP_KKA_RUPA_KELAS5 = [...LINGKUP_KKA_KELAS5, ...LINGKUP_RUPA_KELAS5];
