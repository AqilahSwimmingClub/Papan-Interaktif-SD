// Materi pelengkap Kelas V berbasis sumber yang dapat diverifikasi.
// KKA: Panduan Mata Pelajaran Koding & KA Fase C Kemendikdasmen 2025.
// Seni Rupa: buku sekolah Widiarti Tri Astuti, CV Gilang Pratama; struktur dibuat sebagai lingkup materi,
// bukan klaim nomor/judul bab buku ketika daftar isi buku belum tersedia.

export interface LingkupKelas5 {
  id: string;
  mapel: 'KKA' | 'RUPA';
  nomor: string;
  judul: string;
  topik: string[];
  sumber: string;
}

export const LINGKUP_KKA_KELAS5: LingkupKelas5[] = [
  { id:'KKA-BK', mapel:'KKA', nomor:'Materi 1', judul:'Berpikir Komputasional dan Instruksi Logis', topik:['Pengenalan berpikir komputasional','Pemecahan masalah sehari-hari','Pemecahan masalah multilangkah','Menuliskan urutan instruksi secara logis'], sumber:'Panduan Mata Pelajaran Koding dan Kecerdasan Artifisial Fase C, Kemendikdasmen 2025' },
  { id:'KKA-LD', mapel:'KKA', nomor:'Materi 2', judul:'Literasi dan Keamanan Digital', topik:['Konsep dasar teknologi digital','Sistem komputer tingkat pradasar','Keamanan informasi pribadi','Interaksi aman dan efektif di ruang digital'], sumber:'Panduan Mata Pelajaran Koding dan Kecerdasan Artifisial Fase C, Kemendikdasmen 2025' },
  { id:'KKA-AI', mapel:'KKA', nomor:'Materi 3', judul:'Mengenal Kecerdasan Artifisial', topik:['Pengenalan kecerdasan artifisial','Manusia dan komputer dalam penginderaan','Mesin cerdas dan mesin non-cerdas','Manfaat kecerdasan artifisial dalam kehidupan sehari-hari'], sumber:'Panduan Mata Pelajaran Koding dan Kecerdasan Artifisial Fase C, Kemendikdasmen 2025' },
  { id:'KKA-KLAS', mapel:'KKA', nomor:'Materi 4', judul:'Pola, Klasifikasi, dan Prediksi KA', topik:['Konsep pola dan klasifikasi','Mengenali pola dan klasifikasi oleh KA','Simulasi prediksi pola dan klasifikasi','Pengaruh data input terhadap hasil klasifikasi KA'], sumber:'Panduan Mata Pelajaran Koding dan Kecerdasan Artifisial Fase C, Kemendikdasmen 2025' },
];

export const LINGKUP_RUPA_KELAS5: LingkupKelas5[] = [
  { id:'RUPA-UNSUR', mapel:'RUPA', nomor:'Materi 1', judul:'Unsur Rupa dan Komposisi', topik:['Garis dan bentuk','Warna','Tekstur visual','Komposisi dan keseimbangan'], sumber:'Lingkup pembelajaran Seni Rupa Fase C; referensi buku sekolah Widiarti Tri Astuti, CV Gilang Pratama' },
  { id:'RUPA-EKSP', mapel:'RUPA', nomor:'Materi 2', judul:'Menggambar Ekspresif', topik:['Mengamati objek','Mengembangkan bentuk','Memilih warna untuk ekspresi','Menyusun komposisi gambar'], sumber:'Lingkup pembelajaran Seni Rupa Fase C; referensi buku sekolah Widiarti Tri Astuti, CV Gilang Pratama' },
  { id:'RUPA-RAGAM', mapel:'RUPA', nomor:'Materi 3', judul:'Ragam Hias', topik:['Ragam hias flora','Ragam hias fauna','Ragam hias figuratif','Ragam hias geometris'], sumber:'Lingkup pembelajaran Seni Rupa Fase C; referensi buku sekolah Widiarti Tri Astuti, CV Gilang Pratama' },
  { id:'RUPA-KARYA', mapel:'RUPA', nomor:'Materi 4', judul:'Eksplorasi dan Apresiasi Karya', topik:['Eksperimen alat dan bahan','Membuat karya dua dimensi','Menceritakan proses berkarya','Mengamati dan mengapresiasi karya'], sumber:'Lingkup pembelajaran Seni Rupa Fase C; referensi buku sekolah Widiarti Tri Astuti, CV Gilang Pratama' },
];

export const LINGKUP_KKA_RUPA_KELAS5 = [...LINGKUP_KKA_KELAS5, ...LINGKUP_RUPA_KELAS5];
