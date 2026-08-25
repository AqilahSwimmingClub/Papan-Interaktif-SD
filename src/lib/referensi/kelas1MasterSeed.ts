import type { BukuBab, BukuReferensi, BukuTopik } from '../types';
import { TOKO, jalankanTransaksi, kueri } from '../storage/db';

const DITAMBAHKAN_PADA = '2026-08-25T00:00:00.000Z';

/**
 * Master referensi Kelas 1.
 * Hanya metadata/bab/topik yang dapat diverifikasi dari buku resmi yang diisi.
 * Kolom yang belum terverifikasi sengaja dibiarkan kosong dan tidak ditebak.
 */
export const BUKU_MASTER_KELAS1: BukuReferensi[] = [
  { id:'BUKU-K1-PAI-SIBI', tingkat_kelas:1, mapel_kode:'PAI', judul:'Pendidikan Agama Islam dan Budi Pekerti untuk SD Kelas I', penulis:'Muhammad Nurzakun; Joko Santoso', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'2021', edisi:'1', isbn:'978-602-244-424-4', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-PAK-SIBI', tingkat_kelas:1, mapel_kode:'PAK', judul:'Pendidikan Agama Kristen dan Budi Pekerti untuk SD Kelas I', penulis:'Veronika Hematang', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'', edisi:'1', isbn:'978-602-244-461-9', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-PAKAT-SIBI', tingkat_kelas:1, mapel_kode:'PAKat', judul:'Pendidikan Agama Katolik dan Budi Pekerti untuk SD Kelas I', penulis:'', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'', edisi:'1', isbn:'', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-PAH-SIBI', tingkat_kelas:1, mapel_kode:'PAH', judul:'Pendidikan Agama Hindu dan Budi Pekerti untuk SD Kelas I', penulis:'', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'', edisi:'1', isbn:'', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-PAB-SIBI', tingkat_kelas:1, mapel_kode:'PAB', judul:'Pendidikan Agama Buddha dan Budi Pekerti untuk SD Kelas I', penulis:'', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'', edisi:'1', isbn:'', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-PAKH-SIBI', tingkat_kelas:1, mapel_kode:'PAKh', judul:'Pendidikan Agama Khonghucu dan Budi Pekerti untuk SD Kelas I', penulis:'', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'', edisi:'1', isbn:'', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-PP-2023', tingkat_kelas:1, mapel_kode:'PP', judul:'Pendidikan Pancasila untuk SD/MI Kelas I', penulis:'Canny Ilmiati; Etika Indah Febriani; Elisa Seftriyana', penerbit:'Pusat Perbukuan', tahun:'2023', edisi:'1', isbn:'978-623-194-615-7', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-BI-2024', tingkat_kelas:1, mapel_kode:'BI', judul:'Bahasa Indonesia Aku Bisa! untuk SD/MI Kelas I (Edisi Revisi)', penulis:'Sofie Dewayani', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'2024', edisi:'Revisi', isbn:'978-623-118-362-0', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-MAT-SIBI', tingkat_kelas:1, mapel_kode:'MAT', judul:'Matematika untuk SD/MI Kelas I', penulis:'Dara Retno Wulan; Rasfaniwaty', penerbit:'Pusat Perbukuan', tahun:'2022', edisi:'1', isbn:'978-602-244-877-8', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-PJOK-SIBI', tingkat_kelas:1, mapel_kode:'PJOK', judul:'Pendidikan Jasmani, Olahraga, dan Kesehatan untuk SD/MI Kelas I', penulis:'Puji Rahayu; Umi Hariyani', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'', edisi:'1', isbn:'978-623-388-543-0', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K1-RUPA-REV', tingkat_kelas:1, mapel_kode:'RUPA', judul:'Panduan Guru Seni Rupa untuk SD/MI Kelas I (Edisi Revisi)', penulis:'Rizki Raindriati', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'2023', edisi:'Revisi', isbn:'978-623-118-516-7', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
];

const BAB_DATA: Array<[string,string,string,string,number|null]> = [
  ['BAB-K1-PAI-1','BUKU-K1-PAI-SIBI','1','Aku Cinta Al-Qur’an',1],
  ['BAB-K1-PAI-2','BUKU-K1-PAI-SIBI','2','Mengenal Rukun Iman',16],
  ['BAB-K1-PAI-3','BUKU-K1-PAI-SIBI','3','Aku Suka Membaca Basmalah dan Hamdalah',34],
  ['BAB-K1-PAI-4','BUKU-K1-PAI-SIBI','4','Mengenal Rukun Islam',52],
  ['BAB-K1-PAI-5','BUKU-K1-PAI-SIBI','5','Nabi dan Rasul Panutanku',73],
  ['BAB-K1-PAI-6','BUKU-K1-PAI-SIBI','6','Al-Qur’an Pedoman Hidupku',97],
  ['BAB-K1-PAI-7','BUKU-K1-PAI-SIBI','7','Kasih Sayang terhadap Sesama',111],
  ['BAB-K1-PAI-8','BUKU-K1-PAI-SIBI','8','Aku Suka Berterima Kasih dan Disiplin',129],
  ['BAB-K1-PAI-9','BUKU-K1-PAI-SIBI','9','Membiasakan Hidup Bersih',149],
  ['BAB-K1-PAI-10','BUKU-K1-PAI-SIBI','10','Nabi Adam a.s. Manusia Pertama',167],

  ['BAB-K1-PP-1','BUKU-K1-PP-2023','1','Aku dan Teman-Temanku',1],
  ['BAB-K1-PP-2','BUKU-K1-PP-2023','2','Aku Patuh pada Aturan',37],
  ['BAB-K1-PP-3','BUKU-K1-PP-2023','3','Aku Mengenal Indonesia',null],
  ['BAB-K1-PP-4','BUKU-K1-PP-2023','4','Aku dan Lingkunganku',null],

  ['BAB-K1-BI-1','BUKU-K1-BI-2024','1','Bunyi Apa?',null],
  ['BAB-K1-BI-2','BUKU-K1-BI-2024','2','Ayo, Bermain!',null],
  ['BAB-K1-BI-3','BUKU-K1-BI-2024','3','Awas Kuman!',null],
  ['BAB-K1-BI-4','BUKU-K1-BI-2024','4','Aku Bisa!',null],
  ['BAB-K1-BI-5','BUKU-K1-BI-2024','5','Teman Baru',null],
  ['BAB-K1-BI-6','BUKU-K1-BI-2024','6','Berbeda Itu Tak Apa',null],
  ['BAB-K1-BI-7','BUKU-K1-BI-2024','7','Aku Ingin',null],
  ['BAB-K1-BI-8','BUKU-K1-BI-2024','8','Di Sekitar Rumah',null],

  ['BAB-K1-MAT-1','BUKU-K1-MAT-SIBI','1','Ayo Membilang sampai dengan 10',1],
  ['BAB-K1-MAT-2','BUKU-K1-MAT-SIBI','2','Penjumlahan sampai dengan 10',41],
  ['BAB-K1-MAT-3','BUKU-K1-MAT-SIBI','3','Pengurangan sampai dengan 10',75],
  ['BAB-K1-MAT-4','BUKU-K1-MAT-SIBI','4','Mengenal Bentuk',115],
  ['BAB-K1-MAT-5','BUKU-K1-MAT-SIBI','5','Ayo Membilang sampai dengan 20',145],
  ['BAB-K1-MAT-6','BUKU-K1-MAT-SIBI','6','Penjumlahan dan Pengurangan sampai dengan 20',175],
  ['BAB-K1-MAT-7','BUKU-K1-MAT-SIBI','7','Mengukur Panjang Benda',197],
  ['BAB-K1-MAT-8','BUKU-K1-MAT-SIBI','8','Mengenal Diagram',219],

  ['BAB-K1-RUPA-1','BUKU-K1-RUPA-REV','I','Eksplorasi Media Berkarya Seni Rupa',39],
  ['BAB-K1-RUPA-2','BUKU-K1-RUPA-REV','II','Menceritakan Hasil Pengamatan',78],
  ['BAB-K1-RUPA-3','BUKU-K1-RUPA-REV','III','Menyimpulkan Karakteristik Alat dan Bahan',102],
  ['BAB-K1-RUPA-4','BUKU-K1-RUPA-REV','IV','Menyimpulkan Hasil Temuan Tiga Unsur Rupa di Sekitar',125],
];

export const BAB_MASTER_KELAS1: BukuBab[] = BAB_DATA.map(
  ([id,buku_id,nomor_tampil,judul_bab,halaman_awal],urutan)=>({
    id,buku_id,nomor_tampil,judul_bab,halaman_awal,halaman_akhir:null,urutan:urutan+1,
  }),
);

const TOPIK_DATA: Array<[string,string,string,string,number|null]> = [
  ['TOPIK-K1-PAI-1','BAB-K1-PAI-1','A','Aku Cinta Al-Qur’an',1],
  ['TOPIK-K1-PAI-2','BAB-K1-PAI-2','A','Mengenal Rukun Iman',16],
  ['TOPIK-K1-PAI-3','BAB-K1-PAI-3','A','Aku Suka Membaca Basmalah dan Hamdalah',34],
  ['TOPIK-K1-PAI-4','BAB-K1-PAI-4','A','Mengenal Rukun Islam',52],
  ['TOPIK-K1-PAI-5','BAB-K1-PAI-5','A','Nabi dan Rasul Panutanku',73],
  ['TOPIK-K1-PAI-6','BAB-K1-PAI-6','A','Al-Qur’an Pedoman Hidupku',97],
  ['TOPIK-K1-PAI-7','BAB-K1-PAI-7','A','Kasih Sayang terhadap Sesama',111],
  ['TOPIK-K1-PAI-8','BAB-K1-PAI-8','A','Aku Suka Berterima Kasih dan Disiplin',129],
  ['TOPIK-K1-PAI-9','BAB-K1-PAI-9','A','Membiasakan Hidup Bersih',149],
  ['TOPIK-K1-PAI-10','BAB-K1-PAI-10','A','Nabi Adam a.s. Manusia Pertama',167],

  ['TOPIK-K1-PP-1','BAB-K1-PP-1','A','Mengenal diri, teman, perbedaan, dan aturan bermain',1],
  ['TOPIK-K1-PP-2','BAB-K1-PP-2','A','Aturan, kepatuhan, keluarga, rumah, dan kepedulian lingkungan',37],
  ['TOPIK-K1-PP-3','BAB-K1-PP-3','A','Mengenal Indonesia',null],
  ['TOPIK-K1-PP-4','BAB-K1-PP-4','A','Aku dan lingkungan sekitar',null],

  ['TOPIK-K1-BI-1','BAB-K1-BI-1','A','Bunyi Apa?',null],
  ['TOPIK-K1-BI-2','BAB-K1-BI-2','A','Ayo, Bermain!',null],
  ['TOPIK-K1-BI-3','BAB-K1-BI-3','A','Awas Kuman!',null],
  ['TOPIK-K1-BI-4','BAB-K1-BI-4','A','Aku Bisa!',null],
  ['TOPIK-K1-BI-5','BAB-K1-BI-5','A','Teman Baru',null],
  ['TOPIK-K1-BI-6','BAB-K1-BI-6','A','Berbeda Itu Tak Apa',null],
  ['TOPIK-K1-BI-7','BAB-K1-BI-7','A','Aku Ingin',null],
  ['TOPIK-K1-BI-8','BAB-K1-BI-8','A','Di Sekitar Rumah',null],

  ['TOPIK-K1-MAT-1-A','BAB-K1-MAT-1','A','Menghitung, Membaca, dan Menulis Bilangan',3],
  ['TOPIK-K1-MAT-1-B','BAB-K1-MAT-1','B','Membandingkan Banyak Benda',17],
  ['TOPIK-K1-MAT-1-C','BAB-K1-MAT-1','C','Menghitung Maju dan Mundur',25],
  ['TOPIK-K1-MAT-1-D','BAB-K1-MAT-1','D','Pasangan Bilangan',29],
  ['TOPIK-K1-MAT-2-A','BAB-K1-MAT-2','A','Cerita Penjumlahan',44],
  ['TOPIK-K1-MAT-2-B','BAB-K1-MAT-2','B','Berbagai Cara Melakukan Penjumlahan',51],
  ['TOPIK-K1-MAT-2-C','BAB-K1-MAT-2','C','Soal Cerita Penjumlahan',65],
  ['TOPIK-K1-MAT-3-A','BAB-K1-MAT-3','A','Cerita Pengurangan',78],
  ['TOPIK-K1-MAT-3-B','BAB-K1-MAT-3','B','Berbagai Cara Melakukan Pengurangan',88],
  ['TOPIK-K1-MAT-3-C','BAB-K1-MAT-3','C','Hubungan Penjumlahan dan Pengurangan',101],
  ['TOPIK-K1-MAT-3-D','BAB-K1-MAT-3','D','Soal Cerita Pengurangan',106],
  ['TOPIK-K1-MAT-4-A','BAB-K1-MAT-4','A','Mendeskripsikan Benda Berdasarkan Bentuk',118],
  ['TOPIK-K1-MAT-4-B','BAB-K1-MAT-4','B','Mengelompokkan Benda',127],
  ['TOPIK-K1-MAT-4-C','BAB-K1-MAT-4','C','Menyusun dan Mengurai Bentuk Bangun',134],
  ['TOPIK-K1-MAT-5-A','BAB-K1-MAT-5','A','Menghitung, Membaca, dan Menulis Bilangan',148],
  ['TOPIK-K1-MAT-5-B','BAB-K1-MAT-5','B','Menghitung Maju dan Mundur',158],
  ['TOPIK-K1-MAT-5-C','BAB-K1-MAT-5','C','Nilai Tempat',160],
  ['TOPIK-K1-MAT-5-D','BAB-K1-MAT-5','D','Membandingkan Bilangan',165],
  ['TOPIK-K1-MAT-6-A','BAB-K1-MAT-6','A','Mengenal Konsep Lebih dari, Kurang dari, dan Selisih',178],
  ['TOPIK-K1-MAT-6-B','BAB-K1-MAT-6','B','Penjumlahan yang Hasilnya Kurang dari 20',182],
  ['TOPIK-K1-MAT-6-C','BAB-K1-MAT-6','C','Pengurangan yang Hasilnya Kurang dari 20',189],
  ['TOPIK-K1-MAT-7-A','BAB-K1-MAT-7','A','Membandingkan dan Mengurutkan Panjang Benda',199],
  ['TOPIK-K1-MAT-7-B','BAB-K1-MAT-7','B','Mengukur Panjang Benda',208],
  ['TOPIK-K1-MAT-8-A','BAB-K1-MAT-8','A','Mengelompokkan Data',222],
  ['TOPIK-K1-MAT-8-B','BAB-K1-MAT-8','B','Diagram Gambar',229],

  ['TOPIK-K1-RUPA-1','BAB-K1-RUPA-1','A','Menggunakan variasi alat dan bahan di sekitar untuk berkarya secara tepat dan aman',39],
  ['TOPIK-K1-RUPA-2','BAB-K1-RUPA-2','A','Mengamati dan menceritakan bentuk serta warna di lingkungan sekitar',78],
  ['TOPIK-K1-RUPA-3','BAB-K1-RUPA-3','A','Menyimpulkan karakteristik alat dan bahan yang digunakan',102],
  ['TOPIK-K1-RUPA-4','BAB-K1-RUPA-4','A','Garis, bentuk, dan warna sebagai tiga unsur rupa di sekitar',125],
];

export const TOPIK_MASTER_KELAS1: BukuTopik[] = TOPIK_DATA.map(
  ([id,bab_id,nomor_tampil,judul_topik,halaman_awal],urutan)=>({
    id,bab_id,nomor_tampil,judul_topik,lingkup_materi:judul_topik,halaman_awal,urutan:urutan+1,
  }),
);

export async function semaiReferensiMasterKelas1(): Promise<void> {
  await jalankanTransaksi(
    [TOKO.bukuReferensi, TOKO.bukuBab, TOKO.bukuTopik],
    'readwrite',
    async (toko) => {
      for (const buku of BUKU_MASTER_KELAS1) {
        if (!(await kueri.ambil<BukuReferensi>(toko(TOKO.bukuReferensi), buku.id))) await kueri.simpan(toko(TOKO.bukuReferensi), buku);
      }
      for (const bab of BAB_MASTER_KELAS1) {
        if (!(await kueri.ambil<BukuBab>(toko(TOKO.bukuBab), bab.id))) await kueri.simpan(toko(TOKO.bukuBab), bab);
      }
      for (const topik of TOPIK_MASTER_KELAS1) {
        if (!(await kueri.ambil<BukuTopik>(toko(TOKO.bukuTopik), topik.id))) await kueri.simpan(toko(TOKO.bukuTopik), topik);
      }
    },
  );
}
