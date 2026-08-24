import type {
  ButirGame,
  DukunganFaseGame,
  GameEngine,
  JawabanButirGame,
  KodeFase,
  MekanikGame,
  ModePermainanGame,
  ProfilFaseGame,
  RingkasanPermainan,
} from './types';

const SEMUA_MAPEL = ['*'];
const SENI = ['SMUS', 'RUPA', 'TARI', 'TEATER'];
const AGAMA = ['PAI', 'PAK', 'PAKat', 'PAH', 'PAB', 'PAKh'];

type TandaFase = 'Y' | 'O' | 'N';

function dukungan(tanda: TandaFase): DukunganFaseGame {
  if (tanda === 'Y') return 'cocok';
  if (tanda === 'O') return 'disederhanakan';
  return 'tidak';
}

function buatEngine(
  kode: string,
  nama: string,
  yangDiukur: string,
  mode: ModePermainanGame[],
  tanda: [TandaFase, TandaFase, TandaFase],
  mapel: string[],
  kataKerja: string[],
  mekanik: MekanikGame,
  petunjuk: string,
): GameEngine {
  const dukunganFase = {
    A: dukungan(tanda[0]),
    B: dukungan(tanda[1]),
    C: dukungan(tanda[2]),
  } satisfies Record<KodeFase, DukunganFaseGame>;
  return {
    kode,
    nama,
    yang_diukur: yangDiukur,
    mode_didukung: mode,
    fase_didukung: (['A', 'B', 'C'] as const).filter(
      (fase) => dukunganFase[fase] !== 'tidak',
    ),
    dukungan_fase: dukunganFase,
    mapel_cocok: mapel,
    kata_kerja_tp: kataKerja,
    mekanik,
    petunjuk,
  };
}

/** Pustaka final Tahap 7. Isi game tetap datang dari CP/TP/materi, bukan dari engine. */
export const GAME_ENGINE_FINAL: readonly GameEngine[] = [
  buatEngine('pilihan-ganda', 'Pilihan ganda', 'Pemahaman konsep, pengenalan istilah', ['individu', 'seluruh_kelas'], ['Y', 'Y', 'Y'], SEMUA_MAPEL, ['*'], 'pilihan', 'Pilih satu jawaban yang paling tepat.'),
  buatEngine('benar-salah', 'Benar/salah', 'Ketepatan pernyataan, miskonsepsi', ['seluruh_kelas', 'battle'], ['Y', 'Y', 'Y'], SEMUA_MAPEL, ['menilai', 'menentukan', 'mengidentifikasi', '*'], 'benar_salah', 'Tentukan apakah pernyataan sesuai konteks TP.'),
  buatEngine('kuis-cepat', 'Kuis cepat', 'Kelancaran setelah konsep dipahami', ['individu', 'battle'], ['O', 'Y', 'Y'], SEMUA_MAPEL, ['menjawab', 'menghitung', 'menyebutkan', '*'], 'pilihan', 'Jawab bergiliran sesuai profil waktu fase.'),
  buatEngine('jodohkan', 'Jodohkan', 'Mengenali hubungan dan kesetaraan', ['kelompok', 'individu'], ['Y', 'Y', 'Y'], ['MAT', 'BI', 'IPAS', 'BING'], ['mengenali', 'menghubungkan', 'membandingkan', 'memadankan'], 'pasangan', 'Pilih pasangan yang saling berhubungan.'),
  buatEngine('drag-drop', 'Drag & drop', 'Menempatkan pada kategori yang tepat', ['individu', 'kelompok'], ['Y', 'Y', 'Y'], SEMUA_MAPEL, ['menempatkan', 'mengelompokkan', 'mengklasifikasi', '*'], 'klasifikasi', 'Tempatkan pilihan pada jawaban yang sesuai.'),
  buatEngine('susun-urutan', 'Susun urutan', 'Mengurutkan berdasarkan kriteria', ['individu', 'kelompok'], ['O', 'Y', 'Y'], ['MAT', 'IPAS', 'BI'], ['mengurutkan', 'menyusun', 'tahapan', 'urutan'], 'urutan', 'Susun pilihan menurut urutan yang diminta.'),
  buatEngine('isi-rumpang', 'Isi rumpang', 'Melengkapi pola atau kalimat', ['individu'], ['O', 'Y', 'Y'], ['BI', 'MAT', 'BING'], ['melengkapi', 'menulis', 'menentukan', 'mengisi'], 'pilihan', 'Lengkapi bagian yang kosong.'),
  buatEngine('memory-card', 'Memory card', 'Mengingat pasangan, daya ingat', ['seluruh_kelas', 'kelompok'], ['Y', 'Y', 'Y'], SEMUA_MAPEL, ['mengenali', 'mengingat', 'memadankan', '*'], 'pasangan', 'Buka kartu dan temukan pasangannya.'),
  buatEngine('tebak-gambar', 'Tebak gambar', 'Mengenali objek dan istilah visual', ['seluruh_kelas', 'individu'], ['Y', 'Y', 'Y'], ['IPAS', 'BI', 'BING', ...SENI], ['mengenali', 'mengamati', 'mengidentifikasi', 'menyebutkan'], 'pilihan', 'Amati petunjuk visual lalu pilih jawaban.'),
  buatEngine('tebak-kata', 'Tebak kata', 'Kosakata dan ejaan', ['kelompok', 'seluruh_kelas'], ['Y', 'Y', 'Y'], ['BI', 'BING'], ['membaca', 'menulis', 'mengeja', 'kosakata'], 'pilihan', 'Temukan kata berdasarkan petunjuk.'),
  buatEngine('susun-kata', 'Susun kata', 'Struktur kata dan kalimat', ['individu', 'kelompok'], ['O', 'Y', 'Y'], ['BI', 'BING'], ['menyusun', 'menulis', 'membentuk', 'kalimat'], 'urutan', 'Susun kata menjadi bentuk yang tepat.'),
  buatEngine('puzzle', 'Puzzle', 'Bagian dan keseluruhan, keruangan', ['individu', 'kelompok'], ['Y', 'Y', 'Y'], ['MAT', 'IPAS', ...SENI], ['menyusun', 'membentuk', 'menghubungkan', 'mengamati'], 'pasangan', 'Satukan bagian yang membentuk konsep utuh.'),
  buatEngine('maze-labirin', 'Maze / labirin', 'Perencanaan langkah, arah', ['individu'], ['O', 'Y', 'Y'], ['MAT', 'IPAS', 'KKA'], ['menentukan', 'menelusuri', 'merencanakan', 'arah'], 'urutan', 'Pilih langkah yang membawa ke tujuan.'),
  buatEngine('roda-tantangan', 'Roda tantangan', 'Pengulangan acak, seluruh kelas aktif', ['seluruh_kelas'], ['Y', 'Y', 'Y'], SEMUA_MAPEL, ['*'], 'papan', 'Putar tantangan dan jawab butir yang terpilih.'),
  buatEngine('bingo-edukasi', 'Bingo edukasi', 'Pengenalan cepat dalam kelompok besar', ['seluruh_kelas'], ['Y', 'Y', 'Y'], ['MAT', 'BI', 'IPAS'], ['mengenali', 'menyebutkan', 'mengidentifikasi'], 'papan', 'Tandai jawaban sampai membentuk satu garis.'),
  buatEngine('balap-soal', 'Balap soal', 'Kelancaran berwaktu', ['battle', 'kelompok'], ['N', 'Y', 'Y'], ['MAT', 'BI'], ['menghitung', 'menjawab', 'menentukan', 'memecahkan'], 'pilihan', 'Kelompok memperoleh poin dari jawaban tepat.'),
  buatEngine('battle-kelompok', 'Battle kelompok', 'Kerja sama dan strategi kelompok', ['battle'], ['N', 'Y', 'Y'], SEMUA_MAPEL, ['menganalisis', 'memecahkan', 'menentukan', '*'], 'papan', 'Kelompok bergiliran menyelesaikan butir.'),
  buatEngine('siapa-cepat', 'Siapa cepat', 'Reaksi dan penguasaan hafalan', ['seluruh_kelas', 'battle'], ['O', 'Y', 'Y'], ['MAT', 'BI', 'IPAS'], ['menyebutkan', 'mengenali', 'menghitung', 'mengidentifikasi'], 'pilihan', 'Jawab setelah guru membuka butir.'),
  buatEngine('sorting', 'Sorting', 'Mengurutkan menurut aturan', ['individu', 'kelompok'], ['O', 'Y', 'Y'], ['MAT', 'IPAS'], ['mengurutkan', 'menyusun', 'membandingkan'], 'urutan', 'Atur pilihan berdasarkan kriteria.'),
  buatEngine('klasifikasi', 'Klasifikasi', 'Menggolongkan berdasarkan ciri', ['kelompok', 'individu'], ['O', 'Y', 'Y'], ['IPAS', 'PP', 'MAT'], ['mengelompokkan', 'menggolongkan', 'mengklasifikasi', 'membedakan'], 'klasifikasi', 'Pilih kategori yang sesuai dengan cirinya.'),
  buatEngine('timeline', 'Timeline', 'Urutan peristiwa dan sebab akibat', ['kelompok'], ['N', 'O', 'Y'], ['IPAS', 'PP', ...AGAMA], ['mengurutkan', 'menceritakan', 'menjelaskan', 'sebab'], 'urutan', 'Susun peristiwa atau proses secara runtut.'),
  buatEngine('simulasi', 'Simulasi', 'Keputusan berdampak, sistem', ['kelompok'], ['N', 'N', 'Y'], ['IPAS', 'PP', 'KKA'], ['menganalisis', 'memutuskan', 'mengevaluasi', 'merancang'], 'simulasi', 'Pilih keputusan dan amati akibatnya.'),
  buatEngine('eksplorasi-gambar', 'Eksplorasi gambar', 'Menemukan detail pada gambar besar', ['seluruh_kelas', 'kelompok'], ['Y', 'Y', 'Y'], ['IPAS', 'BI', ...SENI], ['mengamati', 'menemukan', 'mengenali', 'mengidentifikasi'], 'papan', 'Temukan detail yang sesuai dengan petunjuk.'),
  buatEngine('matematika-cepat', 'Matematika cepat', 'Kelancaran hitung', ['individu', 'battle'], ['O', 'Y', 'Y'], ['MAT'], ['menghitung', 'menjumlahkan', 'mengurangkan', 'mengalikan', 'membagi'], 'pilihan', 'Selesaikan perhitungan sesuai profil waktu fase.'),
  buatEngine('soal-cerita-interaktif', 'Soal cerita interaktif', 'Penalaran bertahap, HOTS', ['individu', 'kelompok'], ['N', 'O', 'Y'], ['MAT', 'BI', 'IPAS'], ['memecahkan', 'menganalisis', 'menalar', 'menerapkan'], 'simulasi', 'Selesaikan persoalan tahap demi tahap.'),
  buatEngine('coding-blocks', 'Coding blocks', 'Urutan perintah dan pengulangan', ['individu', 'kelompok'], ['N', 'N', 'Y'], ['KKA'], ['menyusun', 'memprogram', 'algoritma', 'perintah'], 'urutan', 'Susun blok perintah menjadi algoritma.'),
  buatEngine('debugging-challenge', 'Debugging challenge', 'Menemukan dan memperbaiki kesalahan', ['kelompok'], ['N', 'N', 'Y'], ['KKA'], ['menemukan', 'memperbaiki', 'menguji', 'debug'], 'simulasi', 'Temukan kesalahan lalu pilih perbaikannya.'),
  buatEngine('pattern-recognition', 'Pattern recognition', 'Menemukan pola dan aturan', ['individu'], ['O', 'Y', 'Y'], ['MAT', 'KKA', ...SENI], ['menemukan', 'mengenali', 'melanjutkan', 'pola'], 'pilihan', 'Temukan aturan yang membentuk pola.'),
  buatEngine('peta-interaktif', 'Peta interaktif', 'Letak dan hubungan keruangan', ['kelompok', 'seluruh_kelas'], ['N', 'O', 'Y'], ['IPAS', 'PP'], ['menentukan', 'menunjukkan', 'memetakan', 'letak'], 'simulasi', 'Pilih lokasi atau hubungan ruang yang tepat.'),
  buatEngine('kartu-peran', 'Kartu peran', 'Sikap, dialog, dan pembiasaan', ['kelompok'], ['O', 'Y', 'Y'], ['PP', 'BI', ...AGAMA, ...SENI], ['mempraktikkan', 'menunjukkan', 'menceritakan', 'berdialog'], 'simulasi', 'Mainkan peran sesuai situasi pada kartu.'),
  buatEngine('garis-bilangan', 'Lompatan Garis Bilangan', 'Urutan dan operasi bilangan', ['individu', 'seluruh_kelas'], ['Y','Y','Y'], ['MAT'], ['menghitung','membandingkan','menentukan'], 'urutan', 'Pilih lompatan yang mencapai hasil tepat.'),
  buatEngine('pasar-pecahan', 'Pasar Pecahan', 'Kesetaraan pecahan dalam konteks jual beli', ['kelompok','individu'], ['N','Y','Y'], ['MAT'], ['membandingkan','menentukan','memecahkan'], 'simulasi', 'Pilih pecahan barang atau uang yang setara.'),
  buatEngine('bangun-geometri', 'Bengkel Bangun', 'Ciri, komposisi, dan dekomposisi bangun', ['kelompok','individu'], ['Y','Y','Y'], ['MAT'], ['membentuk','mengidentifikasi','menganalisis'], 'pasangan', 'Padankan ciri dengan bangun yang tepat.'),
  buatEngine('laboratorium-ukur', 'Laboratorium Ukur', 'Pemilihan satuan dan alat ukur', ['kelompok','individu'], ['Y','Y','Y'], ['MAT','IPAS'], ['mengukur','membandingkan','menentukan'], 'simulasi', 'Tentukan alat, satuan, atau hasil pengukuran.'),
  buatEngine('misi-soal-cerita', 'Misi Soal Cerita', 'Pemodelan matematika kontekstual', ['kelompok','individu'], ['N','O','Y'], ['MAT'], ['memecahkan','menalar','menerapkan'], 'simulasi', 'Pilih informasi dan operasi untuk menuntaskan misi.'),
  buatEngine('perakit-kalimat', 'Perakit Kalimat', 'Struktur kalimat dan kohesi', ['individu','kelompok'], ['O','Y','Y'], ['BI','BING'], ['menyusun','menulis','memperbaiki'], 'urutan', 'Susun bagian menjadi kalimat yang jelas.'),
  buatEngine('detektif-bacaan', 'Detektif Bacaan', 'Informasi tersurat, tersirat, dan bukti teks', ['individu','kelompok'], ['O','Y','Y'], ['BI','BING'], ['membaca','menemukan','menyimpulkan','menganalisis'], 'pilihan', 'Temukan bukti bacaan yang mendukung jawaban.'),
  buatEngine('rantai-kosakata', 'Rantai Kosakata', 'Makna, sinonim, antonim, dan relasi kata', ['kelompok','seluruh_kelas'], ['Y','Y','Y'], ['BI','BING'], ['mengenali','menghubungkan','memaknai'], 'pasangan', 'Sambungkan kata dengan relasi maknanya.'),
  buatEngine('simak-dan-pilih', 'Simak dan Pilih', 'Pemahaman pesan lisan', ['individu','seluruh_kelas'], ['Y','Y','Y'], ['BI','BING'], ['menyimak','menentukan','menceritakan'], 'pilihan', 'Dengarkan petunjuk yang dibacakan lalu pilih respons.'),
  buatEngine('panggung-argumen', 'Panggung Argumen', 'Alasan, bukti, dan komunikasi santun', ['kelompok'], ['N','O','Y'], ['BI','PP'], ['berpendapat','menjelaskan','mengevaluasi'], 'simulasi', 'Pilih alasan dan bukti yang paling kuat serta santun.'),
  buatEngine('jaring-ekosistem', 'Jaring Ekosistem', 'Hubungan komponen dan aliran energi', ['kelompok','seluruh_kelas'], ['N','Y','Y'], ['IPAS'], ['menghubungkan','menganalisis','menjelaskan'], 'pasangan', 'Bangun hubungan antarkomponen ekosistem.'),
  buatEngine('uji-hipotesis', 'Uji Hipotesis', 'Variabel, prediksi, bukti, dan kesimpulan', ['kelompok'], ['N','Y','Y'], ['IPAS'], ['mengamati','memprediksi','menyimpulkan','menguji'], 'simulasi', 'Pilih rancangan atau kesimpulan sesuai bukti.'),
  buatEngine('roda-siklus', 'Roda Siklus', 'Tahapan proses berulang', ['kelompok','individu'], ['O','Y','Y'], ['IPAS'], ['mengurutkan','menjelaskan','mengidentifikasi'], 'urutan', 'Susun tahap proses sampai siklus lengkap.'),
  buatEngine('misi-tubuh-sehat', 'Misi Tubuh Sehat', 'Fungsi tubuh dan kebiasaan sehat', ['individu','seluruh_kelas'], ['Y','Y','Y'], ['IPAS','PJOK'], ['mengidentifikasi','menjelaskan','mempraktikkan'], 'klasifikasi', 'Kelompokkan kebiasaan atau bagian tubuh sesuai fungsinya.'),
  buatEngine('rantai-sebab-akibat', 'Rantai Sebab Akibat', 'Hubungan perubahan dan dampaknya', ['kelompok','individu'], ['N','Y','Y'], ['IPAS','PP'], ['menjelaskan','menganalisis','menyimpulkan'], 'urutan', 'Rangkai sebab, proses, dan akibat secara logis.'),
  buatEngine('vocabulary-quest', 'Vocabulary Quest', 'Kosakata Bahasa Inggris kontekstual', ['individu','kelompok'], ['Y','Y','Y'], ['BING'], ['mengenali','menyebutkan','menggunakan'], 'pasangan', 'Padankan kata, gambar, dan makna dalam konteks.'),
  buatEngine('spelling-bee', 'Spelling Bee Kelas', 'Ejaan dan bunyi kata Bahasa Inggris', ['seluruh_kelas','battle'], ['O','Y','Y'], ['BING'], ['mengeja','menulis','mengucapkan'], 'pilihan', 'Pilih ejaan yang sesuai dengan kata yang dibacakan.'),
  buatEngine('dialogue-path', 'Dialogue Path', 'Respons percakapan sesuai situasi', ['kelompok','individu'], ['O','Y','Y'], ['BING'], ['berdialog','merespons','menggunakan'], 'simulasi', 'Pilih respons untuk melanjutkan dialog secara tepat.'),
  buatEngine('musyawarah-kelas', 'Musyawarah Kelas', 'Proses demokratis dan keputusan bersama', ['kelompok','seluruh_kelas'], ['O','Y','Y'], ['PP'], ['mempraktikkan','menentukan','menjelaskan'], 'simulasi', 'Tentukan langkah musyawarah dan keputusan yang adil.'),
  buatEngine('hak-dan-tanggung-jawab', 'Hak dan Tanggung Jawab', 'Keseimbangan hak, kewajiban, dan aturan', ['individu','kelompok'], ['Y','Y','Y'], ['PP'], ['mengidentifikasi','membedakan','menerapkan'], 'klasifikasi', 'Kelompokkan situasi sebagai hak, kewajiban, atau aturan.'),
  buatEngine('kompas-nilai', 'Kompas Nilai', 'Pilihan tindakan berdasarkan nilai Pancasila', ['kelompok','individu'], ['Y','Y','Y'], ['PP',...AGAMA], ['menunjukkan','menerapkan','menilai'], 'simulasi', 'Pilih tindakan yang paling sesuai nilai pada situasi.'),
  buatEngine('rute-algoritma', 'Rute Algoritma', 'Dekomposisi dan urutan instruksi', ['individu','kelompok'], ['N','N','Y'], ['KKA'], ['menyusun','merancang','algoritma'], 'urutan', 'Susun instruksi agar tokoh mencapai tujuan.'),
  buatEngine('mesin-data', 'Mesin Data', 'Representasi, pola, dan klasifikasi data', ['kelompok','individu'], ['N','N','Y'], ['KKA','MAT'], ['mengelompokkan','menganalisis','merepresentasikan'], 'klasifikasi', 'Masukkan data ke kategori atau representasi yang tepat.'),
  buatEngine('dilema-ai', 'Dilema AI Aman', 'Etika, privasi, dan verifikasi keluaran AI', ['kelompok'], ['N','N','Y'], ['KKA'], ['menilai','mengevaluasi','memutuskan'], 'simulasi', 'Pilih tindakan aman saat menggunakan sistem AI.'),
  buatEngine('sirkuit-gerak', 'Sirkuit Gerak', 'Urutan dan ketepatan gerak dasar', ['kelompok','seluruh_kelas'], ['Y','Y','Y'], ['PJOK'], ['mempraktikkan','melakukan','mengombinasikan'], 'urutan', 'Ikuti atau susun urutan gerak yang aman.'),
  buatEngine('pilih-gerak-aman', 'Pilih Gerak Aman', 'Keselamatan, pemanasan, dan kebugaran', ['individu','seluruh_kelas'], ['Y','Y','Y'], ['PJOK'], ['menentukan','menerapkan','menjelaskan'], 'klasifikasi', 'Pilih gerak dan kebiasaan yang aman untuk situasi.'),
  buatEngine('pola-irama', 'Studio Pola Irama', 'Pola bunyi, tempo, dan dinamika', ['kelompok','seluruh_kelas'], ['Y','Y','Y'], ['SMUS'], ['menirukan','menciptakan','membedakan'], 'urutan', 'Susun pola bunyi atau irama sesuai petunjuk.'),
  buatEngine('galeri-warna-bentuk', 'Galeri Warna dan Bentuk', 'Unsur rupa dan pilihan visual', ['individu','kelompok'], ['Y','Y','Y'], ['RUPA'], ['mengamati','membedakan','menciptakan'], 'klasifikasi', 'Kelompokkan karya menurut unsur rupa yang tampak.'),
  buatEngine('panggung-ekspresi', 'Panggung Ekspresi', 'Gerak, ekspresi, ruang, dan peran', ['kelompok','seluruh_kelas'], ['Y','Y','Y'], ['TARI','TEATER'], ['mempraktikkan','mengekspresikan','menciptakan'], 'simulasi', 'Pilih ekspresi atau gerak yang sesuai adegan.'),
  buatEngine('jejak-keteladanan', 'Jejak Keteladanan', 'Nilai, kisah, ibadah, dan perilaku baik', ['kelompok','individu'], ['Y','Y','Y'], AGAMA, ['menceritakan','meneladani','mempraktikkan','memahami'], 'urutan', 'Susun peristiwa atau pilih keteladanan sesuai TP agama aktif.'),
];

export const PROFIL_FASE_GAME: Record<KodeFase, ProfilFaseGame> = {
  A: { fase_kode: 'A', jumlah_pilihan: 2, ukuran_kartu_min: 200, detik_per_butir: null, jumlah_butir_maks: 8, bacakan_wajib: true, peringkat: 'tidak_ada' },
  B: { fase_kode: 'B', jumlah_pilihan: 4, ukuran_kartu_min: 150, detik_per_butir: 20, jumlah_butir_maks: 10, bacakan_wajib: false, peringkat: 'kelompok' },
  C: { fase_kode: 'C', jumlah_pilihan: 5, ukuran_kartu_min: 120, detik_per_butir: 25, jumlah_butir_maks: 15, bacakan_wajib: false, peringkat: 'tiga_teratas_kelas' },
};

export interface KonteksPenyaringanEngine {
  fase_kode: KodeFase;
  mapel_kode: string;
  teks_tp: string;
  mode_permainan?: ModePermainanGame;
  jumlah_siswa?: number;
  jumlah_kelompok?: number;
  perangkat_siswa?: number;
}

function normalisasi(teks: string): string {
  return teks.toLocaleLowerCase('id').normalize('NFKD').replace(/[^a-z0-9\s]/g, ' ');
}

/** Empat penyaring Tahap 7: fase, mapel, kata kerja TP, lalu konteks kelas. */
export function saringEngineGame(
  konteks: KonteksPenyaringanEngine,
  daftar: readonly GameEngine[] = GAME_ENGINE_FINAL,
): GameEngine[] {
  const teksTp = normalisasi(konteks.teks_tp);
  const sesuaiFase = daftar.filter(
    (engine) => engine.dukungan_fase[konteks.fase_kode] !== 'tidak',
  );
  const sesuaiMapel = sesuaiFase.filter(
    (engine) => engine.mapel_cocok.includes('*') || engine.mapel_cocok.includes(konteks.mapel_kode),
  );
  const sesuaiKata = sesuaiMapel.filter(
    (engine) =>
      engine.kata_kerja_tp.includes('*') ||
      engine.kata_kerja_tp.some((kata) => teksTp.includes(normalisasi(kata))),
  );
  const kandidat = sesuaiKata.length >= 6 ? sesuaiKata : sesuaiMapel;
  const terapkanKonteks = (sumber: GameEngine[]) => sumber
    .filter((engine) =>
      konteks.mode_permainan ? engine.mode_didukung.includes(konteks.mode_permainan) : true,
    )
    .filter(() =>
      konteks.mode_permainan === 'battle' && (konteks.jumlah_kelompok ?? 2) < 2
        ? false
        : true,
    )
    .filter((engine) =>
      konteks.mode_permainan === 'individu' && (konteks.perangkat_siswa ?? 1) < 1
        ? engine.mode_didukung.some((mode) => mode !== 'individu')
        : true,
    );
  const tersaring = terapkanKonteks(kandidat);
  const denganMinimum = tersaring.length >= 6 ? tersaring : terapkanKonteks(sesuaiMapel);
  return denganMinimum.sort((a, b) => {
      const cocokA = a.kata_kerja_tp.some((kata) => kata !== '*' && teksTp.includes(normalisasi(kata)));
      const cocokB = b.kata_kerja_tp.some((kata) => kata !== '*' && teksTp.includes(normalisasi(kata)));
      return Number(cocokB) - Number(cocokA) || a.nama.localeCompare(b.nama, 'id');
    });
}

export function nilaiJawabanGame(butir: ButirGame, jawaban: string): JawabanButirGame {
  const benar = normalisasi(jawaban) === normalisasi(butir.jawaban);
  return { butir_id: butir.id, jawaban, benar, skor: benar ? 10 : 0 };
}

export function ringkasPermainan(jawaban: JawabanButirGame[]): RingkasanPermainan {
  return {
    skor: jawaban.reduce((jumlah, item) => jumlah + item.skor, 0),
    skor_maksimal: jawaban.length * 10,
    jawaban,
  };
}
