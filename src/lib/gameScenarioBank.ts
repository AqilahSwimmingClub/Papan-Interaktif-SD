export interface SkenarioGameAnak {
  pemicu: readonly string[];
  topik: string;
  misi: string;
  narasi: string;
  jawaban: string;
  pengalih: readonly string[];
  urutan: readonly string[];
  kata: string;
  angka?: { jawaban: number; pilihan: readonly number[] };
}

const UMUM: readonly SkenarioGameAnak[] = [
  {
    pemicu: [], topik: 'petunjuk di sekolah', misi: 'temukan benda yang menyelesaikan tugas anak',
    narasi: 'Raka akan menempel hasil karya di papan kelas. Ia mencari benda yang dapat merekatkan kertas.',
    jawaban: 'Lem kertas', pengalih: ['Penggaris', 'Botol minum', 'Penghapus'],
    urutan: ['Siapkan karya', 'Oleskan lem', 'Tempelkan karya', 'Rapikan meja'], kata: 'KARYA',
  },
  {
    pemicu: [], topik: 'pilihan aman', misi: 'pilih tindakan yang membuat petualangan tetap aman',
    narasi: 'Nara melihat air tumpah di dekat pintu kelas ketika teman-temannya akan lewat.',
    jawaban: 'Lap air dan beri tahu guru', pengalih: ['Biarkan saja', 'Berlari melewatinya', 'Mendorong teman'],
    urutan: ['Berhenti', 'Peringatkan teman', 'Ambil lap', 'Keringkan lantai'], kata: 'AMAN',
  },
];

const BI: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['aural', 'menyimak', 'didengar', 'percakapan', 'pesan'], topik: 'pesan percakapan',
    misi: 'temukan pesan utama yang didengar Dara',
    narasi: 'Ibu berkata kepada Dara, “Tolong letakkan sepatu di rak agar lorong tetap rapi.”',
    jawaban: 'Letakkan sepatu di rak', pengalih: ['Buka semua jendela', 'Simpan buku di tas', 'Sirami tanaman'],
    urutan: ['Dara mendengarkan Ibu', 'Dara membawa sepatu', 'Dara membuka rak', 'Dara merapikan sepatu'], kata: 'SEPATU',
  },
  {
    pemicu: ['informasi', 'membaca', 'teks', 'bukti', 'tersurat'], topik: 'bukti dalam cerita',
    misi: 'cari bukti mengapa Lala membawa payung',
    narasi: 'Awan gelap menutup langit. Rintik hujan mulai turun ketika Lala berjalan pulang sambil membuka payung.',
    jawaban: 'Rintik hujan mulai turun', pengalih: ['Lala memakai sepatu', 'Pohon tumbuh tinggi', 'Burung terbang rendah'],
    urutan: ['Awan menjadi gelap', 'Hujan mulai turun', 'Lala membuka payung', 'Lala tiba dengan kering'], kata: 'HUJAN',
  },
  {
    pemicu: ['urutan', 'alur', 'paragraf', 'menulis', 'menyusun'], topik: 'urutan kegiatan',
    misi: 'susun kegiatan pagi Bimo agar ceritanya runtut',
    narasi: 'Bimo bersiap pergi ke sekolah. Kartu kegiatannya tercecer dan perlu disusun dari awal.',
    jawaban: 'Bangun → Mandi → Sarapan → Berangkat', pengalih: ['Berangkat dahulu', 'Tidur kembali', 'Bermain sepanjang pagi'],
    urutan: ['Bangun', 'Mandi', 'Sarapan', 'Berangkat'], kata: 'PAGI',
  },
  {
    pemicu: ['kosakata', 'kata', 'makna', 'ejaan'], topik: 'makna kata',
    misi: 'temukan kata untuk orang yang suka menolong',
    narasi: 'Sita membantu teman membawa tumpukan buku tanpa diminta. Teman-teman mengenali sifat baik Sita.',
    jawaban: 'Penolong', pengalih: ['Pemarah', 'Pelupa', 'Pengganggu'],
    urutan: ['Melihat teman kesulitan', 'Menawarkan bantuan', 'Membawa buku bersama', 'Mengucapkan terima kasih'], kata: 'TOLONG',
  },
];

const BING: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['greeting', 'greet', 'sapaan', 'conversation'], topik: 'greeting at school',
    misi: 'choose the friendly greeting for a morning meeting', narasi: 'Mila meets her teacher at the school gate in the morning.',
    jawaban: 'Good morning', pengalih: ['Good night', 'See you yesterday', 'Thank you, pencil'],
    urutan: ['Smile', 'Say good morning', 'Ask how are you', 'Say have a nice day'], kata: 'HELLO',
  },
  {
    pemicu: ['colour', 'color', 'shape', 'warna', 'bentuk'], topik: 'colours and shapes',
    misi: 'find the colour of the sun in the picture', narasi: 'A bright yellow sun shines above a blue house and a green tree.',
    jawaban: 'Yellow', pengalih: ['Blue', 'Green', 'Purple'],
    urutan: ['Draw a circle', 'Choose yellow', 'Colour the sun', 'Show the picture'], kata: 'YELLOW',
  },
  {
    pemicu: ['family', 'home', 'keluarga', 'activity'], topik: 'family activity',
    misi: 'match the sentence with the family activity', narasi: 'Father and Rani cook soup together in the kitchen.',
    jawaban: 'They are cooking', pengalih: ['They are swimming', 'They are sleeping', 'They are flying'],
    urutan: ['Wash vegetables', 'Cut vegetables', 'Cook the soup', 'Eat together'], kata: 'FAMILY',
  },
];

const MAT: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['bilangan', 'hitung', 'penjumlahan', 'operasi'], topik: 'penjumlahan kelereng',
    misi: 'hitung seluruh kelereng di dua kantong', narasi: 'Kantong biru berisi 7 kelereng dan kantong hijau berisi 5 kelereng.',
    jawaban: '12', pengalih: ['10', '11', '13'], urutan: ['Ambil 7 kelereng', 'Tambahkan 5', 'Hitung semuanya', 'Pilih 12'], kata: 'DUABELAS',
    angka: { jawaban: 12, pilihan: [10, 11, 12, 13] },
  },
  {
    pemicu: ['pecahan', 'bagian'], topik: 'pecahan pizza',
    misi: 'pilih bagian pizza yang menunjukkan satu perempat', narasi: 'Satu pizza dibagi menjadi 4 bagian sama besar. Rara mengambil tepat 1 bagian.',
    jawaban: '1/4', pengalih: ['1/2', '2/3', '4/1'], urutan: ['Bagi pizza 4 sama besar', 'Ambil 1 bagian', 'Hitung bagian terambil', 'Pilih 1/4'], kata: 'PECAHAN',
    angka: { jawaban: 1, pilihan: [1, 2, 3, 4] },
  },
  {
    pemicu: ['geometri', 'bentuk', 'bangun', 'ruang'], topik: 'ciri bangun datar',
    misi: 'temukan benda berbentuk segitiga', narasi: 'Di meja ada jam bundar, buku persegi panjang, penggaris segitiga, dan kotak kubus.',
    jawaban: 'Penggaris segitiga', pengalih: ['Jam bundar', 'Buku', 'Kotak kubus'],
    urutan: ['Amati jumlah sisi', 'Temukan tiga sisi', 'Cocokkan bentuk', 'Pilih penggaris'], kata: 'SEGITIGA',
  },
  {
    pemicu: ['ukur', 'panjang', 'berat', 'waktu'], topik: 'mengukur panjang',
    misi: 'pilih alat untuk mengukur panjang meja', narasi: 'Beni ingin mengetahui panjang meja kelas dalam sentimeter.',
    jawaban: 'Meteran', pengalih: ['Timbangan', 'Jam', 'Gelas ukur'],
    urutan: ['Letakkan angka nol', 'Bentangkan meteran', 'Lihat ujung meja', 'Catat hasil'], kata: 'METER',
  },
  {
    pemicu: ['pola', 'urutan'], topik: 'pola bilangan',
    misi: 'lanjutkan pola lompatan angka', narasi: 'Roket melompat pada angka 2, 4, 6, 8, lalu berhenti di petak kosong.',
    jawaban: '10', pengalih: ['9', '11', '12'], urutan: ['Mulai dari 2', 'Tambah 2', 'Tambah 2 lagi', 'Mendarat di 10'], kata: 'POLA',
    angka: { jawaban: 10, pilihan: [8, 9, 10, 12] },
  },
];

const IPAS: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['daur hidup', 'kupu', 'metamorfosis'], topik: 'daur hidup kupu-kupu',
    misi: 'susun perubahan kupu-kupu dari awal hingga dewasa', narasi: 'Di daun terdapat telur kecil. Setelah menetas, hewan itu berubah beberapa kali sebelum menjadi kupu-kupu.',
    jawaban: 'Telur → Ulat → Kepompong → Kupu-kupu', pengalih: ['Kupu-kupu → Batu', 'Ulat → Telur', 'Daun → Kepompong'],
    urutan: ['Telur', 'Ulat', 'Kepompong', 'Kupu-kupu'], kata: 'KUPUKUPU',
  },
  {
    pemicu: ['tumbuhan', 'tanaman', 'fotosintesis', 'makhluk hidup'], topik: 'kebutuhan tanaman',
    misi: 'pilih bahan yang membantu tanaman tumbuh sehat', narasi: 'Dua kecambah ditanam. Kecambah pertama mendapat air dan cahaya, kecambah kedua disimpan di kotak gelap tanpa air.',
    jawaban: 'Air dan cahaya matahari', pengalih: ['Plastik dan batu', 'Cat dan lem', 'Pasir kering saja'],
    urutan: ['Tanam biji', 'Siram secukupnya', 'Letakkan dekat cahaya', 'Amati pertumbuhan'], kata: 'TUMBUH',
  },
  {
    pemicu: ['air', 'wujud', 'menguap', 'siklus'], topik: 'perubahan wujud air',
    misi: 'temukan perubahan saat air dipanaskan', narasi: 'Air di dalam panci dipanaskan. Beberapa saat kemudian, uap naik dari permukaan air.',
    jawaban: 'Air cair berubah menjadi uap', pengalih: ['Uap berubah menjadi es', 'Air menjadi batu', 'Panci berubah menjadi air'],
    urutan: ['Tuang air', 'Panaskan panci', 'Amati uap', 'Catat penguapan'], kata: 'MENGUAP',
  },
  {
    pemicu: ['energi', 'listrik', 'cahaya', 'bunyi'], topik: 'perubahan energi',
    misi: 'cocokkan benda dengan perubahan energinya', narasi: 'Lampu belajar menyala setelah kabelnya dihubungkan ke sumber listrik.',
    jawaban: 'Listrik menjadi cahaya', pengalih: ['Cahaya menjadi tanah', 'Air menjadi listrik', 'Bunyi menjadi batu'],
    urutan: ['Hubungkan kabel', 'Tekan sakelar', 'Lampu menyala', 'Amati cahaya'], kata: 'ENERGI',
  },
  {
    pemicu: ['rantai makanan', 'makanan', 'hewan'], topik: 'rantai makanan',
    misi: 'susun hubungan makan di sawah', narasi: 'Di sawah terdapat padi, belalang, katak, dan ular.',
    jawaban: 'Padi → Belalang → Katak → Ular', pengalih: ['Ular → Padi', 'Katak → Padi', 'Belalang → Matahari'],
    urutan: ['Padi', 'Belalang', 'Katak', 'Ular'], kata: 'RANTAI',
  },
];

const PP: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['musyawarah', 'keputusan', 'pendapat'], topik: 'musyawarah kelas',
    misi: 'pilih tindakan saat teman memiliki usul berbeda', narasi: 'Kelompok akan memilih tema poster. Setiap anak mengusulkan tema yang berbeda.',
    jawaban: 'Dengarkan semua usul lalu sepakati bersama', pengalih: ['Paksa usul sendiri', 'Tinggalkan kelompok', 'Ejek usul teman'],
    urutan: ['Sampaikan usul', 'Dengarkan teman', 'Bahas kelebihan', 'Sepakati pilihan'], kata: 'MUFAKAT',
  },
  {
    pemicu: ['gotong royong', 'kerja sama', 'tanggung jawab'], topik: 'gotong royong',
    misi: 'temukan cara menyelesaikan kelas kotor', narasi: 'Seusai kegiatan seni, potongan kertas berserakan dan meja perlu dirapikan sebelum pulang.',
    jawaban: 'Bagi tugas dan membersihkan bersama', pengalih: ['Menyuruh satu teman saja', 'Meninggalkan kelas', 'Menyembunyikan sampah'],
    urutan: ['Bagi tugas', 'Kumpulkan sampah', 'Lap meja', 'Periksa bersama'], kata: 'GOTONG',
  },
  {
    pemicu: ['hak', 'kewajiban', 'aturan'], topik: 'hak dan kewajiban',
    misi: 'pilih kewajiban setelah meminjam buku', narasi: 'Ayu mendapat hak meminjam buku perpustakaan selama satu minggu.',
    jawaban: 'Menjaga dan mengembalikan buku tepat waktu', pengalih: ['Mencoret halaman', 'Menyimpan selamanya', 'Merobek sampul'],
    urutan: ['Pinjam dengan tertib', 'Baca dengan hati-hati', 'Jaga kebersihan buku', 'Kembalikan tepat waktu'], kata: 'TANGGUNG',
  },
];

const KKA: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['algoritma', 'urutan', 'perintah', 'coding'], topik: 'algoritma robot',
    misi: 'susun blok agar robot mencapai bintang', narasi: 'Robot berada dua petak di kiri bintang dan menghadap ke kanan.',
    jawaban: 'Maju → Maju → Ambil bintang', pengalih: ['Mundur terus', 'Putar tanpa maju', 'Hapus tujuan'],
    urutan: ['Mulai', 'Maju satu petak', 'Maju satu petak', 'Ambil bintang'], kata: 'ROBOT',
  },
  {
    pemicu: ['debug', 'kesalahan', 'memperbaiki'], topik: 'debugging',
    misi: 'temukan blok yang membuat robot menabrak dinding', narasi: 'Program berisi Maju, Kanan, Maju, Maju. Dinding berada tepat setelah belokan kanan pertama.',
    jawaban: 'Ganti perintah Kanan menjadi Kiri', pengalih: ['Tambah Maju', 'Hapus tombol mulai', 'Matikan layar'],
    urutan: ['Jalankan program', 'Temukan tabrakan', 'Ubah arah', 'Uji kembali'], kata: 'DEBUG',
  },
  {
    pemicu: ['privasi', 'aman', 'internet', 'data'], topik: 'privasi digital',
    misi: 'pilih data yang tidak boleh dibagikan sembarangan', narasi: 'Sebuah gim meminta nama panggilan, warna kesukaan, dan kata sandi akun.',
    jawaban: 'Kata sandi akun', pengalih: ['Warna kesukaan', 'Nama hewan favorit', 'Hobi menggambar'],
    urutan: ['Baca permintaan', 'Kenali data rahasia', 'Tolak membagikan sandi', 'Minta bantuan orang dewasa'], kata: 'PRIVASI',
  },
];

const PJOK: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['pemanasan', 'kebugaran', 'aman'], topik: 'pemanasan aman',
    misi: 'susun kegiatan sebelum permainan dimulai', narasi: 'Kelas akan bermain bola. Tubuh perlu disiapkan agar bergerak aman.',
    jawaban: 'Jalan ringan → Putar bahu → Regang kaki → Mulai bermain', pengalih: ['Langsung sprint', 'Duduk sepanjang waktu', 'Mendorong teman'],
    urutan: ['Jalan ringan', 'Putar bahu', 'Regang kaki', 'Mulai bermain'], kata: 'BUGAR',
  },
  {
    pemicu: ['lempar', 'tangkap', 'bola', 'permainan'], topik: 'menangkap bola',
    misi: 'pilih posisi tangan untuk menangkap bola dengan aman', narasi: 'Bola lunak datang perlahan setinggi dada ke arah Edo.',
    jawaban: 'Tangan terbuka menghadap bola', pengalih: ['Tangan di belakang', 'Mata ditutup', 'Membelakangi bola'],
    urutan: ['Lihat arah bola', 'Buka kedua tangan', 'Tangkap dengan lembut', 'Tarik ke dada'], kata: 'TANGKAP',
  },
  {
    pemicu: ['seimbang', 'keseimbangan', 'gerak'], topik: 'keseimbangan tubuh',
    misi: 'selesaikan lintasan keseimbangan', narasi: 'Sari berjalan di garis lurus sambil merentangkan kedua tangan.',
    jawaban: 'Pandangan ke depan dan tangan direntangkan', pengalih: ['Mata ditutup', 'Berlari secepatnya', 'Tangan memegang kaki'],
    urutan: ['Berdiri tegak', 'Rentangkan tangan', 'Lihat ke depan', 'Melangkah perlahan'], kata: 'SEIMBANG',
  },
];

const SMUS: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['ritme', 'irama', 'ketukan', 'tempo'], topik: 'pola ketukan',
    misi: 'ikuti pola bunyi agar lampu panggung menyala', narasi: 'Lampu menampilkan pola: tepuk, tepuk, diam, tepuk.',
    jawaban: 'Tepuk → Tepuk → Diam → Tepuk', pengalih: ['Diam terus', 'Tepuk satu kali', 'Ketuk acak'],
    urutan: ['Tepuk', 'Tepuk', 'Diam', 'Tepuk'], kata: 'RITME',
  },
  {
    pemicu: ['bunyi', 'tinggi', 'rendah', 'dinamika'], topik: 'tinggi rendah bunyi',
    misi: 'temukan alat yang menghasilkan bunyi lebih tinggi', narasi: 'Dua bilah xilofon dipukul dengan kekuatan sama: satu bilah pendek dan satu bilah panjang.',
    jawaban: 'Bilah yang lebih pendek', pengalih: ['Bilah yang lebih panjang', 'Meja kayu', 'Kotak penyimpanan'],
    urutan: ['Pukul bilah panjang', 'Dengarkan', 'Pukul bilah pendek', 'Bandingkan bunyi'], kata: 'NADA',
  },
];

const RUPA: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['warna', 'campur'], topik: 'campuran warna', misi: 'campurkan dua warna untuk membuat hijau',
    narasi: 'Lumi memiliki cat biru dan cat kuning untuk mewarnai daun.', jawaban: 'Biru dan kuning',
    pengalih: ['Merah dan putih', 'Hitam dan putih', 'Merah dan biru'],
    urutan: ['Ambil cat biru', 'Tambahkan kuning', 'Aduk perlahan', 'Gunakan warna hijau'], kata: 'HIJAU',
  },
  {
    pemicu: ['pola', 'bentuk', 'komposisi'], topik: 'pola bentuk', misi: 'lengkapi pola pada bingkai karya',
    narasi: 'Bingkai memiliki pola lingkaran, segitiga, lingkaran, segitiga, lalu satu tempat kosong.',
    jawaban: 'Lingkaran', pengalih: ['Persegi', 'Bintang', 'Garis'],
    urutan: ['Lingkaran', 'Segitiga', 'Lingkaran', 'Segitiga'], kata: 'BENTUK',
  },
];

const TARI: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['gerak', 'urutan', 'tempo', 'ruang'], topik: 'rangkaian gerak tari', misi: 'susun gerak mengikuti empat hitungan',
    narasi: 'Penari memulai dari posisi berdiri, melangkah kanan, mengangkat tangan, lalu berputar.',
    jawaban: 'Berdiri → Langkah kanan → Angkat tangan → Putar', pengalih: ['Duduk terus', 'Gerak acak', 'Keluar panggung'],
    urutan: ['Berdiri', 'Langkah kanan', 'Angkat tangan', 'Putar'], kata: 'GERAK',
  },
  {
    pemicu: ['pola lantai', 'arah', 'level'], topik: 'pola lantai', misi: 'pilih jalur untuk membentuk garis diagonal',
    narasi: 'Empat penari akan bergerak dari sudut kiri depan menuju sudut kanan belakang.',
    jawaban: 'Jalur diagonal', pengalih: ['Lingkaran kecil', 'Diam di tempat', 'Garis mendatar'],
    urutan: ['Mulai kiri depan', 'Langkah serong', 'Jaga jarak', 'Akhir kanan belakang'], kata: 'DIAGONAL',
  },
];

const TEATER: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['ekspresi', 'tokoh', 'adegan'], topik: 'ekspresi tokoh', misi: 'pilih ekspresi untuk tokoh yang menemukan hadiah',
    narasi: 'Tokoh membuka kotak dan menemukan buku yang sudah lama ia inginkan.',
    jawaban: 'Wajah gembira dan mata berbinar', pengalih: ['Menguap bosan', 'Membelakangi penonton', 'Berbisik tanpa ekspresi'],
    urutan: ['Melihat kotak', 'Membuka perlahan', 'Menemukan hadiah', 'Tersenyum gembira'], kata: 'EKSPRESI',
  },
  {
    pemicu: ['dialog', 'suara', 'panggung'], topik: 'dialog yang jelas', misi: 'pilih cara menyampaikan dialog di panggung',
    narasi: 'Penonton di baris belakang perlu mendengar ajakan tokoh untuk menjaga taman.',
    jawaban: 'Ucapkan jelas dengan volume cukup', pengalih: ['Berbisik sangat pelan', 'Menutup mulut', 'Berbicara membelakangi penonton'],
    urutan: ['Tarik napas', 'Hadap penonton', 'Ucapkan dialog jelas', 'Tunggu respons'], kata: 'DIALOG',
  },
];

const PADB: readonly SkenarioGameAnak[] = [
  {
    pemicu: ['jujur', 'kejujuran', 'amanah'], topik: 'tindakan jujur', misi: 'bantu Nisa memilih tindakan ketika menemukan pensil',
    narasi: 'Nisa menemukan pensil baru di bawah meja. Ia melihat nama Riko tertulis pada pensil itu.',
    jawaban: 'Kembalikan pensil kepada Riko', pengalih: ['Simpan diam-diam', 'Buang pensil', 'Hapus nama Riko'],
    urutan: ['Ambil pensil', 'Baca nama pemilik', 'Cari Riko', 'Kembalikan pensil'], kata: 'JUJUR',
  },
  {
    pemicu: ['peduli', 'tolong', 'kasih', 'welas', 'menolong'], topik: 'kepedulian', misi: 'pilih tindakan saat teman kesulitan membawa buku',
    narasi: 'Tumpukan buku yang dibawa Danu hampir jatuh di depan pintu kelas.',
    jawaban: 'Tawarkan bantuan membawa sebagian buku', pengalih: ['Menertawakan Danu', 'Berjalan menjauh', 'Menambah buku di atasnya'],
    urutan: ['Lihat teman kesulitan', 'Tawarkan bantuan', 'Bawa buku bersama', 'Susun di meja'], kata: 'PEDULI',
  },
  {
    pemicu: ['syukur', 'bersyukur', 'hormat', 'bakti'], topik: 'rasa syukur dan hormat', misi: 'pilih sikap setelah menerima bantuan',
    narasi: 'Guru membantu Lani memahami tugas yang semula terasa sulit.',
    jawaban: 'Ucapkan terima kasih dan kerjakan dengan sungguh-sungguh', pengalih: ['Abaikan guru', 'Sobek tugas', 'Ganggu teman'],
    urutan: ['Dengarkan penjelasan', 'Coba kembali', 'Ucapkan terima kasih', 'Selesaikan tugas'], kata: 'SYUKUR',
  },
];

const BANK: Record<string, readonly SkenarioGameAnak[]> = { BI, BING, MAT, IPAS, PP, KKA, PJOK, SMUS, RUPA, TARI, TEATER };

function hash(teks: string): number {
  return [...teks].reduce((nilai, huruf) => ((nilai * 31) + huruf.charCodeAt(0)) >>> 0, 17);
}

function bankUntuk(kode: string): readonly SkenarioGameAnak[] {
  if (kode.startsWith('PA')) return PADB;
  return BANK[kode] ?? UMUM;
}

/** TP hanya merutekan skenario; teksnya tidak pernah dijadikan prompt atau opsi permainan. */
export function pilihSkenarioGame(mapelKode: string, teksTp: string, tpId: string, indeks: number): SkenarioGameAnak {
  const teks = teksTp.toLocaleLowerCase('id');
  const bank = bankUntuk(mapelKode);
  const berperingkat = bank.map((skenario, urutan) => ({
    skenario,
    urutan,
    skor: skenario.pemicu.reduce((jumlah, pemicu) => jumlah + (teks.includes(pemicu) ? 1 : 0), 0),
  })).sort((a, b) => b.skor - a.skor || a.urutan - b.urutan);
  const skorTerbaik = berperingkat[0]?.skor ?? 0;
  const posisi = skorTerbaik > 0 ? indeks : hash(tpId) + indeks;
  return berperingkat[posisi % berperingkat.length]!.skenario;
}
