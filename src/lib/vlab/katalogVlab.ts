/**
 * Katalog VLAB.
 *
 * Berkas ini hanya menyimpan metadata untuk daftar dan navigasi. Seluruh logika
 * simulasi hidup di modul labnya masing-masing dengan bentuk keadaan, rumus,
 * dan keluaran yang berbeda — tidak ada satu pun engine yang dipakai bersama.
 */

export type KodeVlab =
  | 'light-ray'
  | 'mirror'
  | 'material'
  | 'shadow'
  | 'refraction'
  | 'color-light'
  | 'sound'
  | 'food-chain'
  | 'magnet'
  | 'circuit'
  | 'erosion'
  | 'breathing'
  | 'environment';

export type RumpunVlab = 'cahaya' | 'bunyi' | 'listrik_magnet' | 'makhluk_hidup' | 'bumi';

export interface ProfilVlab {
  kode: KodeVlab;
  nama: string;
  /** Tujuan percobaan — berbeda untuk setiap lab. */
  tujuan: string;
  rumpun: RumpunVlab;
  /** Alat yang dipakai di panggung lab ini. */
  alat: string[];
  /** Variabel yang dapat diubah siswa. */
  variabel: string[];
  /** Besaran yang diamati sebagai hasil. */
  keluaran: string[];
  petunjuk: string;
  ikon: string;
  warna: string;
}

export const LABEL_RUMPUN: Record<RumpunVlab, string> = {
  cahaya: 'Cahaya & Optik',
  bunyi: 'Bunyi & Getaran',
  listrik_magnet: 'Listrik & Magnet',
  makhluk_hidup: 'Makhluk Hidup',
  bumi: 'Bumi & Lingkungan',
};

export const KATALOG_VLAB: readonly ProfilVlab[] = [
  {
    kode: 'light-ray',
    nama: 'Light Ray Lab',
    tujuan: 'Membuktikan bahwa cahaya merambat lurus.',
    rumpun: 'cahaya',
    alat: ['Senter', 'Tiga papan berlubang', 'Layar target'],
    variabel: ['Tinggi senter', 'Tinggi lubang tiap papan', 'Jarak papan'],
    keluaran: ['Lintasan berkas', 'Papan penghalang', 'Cahaya sampai layar atau tidak'],
    petunjuk: 'Geser lubang setiap papan sampai ketiganya segaris dengan senter.',
    ikon: '🔦',
    warna: '#F6C445',
  },
  {
    kode: 'mirror',
    nama: 'Mirror Lab',
    tujuan: 'Mempelajari pemantulan cahaya pada cermin datar.',
    rumpun: 'cahaya',
    alat: ['Laser', 'Cermin datar berputar', 'Target'],
    variabel: ['Sudut cermin', 'Posisi laser', 'Posisi target'],
    keluaran: ['Sudut datang', 'Sudut pantul', 'Arah sinar pantul', 'Kena target'],
    petunjuk: 'Putar cermin sampai sinar pantul mengenai lingkaran target.',
    ikon: '🪞',
    warna: '#5AA9E6',
  },
  {
    kode: 'material',
    nama: 'Material Lab',
    tujuan: 'Membedakan bahan transparan, translusen, dan opak.',
    rumpun: 'cahaya',
    alat: ['Lampu sumber', 'Baki bahan', 'Sensor cahaya'],
    variabel: ['Jenis bahan', 'Ketebalan bahan', 'Daya lampu'],
    keluaran: ['Bacaan sensor', 'Persen cahaya diteruskan', 'Golongan bahan'],
    petunjuk: 'Letakkan bahan pada baki dan bandingkan bacaan sensor di belakangnya.',
    ikon: '🧊',
    warna: '#7BC9A6',
  },
  {
    kode: 'shadow',
    nama: 'Shadow Lab',
    tujuan: 'Menyelidiki perubahan ukuran dan ketajaman bayangan.',
    rumpun: 'cahaya',
    alat: ['Lampu', 'Objek buram', 'Layar'],
    variabel: ['Posisi lampu', 'Posisi objek', 'Posisi layar', 'Diameter lampu'],
    keluaran: ['Tinggi bayangan gelap', 'Lebar tepi kabur', 'Perbesaran'],
    petunjuk: 'Geser objek mendekat dan menjauh dari lampu, amati bayangannya.',
    ikon: '🌗',
    warna: '#8C7BE0',
  },
  {
    kode: 'refraction',
    nama: 'Refraction Lab',
    tujuan: 'Menyelidiki pembiasan cahaya antara dua medium.',
    rumpun: 'cahaya',
    alat: ['Laser tipis', 'Bak dua medium', 'Busur derajat'],
    variabel: ['Sudut datang', 'Medium atas', 'Medium bawah'],
    keluaran: ['Sudut bias', 'Arah pembelokan', 'Sudut kritis'],
    petunjuk: 'Ubah sudut datang dan bandingkan sudut bias pada tiap medium.',
    ikon: '💧',
    warna: '#4FB0C6',
  },
  {
    kode: 'color-light',
    nama: 'Color Light Lab',
    tujuan: 'Mengeksplorasi pencampuran warna cahaya.',
    rumpun: 'cahaya',
    alat: ['Tiga lampu sorot RGB', 'Tapis warna', 'Layar putih'],
    variabel: ['Nyala tiap lampu', 'Intensitas tiap lampu', 'Tapis warna'],
    keluaran: ['Warna layar', 'Nilai RGB', 'Kecerahan'],
    petunjuk: 'Nyalakan dua atau tiga lampu sekaligus lalu amati warna layar.',
    ikon: '🎨',
    warna: '#E8618C',
  },
  {
    kode: 'sound',
    nama: 'Sound Lab',
    tujuan: 'Menyelidiki frekuensi, amplitudo, dan medium perambatan bunyi.',
    rumpun: 'bunyi',
    alat: ['Sumber getar', 'Tabung medium', 'Penerima bunyi'],
    variabel: ['Frekuensi', 'Amplitudo', 'Medium', 'Jarak penerima'],
    keluaran: ['Bentuk gelombang', 'Cepat rambat', 'Panjang gelombang', 'Terdengar atau tidak'],
    petunjuk: 'Ganti medium menjadi ruang hampa dan perhatikan apa yang terjadi.',
    ikon: '🔊',
    warna: '#F08A5D',
  },
  {
    kode: 'food-chain',
    nama: 'Food Chain Lab',
    tujuan: 'Menyelidiki hubungan makan dan keseimbangan populasi.',
    rumpun: 'makhluk_hidup',
    alat: ['Petak ekosistem', 'Kartu organisme', 'Grafik populasi'],
    variabel: ['Populasi awal', 'Organisme yang dihilangkan', 'Jumlah musim'],
    keluaran: ['Grafik populasi tiap musim', 'Organisme punah', 'Status ekosistem'],
    petunjuk: 'Hilangkan satu organisme, jalankan simulasi, lalu amati rantai makanannya.',
    ikon: '🌿',
    warna: '#6FBF73',
  },
  {
    kode: 'magnet',
    nama: 'Magnet Lab',
    tujuan: 'Menyelidiki gaya tarik dan tolak kutub magnet.',
    rumpun: 'listrik_magnet',
    alat: ['Dua magnet batang', 'Penggaris jarak', 'Kotak bahan uji'],
    variabel: ['Kutub yang berhadapan', 'Jarak magnet', 'Kekuatan magnet', 'Bahan uji'],
    keluaran: ['Arah gaya', 'Besar gaya', 'Bahan tertarik atau tidak'],
    petunjuk: 'Balik salah satu kutub dan rasakan perubahan arah gayanya.',
    ikon: '🧲',
    warna: '#E05C5C',
  },
  {
    kode: 'circuit',
    nama: 'Circuit Lab',
    tujuan: 'Membandingkan rangkaian listrik seri dan paralel.',
    rumpun: 'listrik_magnet',
    alat: ['Baterai', 'Kabel', 'Saklar', 'Lampu'],
    variabel: ['Jumlah baterai', 'Jumlah lampu', 'Susunan rangkaian', 'Saklar'],
    keluaran: ['Arus', 'Daya tiap lampu', 'Terang tiap lampu'],
    petunjuk: 'Putuskan satu lampu pada rangkaian seri lalu ulangi pada paralel.',
    ikon: '💡',
    warna: '#F2B138',
  },
  {
    kode: 'erosion',
    nama: 'Erosion Lab',
    tujuan: 'Menyelidiki penyebab erosi tanah.',
    rumpun: 'bumi',
    alat: ['Bak tanah miring', 'Penyiram hujan', 'Penampung air'],
    variabel: ['Curah hujan', 'Kemiringan lereng', 'Tutupan vegetasi', 'Jenis tanah'],
    keluaran: ['Limpasan air', 'Tanah terkikis', 'Kekeruhan air'],
    petunjuk: 'Naikkan tutupan vegetasi dan bandingkan kekeruhan air tampungan.',
    ikon: '⛰️',
    warna: '#B98A5A',
  },
  {
    kode: 'breathing',
    nama: 'Breathing Lab',
    tujuan: 'Mempelajari mekanisme pernapasan dan kecukupan oksigen.',
    rumpun: 'makhluk_hidup',
    alat: ['Model dada berdiafragma', 'Paru-paru', 'Saluran napas'],
    variabel: ['Volume tidal', 'Frekuensi napas', 'Aktivitas tubuh', 'Penyempitan saluran'],
    keluaran: ['Ventilasi semenit', 'Ventilasi alveolar', 'Kecukupan oksigen'],
    petunjuk: 'Pilih aktivitas berlari lalu sesuaikan napas sampai oksigen cukup.',
    ikon: '🫁',
    warna: '#EA7B9B',
  },
  {
    kode: 'environment',
    nama: 'Environment Lab',
    tujuan: 'Menilai dampak perilaku manusia pada kualitas lingkungan.',
    rumpun: 'bumi',
    alat: ['Peta desa', 'Sungai', 'Tempat sampah', 'Pepohonan'],
    variabel: ['Sampah harian', 'Cakupan pengelolaan', 'Jumlah pohon', 'Limbah cair', 'Kendaraan'],
    keluaran: ['Indeks air', 'Indeks udara', 'Indeks tanah', 'Skor lingkungan'],
    petunjuk: 'Naikkan cakupan pengelolaan sampah lalu amati indeks air sungai.',
    ikon: '🏞️',
    warna: '#4FA3A5',
  },
];

export function profilVlab(kode: string): ProfilVlab | undefined {
  return KATALOG_VLAB.find((profil) => profil.kode === kode);
}
