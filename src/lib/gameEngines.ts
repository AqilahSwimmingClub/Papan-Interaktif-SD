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
