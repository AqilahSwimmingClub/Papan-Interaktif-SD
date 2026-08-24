import type { MekanikGameAnak, ModePermainanGame } from './types';

export const BUKU_IPAS_KELAS_5 = {
  kode: 'IPAS-BS-KLS-V',
  judul: 'ILMU PENGETAHUAN ALAM DAN SOSIAL UNTUK SD KELAS V',
  lingkupIzin: 'metadata_saja' as const,
};

export const TP_IPAS_KELAS_5 = {
  tubuh: 'TP-IPAS-5-1.1',
  cahayaBunyi: 'TP-IPAS-5-1.3',
  prosesSains: 'TP-IPAS-5-2.1',
  buktiSains: 'TP-IPAS-5-2.3',
} as const;

export type JenisVlabIpas =
  | 'optik'
  | 'bayangan'
  | 'bunyi'
  | 'anatomi'
  | 'anatomi'
  | 'rantai_makanan'
  | 'ekosistem'
  | 'magnet'
  | 'rangkaian'
  | 'solusi'
  | 'peta'
  | 'erosi'
  | 'pernapasan'
  | 'pencernaan'
  | 'pertumbuhan'
  | 'ekonomi'
  | 'kota_hijau';

export interface TantanganIpas {
  narasi: string;
  misi: string;
  jawaban: string;
  pengalih: string[];
  urutan: string[];
}

export interface VlabIpas {
  id: string;
  nama: string;
  jenis: JenisVlabIpas;
  tujuan: string;
  petunjuk: string;
}

export interface GameIpas {
  id: string;
  nama: string;
  mekanik: MekanikGameAnak;
  engineKode: string;
  level: 'mudah' | 'sedang' | 'sulit';
  mode: ModePermainanGame;
}

export interface TopikIpas {
  id: string;
  kode: string;
  nama: string;
  ikon: string;
  tpIds: string[];
  vlab: VlabIpas[];
  game: GameIpas[];
  tantangan: TantanganIpas;
}

export interface BabIpas {
  id: string;
  nomor: number;
  nama: string;
  topik: TopikIpas[];
}

const slug = (nilai: string) => nilai.toLowerCase().normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ENGINE: Record<MekanikGameAnak, string> = {
  kuis: 'kuis-cepat', maze_adventure: 'maze-labirin', balloon_pop: 'siapa-cepat',
  whack_target: 'siapa-cepat', treasure_hunt: 'eksplorasi-gambar', racing_game: 'balap-soal',
  tower_builder: 'puzzle', territory_battle: 'peta-interaktif', monster_battle: 'battle-kelompok',
  fishing_catch: 'simak-dan-pilih', platform_jump: 'tebak-gambar', sorting_factory: 'klasifikasi',
  puzzle_builder: 'puzzle', memory_world: 'memory-card', board_game: 'roda-tantangan',
  bingo_classroom: 'bingo-edukasi', escape_room: 'soal-cerita-interaktif',
  number_adventure: 'maze-labirin', word_adventure: 'puzzle', science_lab: 'uji-hipotesis',
  coding_quest: 'coding-blocks', music_rhythm: 'pola-irama', art_stage: 'galeri-warna-bentuk',
  pjok_motion: 'sirkuit-gerak', story_adventure: 'soal-cerita-interaktif',
};

const ROTASI: MekanikGameAnak[] = [
  'maze_adventure', 'treasure_hunt', 'puzzle_builder', 'sorting_factory',
  'racing_game', 'science_lab', 'platform_jump', 'board_game',
];

function mekanikGame(nama: string, index: number): MekanikGameAnak {
  const n = nama.toLowerCase();
  if (n.includes('maze')) return 'maze_adventure';
  if (n.includes('race') || n.includes('runner')) return 'racing_game';
  if (n.includes('catch')) return 'fishing_catch';
  if (n.includes('fishing')) return 'fishing_catch';
  if (n.includes('factory') || n.includes('sorting')) return 'sorting_factory';
  if (n.includes('puzzle') || n.includes('builder') || n.includes('build ')) return 'puzzle_builder';
  if (n.includes('battle') || n.includes('defender')) return 'territory_battle';
  if (n.includes('rescue') || n.includes('adventure') || n.includes('journey')) return 'platform_jump';
  if (n.includes('treasure') || n.includes('hunt') || n.includes('explorer') || n.includes('jelajah')) return 'treasure_hunt';
  if (n.includes('memory')) return 'memory_world';
  if (n.includes('tycoon') || n.includes('manager') || n.includes('strategy') || n.includes('city')) return 'board_game';
  if (n.includes('escape')) return 'escape_room';
  if (n.includes('timeline')) return 'puzzle_builder';
  if (n.includes('rhythm')) return 'music_rhythm';
  return ROTASI[index % ROTASI.length];
}

function daftarGame(topikId: string, nama: string[]): GameIpas[] {
  return nama.map((judul, index) => {
    const mekanik = mekanikGame(judul, index);
    return {
      id: `${topikId}-game-${slug(judul)}`,
      nama: judul,
      mekanik,
      engineKode: ENGINE[mekanik],
      level: index < 2 ? 'mudah' : index < 5 ? 'sedang' : 'sulit',
      mode: mekanik === 'territory_battle' ? 'battle' : index % 3 === 2 ? 'kelompok' : 'individu',
    };
  });
}

function daftarVlab(topikId: string, jenis: JenisVlabIpas, nama: string[], tujuan: string): VlabIpas[] {
  return nama.map((judul) => ({
    id: `${topikId}-vlab-${slug(judul)}`,
    nama: judul,
    jenis,
    tujuan,
    petunjuk: 'Ubah objek atau variabel, jalankan percobaan, amati indikator, lalu tuliskan temuanmu.',
  }));
}

function topik(
  bab: number,
  kode: string,
  nama: string,
  ikon: string,
  tpIds: string[],
  jenis: JenisVlabIpas,
  namaVlab: string[],
  tujuan: string,
  namaGame: string[],
  tantangan: TantanganIpas,
): TopikIpas {
  const id = `ipas5-b${bab}-${kode.toLowerCase()}`;
  return { id, kode: `Topik ${kode}`, nama, ikon, tpIds, vlab: daftarVlab(id, jenis, namaVlab, tujuan), game: daftarGame(id, namaGame), tantangan };
}

const SAINS = [TP_IPAS_KELAS_5.prosesSains, TP_IPAS_KELAS_5.buktiSains];
const CAHAYA = [TP_IPAS_KELAS_5.cahayaBunyi];
const TUBUH = [TP_IPAS_KELAS_5.tubuh];

export const BAB_IPAS_KELAS_5: BabIpas[] = [
  {
    id: 'ipas5-b1', nomor: 1, nama: 'Cahaya dan Bunyi', topik: [
      topik(1, 'A', 'Cahaya dan Sifatnya', '🔦', CAHAYA, 'optik', ['Light Ray Lab', 'Mirror Lab', 'Material Lab', 'Refraction Lab', 'Color Light Lab'], 'Menyelidiki arah rambat, pantulan, penembusan, pembiasan, dan warna cahaya.', ['Light Maze', 'Mirror Mission', 'Shadow Hunt', 'Catch The Light', 'Laser Puzzle', 'Color Quest', 'Light Treasure', 'Light Lab Challenge'], { narasi: 'Senter diarahkan ke cermin miring agar cahaya mencapai tanda bintang.', misi: 'Arahkan berkas cahaya sampai mengenai target.', jawaban: 'Cermin memantulkan cahaya ke target', pengalih: ['Kain menyerap semua cahaya', 'Cahaya berhenti di udara', 'Bayangan menghasilkan cahaya'], urutan: ['Nyalakan senter', 'Atur cermin', 'Amati sinar pantul', 'Capai target'] }),
      topik(1, 'B', 'Melihat karena Cahaya', '👁️', CAHAYA, 'anatomi', ['Eye Explorer'], 'Menjelajahi perjalanan cahaya dari objek hingga informasi visual diterima.', ['Journey Into The Eye', 'Eye Rescue', 'Vision Adventure', 'Focus Challenge', 'Eye Puzzle', 'Healthy Eyes Mission'], { narasi: 'Cahaya dari buku masuk ke mata Rani saat ia membaca di tempat terang.', misi: 'Bantu cahaya mencapai bagian penerima pada mata.', jawaban: 'Cahaya dari objek masuk ke mata', pengalih: ['Mata memancarkan cahaya ke buku', 'Suara membawa gambar', 'Bayangan masuk melalui telinga'], urutan: ['Cahaya mengenai objek', 'Cahaya dipantulkan objek', 'Cahaya masuk ke mata', 'Informasi diteruskan ke otak'] }),
      topik(1, 'C', 'Bunyi dan Sifatnya', '🎵', CAHAYA, 'bunyi', ['Vibration Lab', 'Sound Wave Lab', 'Medium Lab', 'Frequency Lab', 'Amplitude Lab', 'Sound Reflection', 'Sound Absorption', 'Echo Lab'], 'Menyelidiki getaran, medium, frekuensi, amplitudo, pantulan, dan penyerapan bunyi.', ['Sound Catcher', 'Echo Cave', 'Sound Wave Runner', 'Frequency Challenge', 'Sound Detective', 'Rhythm Race', 'Catch The Sound', 'Sound Treasure'], { narasi: 'Karet yang dipetik bergetar dan menghasilkan bunyi yang terdengar melalui udara.', misi: 'Tangkap sumber yang benar-benar bergetar.', jawaban: 'Karet yang dipetik', pengalih: ['Batu yang diam', 'Kertas yang tidak bergerak', 'Lampu yang menyala'], urutan: ['Objek bergetar', 'Gelombang terbentuk', 'Gelombang merambat', 'Bunyi diterima telinga'] }),
      topik(1, 'D', 'Mendengar karena Bunyi', '👂', CAHAYA, 'anatomi', ['Ear Explorer'], 'Menjelajahi perjalanan gelombang bunyi melalui bagian utama pendengaran.', ['Journey Into The Ear', 'Hearing Rescue', 'Sound Path Adventure', 'Ear Puzzle', 'Hearing Mission', 'Sound Journey'], { narasi: 'Bunyi bel merambat melalui udara menuju telinga Bima.', misi: 'Susun jalur bunyi hingga informasinya diterima.', jawaban: 'Gelombang bunyi masuk ke telinga', pengalih: ['Cahaya masuk ke telinga', 'Telinga memancarkan bunyi', 'Bunyi hanya berada di bel'], urutan: ['Sumber bergetar', 'Gelombang merambat', 'Gendang telinga bergetar', 'Informasi menuju otak'] }),
    ],
  },
  {
    id: 'ipas5-b2', nomor: 2, nama: 'Harmoni dalam Ekosistem', topik: [
      topik(2, 'A', 'Memakan dan Dimakan', '🐛', SAINS, 'rantai_makanan', ['Food Chain Builder'], 'Membangun hubungan makan dan dimakan dari sumber energi hingga pengurai.', ['Food Chain Adventure', 'Who Eats Who', 'Predator Chase', 'Food Chain Puzzle', 'Habitat Hunt', 'Food Chain Race', 'Nature Treasure'], { narasi: 'Di kebun, rumput dimakan belalang, lalu belalang dimakan katak.', misi: 'Bangun rantai makanan kebun dengan arah yang tepat.', jawaban: 'Rumput → Belalang → Katak', pengalih: ['Katak → Rumput → Belalang', 'Belalang → Katak → Rumput', 'Rumput → Katak → Belalang'], urutan: ['Matahari', 'Rumput', 'Belalang', 'Katak', 'Pengurai'] }),
      topik(2, 'B', 'Transfer Energi', '☀️', SAINS, 'rantai_makanan', ['Energy Flow Simulator'], 'Mengamati perpindahan energi pada hubungan antarorganisme.', ['Energy Race', 'Energy Flow Builder', 'Energy Maze', 'Food Web Challenge', 'Energy Treasure', 'Ecosystem Runner'], { narasi: 'Energi matahari disimpan tumbuhan lalu berpindah saat tumbuhan dimakan.', misi: 'Ikuti panah energi tanpa terputus.', jawaban: 'Matahari → Tumbuhan → Hewan', pengalih: ['Hewan → Matahari → Tumbuhan', 'Tumbuhan → Matahari → Hewan', 'Tanah → Matahari → Hewan'], urutan: ['Matahari', 'Tumbuhan', 'Herbivor', 'Karnivor'] }),
      topik(2, 'C', 'Ekosistem Harmonis', '🌿', SAINS, 'ekosistem', ['Ecosystem Sandbox'], 'Menguji bagaimana perubahan populasi memengaruhi keseimbangan ekosistem.', ['Ecosystem Rescue', 'Balance Nature', 'Eco Defender', 'Food Web Builder', 'Ecosystem Battle', 'Nature Guardian', 'Ecosystem Tycoon EDU'], { narasi: 'Populasi tumbuhan turun tajam sehingga hewan pemakan tumbuhan kekurangan makanan.', misi: 'Pulihkan produsen agar indikator ekosistem kembali seimbang.', jawaban: 'Tambah populasi tumbuhan', pengalih: ['Hapus semua pengurai', 'Tambah sampah', 'Kurangi air sampai habis'], urutan: ['Amati populasi', 'Temukan perubahan', 'Atur organisme', 'Periksa keseimbangan'] }),
    ],
  },
  {
    id: 'ipas5-b3', nomor: 3, nama: 'Magnet, Listrik, dan Teknologi', topik: [
      topik(3, 'A', 'Magnet', '🧲', SAINS, 'magnet', ['Magnet Lab'], 'Menyelidiki kutub magnet serta benda magnetis dan nonmagnetis.', ['Magnet Fishing', 'Magnet Mission', 'Pole Battle', 'Magnetic Treasure', 'Magnet Factory', 'Magnet Maze', 'Magnetic Catch'], { narasi: 'Dua kutub utara didekatkan dan keduanya saling menjauh.', misi: 'Gunakan tarik-tolak magnet untuk mencapai benda target.', jawaban: 'Kutub sama saling menolak', pengalih: ['Semua kutub selalu menarik', 'Kayu menjadi kutub magnet', 'Magnet tidak memiliki arah'], urutan: ['Pilih kutub', 'Dekatkan magnet', 'Amati gerak', 'Catat tarik atau tolak'] }),
      topik(3, 'B', 'Listrik', '💡', SAINS, 'rangkaian', ['Circuit Builder'], 'Merangkai baterai, kabel, saklar, dan lampu menjadi rangkaian tertutup.', ['Power The City', 'Circuit Builder Challenge', 'Electricity Maze', 'Fix The Circuit', 'Power Race', 'Electrician Adventure', 'Electricity Escape Room'], { narasi: 'Lampu kota belum menyala karena satu kabel belum tersambung.', misi: 'Lengkapi rangkaian dan aktifkan saklar.', jawaban: 'Sambungkan semua komponen dan tutup saklar', pengalih: ['Lepaskan baterai', 'Putuskan dua kabel', 'Buka saklar'], urutan: ['Pasang baterai', 'Hubungkan kabel', 'Pasang lampu', 'Tutup saklar'] }),
      topik(3, 'C', 'Teknologi', '⚙️', SAINS, 'solusi', ['Technology Solution Lab'], 'Membandingkan teknologi sebagai solusi beserta manfaat dan dampaknya.', ['Technology Factory', 'Inventor Challenge', 'Innovation Puzzle', 'Technology Timeline', 'Future City', 'Build An Invention'], { narasi: 'Warga membutuhkan cara mengangkat air tanpa membuang banyak tenaga.', misi: 'Pilih teknologi yang sesuai kebutuhan dan nilai dampaknya.', jawaban: 'Pompa air hemat energi', pengalih: ['Lampu hias menyala siang hari', 'Pengeras suara sangat keras', 'Mesin tanpa fungsi'], urutan: ['Kenali masalah', 'Pilih solusi', 'Uji fungsi', 'Nilai manfaat dan dampak'] }),
    ],
  },
  {
    id: 'ipas5-b4', nomor: 4, nama: 'Bumi Kita', topik: [
      topik(4, 'A', 'Ada Apa di Bumi?', '🌍', SAINS, 'peta', ['Earth Explorer'], 'Menjelajahi bentang darat dan perairan pada model Bumi interaktif.', ['Earth Explorer', 'Landform Hunt', 'Build The Earth', 'Geography Puzzle', 'Earth Treasure', 'Landform Race'], { narasi: 'Aliran air bergerak dari tempat tinggi menuju bagian lebih rendah hingga laut.', misi: 'Temukan bentang alam yang menjadi jalur aliran air.', jawaban: 'Sungai', pengalih: ['Gunung', 'Dataran tinggi', 'Lembah kering'], urutan: ['Gunung', 'Hulu sungai', 'Hilir sungai', 'Laut'] }),
      topik(4, 'B', 'Permukaan Bumi Berubah', '🏞️', SAINS, 'erosi', ['Erosion Lab'], 'Menguji pengaruh air, kemiringan, permukaan, dan vegetasi terhadap erosi.', ['Erosion Challenge', 'River Adventure', 'Landform Builder', 'Earth Change Puzzle', 'Soil Rescue', 'Geo Challenge'], { narasi: 'Tanah miring tanpa tumbuhan diguyur hujan deras dan banyak tanah terbawa.', misi: 'Kurangi erosi dengan mengubah kondisi permukaan.', jawaban: 'Tambah vegetasi', pengalih: ['Tambah kemiringan', 'Tambah aliran air', 'Hilangkan semua akar'], urutan: ['Pelapukan', 'Erosi', 'Pengangkutan', 'Sedimentasi'] }),
      topik(4, 'C', 'Bumi Berubah', '⛰️', SAINS, 'erosi', ['Changing Earth'], 'Membandingkan proses yang mengubah permukaan Bumi dari waktu ke waktu.', ['Geo Adventure', 'Earth Rescue', 'Changing Earth', 'Earth Scientist', 'Earth Puzzle', 'Planet Explorer'], { narasi: 'Endapan terbawa sungai lalu menumpuk di bagian yang alirannya melambat.', misi: 'Tempatkan endapan pada lokasi yang paling sesuai.', jawaban: 'Daerah aliran melambat', pengalih: ['Puncak gunung kering', 'Langit', 'Permukaan batu tegak'], urutan: ['Batuan melapuk', 'Material tererosi', 'Material berpindah', 'Material mengendap'] }),
    ],
  },
  {
    id: 'ipas5-b5', nomor: 5, nama: 'Kita Hidup dan Bertumbuh', topik: [
      topik(5, 'A', 'Pernapasan', '🫁', TUBUH, 'pernapasan', ['Breathing Lab'], 'Mengamati jalur udara serta perubahan paru-paru saat menarik dan mengembuskan napas.', ['Oxygen Race', 'Lung Adventure', 'Respiratory Journey', 'Body Rescue', 'Breathing Challenge', 'Oxygen Quest'], { narasi: 'Saat menarik napas, udara masuk melalui hidung dan paru-paru mengembang.', misi: 'Antarkan oksigen melalui jalur pernapasan.', jawaban: 'Hidung → Saluran napas → Paru-paru', pengalih: ['Mulut → Lambung → Paru-paru', 'Telinga → Hidung → Jantung', 'Kulit → Lambung → Paru-paru'], urutan: ['Udara masuk melalui hidung', 'Udara melewati saluran napas', 'Paru-paru mengembang', 'Oksigen digunakan tubuh'] }),
      topik(5, 'B', 'Makan dan Minum', '🥗', TUBUH, 'pencernaan', ['Digestive Journey', 'Nutrition Lab'], 'Menjelajahi jalur pencernaan dan menyusun pilihan makanan bergizi seimbang.', ['Digestive Adventure', 'Healthy Plate Builder', 'Nutrition Hunt', 'Food Sorting Factory', 'Body Energy Race', 'Digestive Maze'], { narasi: 'Sepotong makanan dikunyah sebelum melanjutkan perjalanan di sistem pencernaan.', misi: 'Susun perjalanan makanan dan bangun piring seimbang.', jawaban: 'Mulut → Kerongkongan → Lambung → Usus', pengalih: ['Lambung → Mulut → Usus', 'Paru-paru → Lambung → Mulut', 'Hidung → Usus → Mulut'], urutan: ['Mulut', 'Kerongkongan', 'Lambung', 'Usus'] }),
      topik(5, 'C', 'Tumbuh Besar', '🌱', TUBUH, 'pertumbuhan', ['Growth Journey'], 'Mengamati tahapan pertumbuhan dan pengaruh kebiasaan sehat.', ['Growth Journey', 'Healthy Habit Challenge', 'Human Timeline', 'Growing Up Puzzle', 'Healthy Life Adventure', 'Body Mission'], { narasi: 'Tidur cukup, makan seimbang, dan aktif bergerak membantu pertumbuhan sehat.', misi: 'Susun kebiasaan sehat sepanjang perjalanan pertumbuhan.', jawaban: 'Makan seimbang, aktif bergerak, dan tidur cukup', pengalih: ['Begadang setiap hari', 'Tidak pernah bergerak', 'Hanya makan satu jenis makanan'], urutan: ['Bayi', 'Anak-anak', 'Remaja', 'Dewasa'] }),
    ],
  },
  {
    id: 'ipas5-b6', nomor: 6, nama: 'Indonesiaku Kaya Raya', topik: [
      topik(6, 'A', 'Bentuk Indonesia', '🗺️', SAINS, 'peta', ['Interactive Indonesia Map'], 'Menjelajahi pulau, wilayah, dan perairan Indonesia dengan peta interaktif.', ['Jelajah Nusantara', 'Island Hunt', 'Indonesia Puzzle', 'Map Race', 'Treasure Nusantara', 'Explore Indonesia'], { narasi: 'Indonesia terdiri atas banyak pulau yang dihubungkan oleh perairan.', misi: 'Jelajahi hotspot pulau dan laut pada peta.', jawaban: 'Pulau dan laut saling membentuk wilayah kepulauan', pengalih: ['Indonesia hanya satu pulau', 'Tidak ada perairan di Indonesia', 'Semua wilayah berupa pegunungan'], urutan: ['Pilih wilayah', 'Perbesar peta', 'Buka hotspot', 'Catat cirinya'] }),
      topik(6, 'B', 'Kekayaan Hayati', '🦜', SAINS, 'peta', ['Biodiversity Explorer'], 'Mencocokkan contoh flora dan fauna dengan habitat yang relevan.', ['Biodiversity Hunt', 'Wildlife Rescue', 'Flora Fauna Match', 'Habitat Adventure', 'Biodiversity Explorer', 'Nature Treasure'], { narasi: 'Setiap makhluk hidup memerlukan habitat yang sesuai untuk bertahan.', misi: 'Antarkan flora dan fauna ke habitat yang tepat.', jawaban: 'Makhluk hidup ditempatkan sesuai habitatnya', pengalih: ['Semua hewan hidup di laut', 'Semua tumbuhan hidup di gurun', 'Habitat tidak memengaruhi kehidupan'], urutan: ['Amati organisme', 'Kenali kebutuhannya', 'Pilih habitat', 'Periksa kecocokan'] }),
      topik(6, 'C', 'Kekayaan Alam', '⛏️', SAINS, 'peta', ['Resource Map'], 'Menghubungkan sumber daya, wilayah, pemanfaatan, dan penggunaan berkelanjutan.', ['Resource Hunt', 'Natural Treasure', 'Resource Manager', 'Sustainable Resource', 'Indonesia Explorer', 'Resource Adventure'], { narasi: 'Sumber daya digunakan untuk kebutuhan manusia tetapi perlu dikelola dengan bijak.', misi: 'Tempatkan sumber daya dan pilih pemanfaatan berkelanjutan.', jawaban: 'Gunakan sesuai kebutuhan dan jaga keberlanjutannya', pengalih: ['Ambil tanpa batas', 'Buang sumber daya yang tersisa', 'Abaikan pemulihan lingkungan'], urutan: ['Temukan sumber daya', 'Kenali manfaat', 'Gunakan secukupnya', 'Jaga keberlanjutan'] }),
    ],
  },
  {
    id: 'ipas5-b7', nomor: 7, nama: 'Daerahku Kebanggaanku', topik: [
      topik(7, 'A', 'Budaya Daerah', '🎭', SAINS, 'peta', ['Culture Explorer'], 'Menjelajahi tradisi, seni, budaya, dan produk daerah melalui hotspot.', ['Culture Hunt', 'Festival Nusantara', 'Cultural Memory', 'Culture Puzzle', 'Jelajah Budaya', 'Culture Adventure'], { narasi: 'Tradisi, seni, dan produk daerah menjadi bagian identitas masyarakat.', misi: 'Temukan pasangan budaya dan daerah pada hotspot.', jawaban: 'Budaya dipelajari dan dilestarikan bersama', pengalih: ['Budaya harus dilupakan', 'Semua daerah memiliki budaya sama', 'Produk daerah tidak terkait masyarakat'], urutan: ['Temukan budaya', 'Kenali makna', 'Hargai perbedaan', 'Ikut melestarikan'] }),
      topik(7, 'B', 'Perekonomian Daerah', '🏪', SAINS, 'ekonomi', ['Local Economy'], 'Menjalankan alur barang dari produsen melalui distributor hingga konsumen.', ['Pasar Daerah', 'Economy Builder', 'Producer Race', 'Market Challenge', 'Supply Chain Adventure', 'Mini Market Tycoon EDU'], { narasi: 'Petani menghasilkan sayur, pedagang menyalurkannya, lalu keluarga membelinya.', misi: 'Jalankan alur ekonomi tanpa melewati peran penting.', jawaban: 'Produsen → Distributor → Konsumen', pengalih: ['Konsumen → Produsen → Distributor', 'Distributor → Konsumen → Produsen', 'Produsen → Konsumen → Produsen'], urutan: ['Produsen', 'Distributor', 'Konsumen'] }),
      topik(7, 'C', 'Potensi Daerah', '🏘️', SAINS, 'ekonomi', ['Build My Region'], 'Menggabungkan sumber daya, manusia, budaya, dan produk untuk membangun potensi daerah.', ['Build My Region', 'Produk Unggulan', 'Regional Treasure', 'Daerahku Adventure', 'Regional Builder', 'Economy Strategy EDU'], { narasi: 'Sebuah daerah memiliki kebun buah, warga terampil, dan tradisi membuat pangan olahan.', misi: 'Bangun produk unggulan yang sesuai potensi daerah.', jawaban: 'Olahan buah oleh warga dengan identitas daerah', pengalih: ['Produk tanpa bahan lokal', 'Membuang hasil kebun', 'Mengabaikan keterampilan warga'], urutan: ['Kenali sumber daya', 'Kenali keterampilan', 'Rancang produk', 'Kembangkan manfaat'] }),
    ],
  },
  {
    id: 'ipas5-b8', nomor: 8, nama: 'Bumiku Sayang, Bumiku Malang', topik: [
      topik(8, 'A', 'Bumi Berubah', '🌋', SAINS, 'erosi', ['Earth Event Simulator'], 'Menguji intensitas peristiwa alam dan mengamati dampaknya pada permukaan serta bangunan.', ['Earth Rescue', 'Safe City', 'Earth Defender', 'Natural Event Mission', 'Disaster Preparedness Challenge', 'Earth Adventure'], { narasi: 'Gerakan tanah yang lebih kuat membuat bangunan tidak kokoh berisiko lebih besar.', misi: 'Atur intensitas dan perkuat kota agar dampak berkurang.', jawaban: 'Kurangi risiko dengan bangunan kokoh dan kesiapsiagaan', pengalih: ['Abaikan guncangan', 'Berdiri dekat benda jatuh', 'Memperbesar risiko bangunan'], urutan: ['Kenali bahaya', 'Siapkan perlindungan', 'Jalankan simulasi', 'Evaluasi dampak'] }),
      topik(8, 'B', 'Lingkungan Rusak', '🏭', SAINS, 'kota_hijau', ['Environment Sandbox'], 'Menguji pengaruh sampah, air, vegetasi, dan aktivitas manusia pada kualitas lingkungan.', ['Clean City', 'River Rescue', 'Waste Sorting Factory', 'Forest Defender', 'Eco Patrol', 'Clean Environment Challenge'], { narasi: 'Sampah meningkat dan vegetasi menurun sehingga kualitas lingkungan memburuk.', misi: 'Bersihkan sampah dan pulihkan ruang hijau.', jawaban: 'Kurangi sampah dan tambah vegetasi', pengalih: ['Tambah sampah', 'Kurangi air bersih', 'Hilangkan ruang hijau'], urutan: ['Amati indikator', 'Kurangi sumber masalah', 'Pulihkan lingkungan', 'Pantau perubahan'] }),
      topik(8, 'C', 'Permasalahan Lingkungan', '♻️', SAINS, 'kota_hijau', ['Eco City'], 'Mengelola sampah, air, ruang hijau, dan kegiatan kota agar indikator membaik.', ['Save The Earth', 'Eco City Builder', 'Green Mission', 'Environment Defender', 'Planet Rescue', 'Eco Battle', 'Green City Challenge'], { narasi: 'Kota harus menyeimbangkan kegiatan warga, pengelolaan sampah, air, dan ruang hijau.', misi: 'Capai kota sehat tanpa menghabiskan sumber daya.', jawaban: 'Kelola sampah, air, dan ruang hijau secara seimbang', pengalih: ['Penuhi kota dengan sampah', 'Hilangkan semua taman', 'Biarkan air tercemar'], urutan: ['Kurangi sampah', 'Jaga air', 'Tambah ruang hijau', 'Periksa kualitas kota'] }),
    ],
  },
];

const topikCahaya = BAB_IPAS_KELAS_5[0]?.topik[0];
if (topikCahaya && !topikCahaya.vlab.some((item) => item.nama === 'Shadow Lab')) {
  topikCahaya.vlab.splice(3, 0, {
    id: `${topikCahaya.id}-vlab-shadow-lab`,
    nama: 'Shadow Lab',
    jenis: 'optik',
    tujuan: 'Menyelidiki perubahan ukuran bayangan saat jarak lampu dan benda diubah.',
    petunjuk: 'Geser jarak benda, amati ukuran bayangan real-time, lalu bandingkan hasilnya.',
  });
}

export const SEMUA_TOPIK_IPAS_5 = BAB_IPAS_KELAS_5.flatMap((bab) => bab.topik);
export const SEMUA_VLAB_IPAS_5 = SEMUA_TOPIK_IPAS_5.flatMap((item) => item.vlab);
export const SEMUA_GAME_IPAS_5 = SEMUA_TOPIK_IPAS_5.flatMap((item) => item.game);

export function cariTopikIpas5(topikId: string): TopikIpas | undefined {
  return SEMUA_TOPIK_IPAS_5.find((item) => item.id === topikId);
}

export function cariVlabIpas5(vlabId: string): { topik: TopikIpas; vlab: VlabIpas } | undefined {
  for (const topikItem of SEMUA_TOPIK_IPAS_5) {
    const vlab = topikItem.vlab.find((item) => item.id === vlabId);
    if (vlab) return { topik: topikItem, vlab };
  }
  return undefined;
}

export function topikRelevanUntukTp(tpId: string | null): TopikIpas[] {
  if (!tpId) return [];
  return SEMUA_TOPIK_IPAS_5.filter((item) => item.tpIds.includes(tpId));
}
