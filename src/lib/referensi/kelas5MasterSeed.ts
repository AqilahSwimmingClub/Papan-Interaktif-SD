import type { BukuBab, BukuReferensi, BukuTopik } from '../types';
import { TOKO, jalankanTransaksi, kueri } from '../storage/db';

const DITAMBAHKAN_PADA = '2026-08-25T00:00:00.000Z';

export const BUKU_MASTER_KELAS5: BukuReferensi[] = [
  { id:'BUKU-K5-MAT-2022', tingkat_kelas:5, mapel_kode:'MAT', judul:'Matematika untuk SD/MI Kelas V', penulis:'Meita Fitrianawati; Ika Surtiani; Ait Istiandaru', penerbit:'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', tahun:'2022', edisi:'Cetakan pertama', isbn:'978-602-427-916-5', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K5-PP-2023', tingkat_kelas:5, mapel_kode:'PP', judul:'Pendidikan Pancasila untuk SD/MI Kelas V', penulis:'Adi Darma Indra; Abdul Azis; Luh Gede Maya Wirastuti Dewi', penerbit:'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', tahun:'2023', edisi:'Cetak pertama', isbn:'978-623-194-651-5', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K5-IPAS-2021', tingkat_kelas:5, mapel_kode:'IPAS', judul:'Ilmu Pengetahuan Alam dan Sosial untuk SD Kelas V', penulis:'Amalia Fitri Ghaniem, dkk.', penerbit:'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', tahun:'2021', edisi:'', isbn:'978-602-244-681-1', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K5-BI-2021', tingkat_kelas:5, mapel_kode:'BI', judul:'Bahasa Indonesia: Bergerak Bersama untuk SD Kelas V', penulis:'Evy Verawaty; Zulqarnain', penerbit:'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', tahun:'2021', edisi:'Cetakan pertama', isbn:'978-602-244-714-6', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K5-BING-2024', tingkat_kelas:5, mapel_kode:'BING', judul:'English for Nusantara Kids untuk SD/MI Kelas V', penulis:'Yusnita Febriyanti; Diah Royani Meisani; Tira Rostia Wardini; Muhammad Agung Ibrahim; Ika Lestari Damayanti', penerbit:'Pusat Kurikulum dan Perbukuan', tahun:'2024', edisi:'', isbn:'978-623-388-244-6', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K5-KKA-BMM', tingkat_kelas:5, mapel_kode:'KKA', judul:'Koding dan Kecerdasan Artifisial Kelas 5', penulis:'', penerbit:'Penerbit Bukit Mas Mulia', tahun:'', edisi:'', isbn:'', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
  { id:'BUKU-K5-RUPA-GPM', tingkat_kelas:5, mapel_kode:'RUPA', judul:'Seni Rupa SD/MI Kelas 5 Kurikulum Merdeka', penulis:'Widiarti Tri Astuti S.P', penerbit:'CV Gilang Pratama', tahun:'', edisi:'', isbn:'', utama:true, status:'aktif', ditambahkan_oleh:null, ditambahkan_pada:DITAMBAHKAN_PADA },
];

const BAB_DATA: Array<[string,string,string,string,number|null]> = [
  ['BAB-K5-MAT-1','BUKU-K5-MAT-2022','1','Bilangan Cacah Sampai 100.000',1], ['BAB-K5-MAT-2','BUKU-K5-MAT-2022','2','KPK dan FPB',29], ['BAB-K5-MAT-3','BUKU-K5-MAT-2022','3','Bilangan Pecahan',63], ['BAB-K5-MAT-4','BUKU-K5-MAT-2022','4','Keliling Bangun Datar',105], ['BAB-K5-MAT-5','BUKU-K5-MAT-2022','5','Luas Daerah Bangun Datar',131], ['BAB-K5-MAT-6','BUKU-K5-MAT-2022','6','Sudut',163], ['BAB-K5-MAT-7','BUKU-K5-MAT-2022','7','Membandingkan Ciri-Ciri Bangun Datar',191], ['BAB-K5-MAT-8','BUKU-K5-MAT-2022','8','Data',235], ['BAB-K5-MAT-9','BUKU-K5-MAT-2022','9','Bilangan Cacah Sampai 1.000.000',273],
  ['BAB-K5-PP-1','BUKU-K5-PP-2023','1','Pancasila dalam Kehidupanku',1], ['BAB-K5-PP-2','BUKU-K5-PP-2023','2','Norma dalam Kehidupanku',35], ['BAB-K5-PP-3','BUKU-K5-PP-2023','3','Keragaman Budaya Indonesiaku',73], ['BAB-K5-PP-4','BUKU-K5-PP-2023','4','Aku dan Lingkungan Sekitarku',121],
  ['BAB-K5-IPAS-1','BUKU-K5-IPAS-2021','1','Melihat karena Cahaya, Mendengar karena Bunyi',1], ['BAB-K5-IPAS-2','BUKU-K5-IPAS-2021','2','Harmoni dalam Ekosistem',41], ['BAB-K5-IPAS-3','BUKU-K5-IPAS-2021','3','Magnet, Listrik, dan Teknologi untuk Kehidupan',79], ['BAB-K5-IPAS-4','BUKU-K5-IPAS-2021','4','Ayo Berkenalan dengan Bumi Kita',107], ['BAB-K5-IPAS-5','BUKU-K5-IPAS-2021','5','Bagaimana Kita Hidup dan Bertumbuh',129], ['BAB-K5-IPAS-6','BUKU-K5-IPAS-2021','6','Indonesiaku Kaya Raya',161], ['BAB-K5-IPAS-7','BUKU-K5-IPAS-2021','7','Daerahku Kebanggaanku',191], ['BAB-K5-IPAS-8','BUKU-K5-IPAS-2021','8','Bumiku Sayang, Bumiku Malang',215],
  ['BAB-K5-BI-1','BUKU-K5-BI-2021','I','Aku yang Unik',1], ['BAB-K5-BI-2','BUKU-K5-BI-2021','II','Buku Jendela Dunia',25], ['BAB-K5-BI-3','BUKU-K5-BI-2021','III','Ekspresi Diri Melalui Hobi',51], ['BAB-K5-BI-4','BUKU-K5-BI-2021','IV','Belajar Berwirausaha',75], ['BAB-K5-BI-5','BUKU-K5-BI-2021','V','Menjadi Warga Dunia',97], ['BAB-K5-BI-6','BUKU-K5-BI-2021','VI','Cinta Indonesia',123], ['BAB-K5-BI-7','BUKU-K5-BI-2021','VII','Sayangi Bumi',147], ['BAB-K5-BI-8','BUKU-K5-BI-2021','VIII','Bergerak Bersama',171],
  ['BAB-K5-BING-1','BUKU-K5-BING-2024','Unit 1','Holiday Memories',null], ['BAB-K5-BING-2','BUKU-K5-BING-2024','Unit 2','How is the Weather?',null], ['BAB-K5-BING-3','BUKU-K5-BING-2024','Unit 3','Delicious Indonesian Food',null], ['BAB-K5-BING-4','BUKU-K5-BING-2024','Unit 4','Where is the Post Office?',null],
];

export const BAB_MASTER_KELAS5: BukuBab[] = BAB_DATA.map(([id,buku_id,nomor_tampil,judul_bab,halaman_awal],urutan)=>({ id,buku_id,nomor_tampil,judul_bab,halaman_awal,halaman_akhir:null,urutan:urutan+1 }));

const TOPIK_DATA: Array<[string,string,string,string,number|null]> = [
  ['TOPIK-K5-MAT-1-A','BAB-K5-MAT-1','A','Membaca dan Menulis Bilangan Cacah Sampai 100.000 dan Menentukan Nilai Tempatnya',4], ['TOPIK-K5-MAT-1-B','BAB-K5-MAT-1','B','Membandingkan dan Mengurutkan Bilangan Cacah Sampai 100.000',10], ['TOPIK-K5-MAT-1-C','BAB-K5-MAT-1','C','Komposisi dan Dekomposisi Bilangan Sampai 100.000',15], ['TOPIK-K5-MAT-1-D','BAB-K5-MAT-1','D','Operasi Hitung pada Bilangan Cacah Sampai 100.000',17],
  ['TOPIK-K5-MAT-2-A','BAB-K5-MAT-2','A','Kelipatan',33], ['TOPIK-K5-MAT-2-B','BAB-K5-MAT-2','B','Kelipatan Persekutuan',38], ['TOPIK-K5-MAT-2-C','BAB-K5-MAT-2','C','Faktor',43], ['TOPIK-K5-MAT-2-D','BAB-K5-MAT-2','D','Faktor Persekutuan',46], ['TOPIK-K5-MAT-2-E','BAB-K5-MAT-2','E','Menentukan KPK dan FPB dengan Menggunakan Faktor Prima',53],
  ['TOPIK-K5-MAT-3-A','BAB-K5-MAT-3','A','Membandingkan dan Mengurutkan Pecahan',68], ['TOPIK-K5-MAT-3-B','BAB-K5-MAT-3','B','Penjumlahan Bilangan Pecahan',76], ['TOPIK-K5-MAT-3-C','BAB-K5-MAT-3','C','Pengurangan Bilangan Pecahan',91],
  ['TOPIK-K5-MAT-4-A','BAB-K5-MAT-4','A','Apakah Keliling Bangun Datar Itu?',107], ['TOPIK-K5-MAT-4-B','BAB-K5-MAT-4','B','Keliling Segitiga',115], ['TOPIK-K5-MAT-4-C','BAB-K5-MAT-4','C','Keliling Segi Empat',118], ['TOPIK-K5-MAT-4-D','BAB-K5-MAT-4','D','Keliling Segi Banyak',122], ['TOPIK-K5-MAT-4-E','BAB-K5-MAT-4','E','Keliling Bangun Gabungan',125],
  ['TOPIK-K5-MAT-5-A','BAB-K5-MAT-5','A','Konsep Luas Daerah Bangun Datar',133], ['TOPIK-K5-MAT-5-B','BAB-K5-MAT-5','B','Luas Daerah Bangun Datar',144], ['TOPIK-K5-MAT-5-C','BAB-K5-MAT-5','C','Luas Daerah Bangun Gabungan',158], ['TOPIK-K5-MAT-5-D','BAB-K5-MAT-5','D','Hubungan Keliling dan Luas Daerah Bangun Datar',159],
  ['TOPIK-K5-MAT-6-A','BAB-K5-MAT-6','A','Sudut Siku-Siku',166], ['TOPIK-K5-MAT-6-B','BAB-K5-MAT-6','B','Pengertian Sudut',170], ['TOPIK-K5-MAT-6-C','BAB-K5-MAT-6','C','Mengukur dan Membandingkan Sudut',175], ['TOPIK-K5-MAT-6-D','BAB-K5-MAT-6','D','Melukis Sudut',183],
  ['TOPIK-K5-MAT-7-A','BAB-K5-MAT-7','A','Membandingkan Ciri-Ciri Segitiga',196], ['TOPIK-K5-MAT-7-B','BAB-K5-MAT-7','B','Membandingkan Ciri-Ciri Segi Empat',209],
  ['TOPIK-K5-MAT-8-A','BAB-K5-MAT-8','A','Mengumpulkan Data',240], ['TOPIK-K5-MAT-8-B','BAB-K5-MAT-8','B','Piktogram',248], ['TOPIK-K5-MAT-8-C','BAB-K5-MAT-8','C','Diagram Batang',252],
  ['TOPIK-K5-MAT-9-A','BAB-K5-MAT-9','A','Membaca dan Menulis Bilangan Cacah Sampai 1.000.000 dan Menentukan Nilai Tempatnya',276], ['TOPIK-K5-MAT-9-B','BAB-K5-MAT-9','B','Mengurutkan dan Membandingkan Bilangan Sampai 1.000.000',284], ['TOPIK-K5-MAT-9-C','BAB-K5-MAT-9','C','Komposisi dan Dekomposisi Bilangan Sampai 1.000.000',288],

  ['TOPIK-K5-PP-1-A','BAB-K5-PP-1','A','Sejarah Kelahiran Pancasila',6], ['TOPIK-K5-PP-1-B','BAB-K5-PP-1','B','Meneladani Perilaku Pancasila',17], ['TOPIK-K5-PP-1-C','BAB-K5-PP-1','C','Membiasakan Perilaku Pancasila',23],
  ['TOPIK-K5-PP-2-A','BAB-K5-PP-2','A','Macam-Macam Norma dalam Kehidupanku',40], ['TOPIK-K5-PP-2-B','BAB-K5-PP-2','B','Penerapan Norma dalam Kehidupanku',47], ['TOPIK-K5-PP-2-C','BAB-K5-PP-2','C','Mempraktikkan Norma di Lingkunganku',58], ['TOPIK-K5-PP-2-D','BAB-K5-PP-2','D','Arti Penting Musyawarah dalam Kehidupanku',63],
  ['TOPIK-K5-PP-3-A','BAB-K5-PP-3','A','Budaya Daerah Indonesia',76], ['TOPIK-K5-PP-3-B','BAB-K5-PP-3','B','Ayo Lestarikan Budaya Daerah',104],
  ['TOPIK-K5-PP-4-A','BAB-K5-PP-4','A','Mengenal Karakteristik Wilayah',130], ['TOPIK-K5-PP-4-B','BAB-K5-PP-4','B','Gotong Royong di Lingkungan Sekitar',139], ['TOPIK-K5-PP-4-C','BAB-K5-PP-4','C','Praktik Gotong Royong di Lingkungan Sekitar',144],

  ['TOPIK-K5-IPAS-1-A','BAB-K5-IPAS-1','A','Cahaya dan Sifatnya',2], ['TOPIK-K5-IPAS-1-B','BAB-K5-IPAS-1','B','Melihat karena Cahaya',11], ['TOPIK-K5-IPAS-1-C','BAB-K5-IPAS-1','C','Bunyi dan Sifatnya',19], ['TOPIK-K5-IPAS-1-D','BAB-K5-IPAS-1','D','Mendengar karena Bunyi',29],
  ['TOPIK-K5-IPAS-2-A','BAB-K5-IPAS-2','A','Memakan dan Dimakan',42], ['TOPIK-K5-IPAS-2-B','BAB-K5-IPAS-2','B','Transfer Energi Antarmakhluk Hidup',56], ['TOPIK-K5-IPAS-2-C','BAB-K5-IPAS-2','C','Ekosistem yang Harmonis',62],
  ['TOPIK-K5-IPAS-3-A','BAB-K5-IPAS-3','A','Apa dan Untuk Apa Magnet Diciptakan?',80], ['TOPIK-K5-IPAS-3-B','BAB-K5-IPAS-3','B','Bagaimana Cara Mendapatkan Energi Listrik?',87], ['TOPIK-K5-IPAS-3-C','BAB-K5-IPAS-3','C','Teknologi untuk Kehidupan',95],
  ['TOPIK-K5-IPAS-4-A','BAB-K5-IPAS-4','A','Ada Apa Saja di Bumi Kita?',108], ['TOPIK-K5-IPAS-4-B','BAB-K5-IPAS-4','B','Mengapa Bentuk Permukaan Bumi Berubah-ubah?',115], ['TOPIK-K5-IPAS-4-C','BAB-K5-IPAS-4','C','Bagaimana Bumi Kita Berubah?',120],
  ['TOPIK-K5-IPAS-5-A','BAB-K5-IPAS-5','A','Bagaimana Bernapas Membantuku Melakukan Aktivitas Sehari-hari?',130], ['TOPIK-K5-IPAS-5-B','BAB-K5-IPAS-5','B','Mengapa Kita Perlu Makan dan Minum?',140], ['TOPIK-K5-IPAS-5-C','BAB-K5-IPAS-5','C','Bagaimana Aku Tumbuh Besar?',149],
  ['TOPIK-K5-IPAS-6-A','BAB-K5-IPAS-6','A','Bagaimana Bentuk Indonesiaku?',162], ['TOPIK-K5-IPAS-6-B','BAB-K5-IPAS-6','B','Indonesiaku Kaya Hayatinya',170], ['TOPIK-K5-IPAS-6-C','BAB-K5-IPAS-6','C','Indonesiaku Kaya Alamnya',178],
  ['TOPIK-K5-IPAS-7-A','BAB-K5-IPAS-7','A','Seperti Apakah Budaya Daerahku?',192], ['TOPIK-K5-IPAS-7-B','BAB-K5-IPAS-7','B','Kondisi Perekonomian di Daerahku',199], ['TOPIK-K5-IPAS-7-C','BAB-K5-IPAS-7','C','Wah, Ternyata Daerahku Luar Biasa!',205],
  ['TOPIK-K5-IPAS-8-A','BAB-K5-IPAS-8','A','Bumi Berubah',216], ['TOPIK-K5-IPAS-8-B','BAB-K5-IPAS-8','B','Oh, Lingkungan Jadi Rusak',222], ['TOPIK-K5-IPAS-8-C','BAB-K5-IPAS-8','C','Permasalahan Lingkungan Mengancam Kehidupan',228],
];

export const TOPIK_MASTER_KELAS5: BukuTopik[] = TOPIK_DATA.map(([id,bab_id,nomor_tampil,judul_topik,halaman_awal],urutan)=>({ id,bab_id,nomor_tampil,judul_topik,lingkup_materi:judul_topik,halaman_awal,urutan:urutan+1 }));

export async function semaiReferensiMasterKelas5(): Promise<void> {
  await jalankanTransaksi([TOKO.bukuReferensi,TOKO.bukuBab,TOKO.bukuTopik],'readwrite',async(toko)=>{
    for(const buku of BUKU_MASTER_KELAS5){ if(!(await kueri.ambil<BukuReferensi>(toko(TOKO.bukuReferensi),buku.id))) await kueri.simpan(toko(TOKO.bukuReferensi),buku); }
    for(const bab of BAB_MASTER_KELAS5){ if(!(await kueri.ambil<BukuBab>(toko(TOKO.bukuBab),bab.id))) await kueri.simpan(toko(TOKO.bukuBab),bab); }
    for(const topik of TOPIK_MASTER_KELAS5){ if(!(await kueri.ambil<BukuTopik>(toko(TOKO.bukuTopik),topik.id))) await kueri.simpan(toko(TOKO.bukuTopik),topik); }
  });
}
