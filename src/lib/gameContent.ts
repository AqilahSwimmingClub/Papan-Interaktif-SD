import { ikonGameplay, tipeGameplayEngine } from './gameplay';
import type { ButirGame, GameEngine, TipeGameplay } from './types';

export interface KonteksKontenGame {
  tpId: string;
  tingkatKelas: number;
  mapelKode: string;
  mapelNama: string;
  teksCp: string;
  teksElemen: string;
  teksTp: string;
  materi: string[];
  tpSerumpun: string[];
}

const KATA_UMUM = new Set([
  'agar', 'akan', 'atau', 'bagi', 'dalam', 'dapat', 'dan', 'dengan', 'dari', 'di',
  'ini', 'itu', 'ke', 'melalui', 'mengenai', 'murid', 'pada', 'peserta', 'serta',
  'sesuai', 'siswa', 'suatu', 'tentang', 'untuk', 'yang', 'mampu', 'memahami',
  'mengenal', 'mengenali', 'mengidentifikasi', 'menjelaskan', 'menunjukkan',
  'menentukan', 'melakukan', 'menggunakan', 'menyusun', 'menerapkan', 'membuat',
  'berdasarkan', 'berbagai', 'secara', 'sederhana', 'terkait', 'hasil',
]);

const BANK_MAPEL: Record<string, readonly string[]> = {
  MAT: ['bilangan', 'pola', 'bentuk', 'ukuran', 'pecahan', 'data', 'operasi hitung', 'ruang'],
  BI: ['tokoh', 'tempat', 'peristiwa', 'petunjuk', 'bukti', 'urutan cerita', 'kata kunci', 'kalimat'],
  BING: ['book', 'school', 'friend', 'family', 'colour', 'number', 'greeting', 'activity'],
  IPAS: ['makhluk hidup', 'air', 'energi', 'lingkungan', 'perubahan', 'siklus', 'bumi', 'masyarakat'],
  PP: ['aturan', 'hak', 'tanggung jawab', 'musyawarah', 'gotong royong', 'keberagaman', 'adil', 'Pancasila'],
  PJOK: ['pemanasan', 'keseimbangan', 'lari', 'lompat', 'lempar', 'kebugaran', 'gerak aman', 'kerja sama'],
  KKA: ['urutan', 'algoritma', 'pola', 'data', 'perulangan', 'debug', 'privasi', 'AI aman'],
  SMUS: ['ketukan', 'tempo', 'irama', 'bunyi', 'dinamika', 'melodi', 'pola', 'ekspresi'],
  RUPA: ['warna', 'garis', 'bentuk', 'tekstur', 'ruang', 'komposisi', 'pola', 'karya'],
  TARI: ['gerak', 'ruang', 'tempo', 'level', 'arah', 'pola lantai', 'ekspresi', 'iringan'],
  TEATER: ['tokoh', 'adegan', 'dialog', 'ekspresi', 'gerak', 'suara', 'properti', 'panggung'],
  PAI: ['jujur', 'amanah', 'ibadah', 'peduli', 'bersyukur', 'hormat', 'tolong-menolong', 'teladan'],
  PAK: ['kasih', 'jujur', 'doa', 'peduli', 'bersyukur', 'hormat', 'menolong', 'teladan'],
  PAKat: ['kasih', 'jujur', 'doa', 'peduli', 'bersyukur', 'hormat', 'menolong', 'teladan'],
  PAH: ['dharma', 'jujur', 'doa', 'peduli', 'bersyukur', 'hormat', 'menolong', 'teladan'],
  PAB: ['welas asih', 'jujur', 'doa', 'peduli', 'bersyukur', 'hormat', 'menolong', 'teladan'],
  PAKh: ['bakti', 'jujur', 'doa', 'peduli', 'bersyukur', 'hormat', 'menolong', 'teladan'],
};

function normalisasiKata(teks: string): string[] {
  return teks.toLocaleLowerCase('id').normalize('NFKD').replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/).filter((kata) => kata.length >= 4 && !KATA_UMUM.has(kata));
}

function kataKunci(konteks: KonteksKontenGame): string[] {
  const dariKurikulum = normalisasiKata(`${konteks.teksTp} ${konteks.materi.join(' ')}`)
    .filter((kata, posisi, semua) => semua.indexOf(kata) === posisi);
  return [...dariKurikulum, ...(BANK_MAPEL[konteks.mapelKode] ?? [konteks.mapelNama])]
    .filter((kata, posisi, semua) => semua.indexOf(kata) === posisi)
    .slice(0, 16);
}

function acakDeterministik<T>(daftar: T[], benih: number): T[] {
  return [...daftar].sort((a, b) => {
    const nilai = (item: T) => `${String(item)}-${benih}`.split('')
      .reduce((jumlah, huruf) => jumlah + huruf.charCodeAt(0), 0) % 97;
    return nilai(a) - nilai(b) || String(a).localeCompare(String(b), 'id');
  });
}

function labelMisi(tipe: TipeGameplay, topik: string, ikon: string): string {
  const misi: Record<TipeGameplay, string> = {
    kuis: `Pilih contoh yang paling dekat dengan ${topik}.`,
    drag_drop: `Seret bukti “${topik}” ke zona temuan.`,
    matching: `Hubungkan pasangan visual yang berkaitan dengan ${topik}.`,
    puzzle: `Susun kepingan hingga gambar konsep ${topik} lengkap.`,
    sorting: `Susun kartu ${topik} menjadi urutan yang masuk akal.`,
    maze: `Bawa tokoh melewati labirin menuju ${topik}.`,
    word_search: `Temukan kata ${topik.toLocaleUpperCase('id')} di antara kotak huruf.`,
    crossword: `Lengkapi jalur huruf untuk membentuk ${topik.toLocaleUpperCase('id')}.`,
    sentence_builder: `Rakit kartu menjadi kalimat singkat tentang ${topik}.`,
    memory: `Buka dan temukan semua pasangan kartu bertema ${topik}.`,
    wheel: `Putar roda dan selesaikan tantangan visual tentang ${topik}.`,
    board: `Majukan pion sampai tujuan misi ${topik}.`,
    chase: `Kejar objek ${topik} sebelum lolos.`,
    catch: `Tangkap objek yang mewakili ${topik}.`,
    target: `Bidik target ${topik} yang tepat.`,
    race: `Bawa tim mencapai garis akhir melalui pos ${topik}.`,
    battle: `Pilih tim lalu rebut energi misi ${topik}.`,
    image_guess: `Amati petunjuk gambar dan temukan ${topik}.`,
    image_puzzle: `Gabungkan potongan warna dan bentuk menjadi ${topik}.`,
    classification: `Pindahkan objek ke kelompok ${topik} yang sesuai.`,
    simulation: `Ubah keputusan dan amati dampaknya pada ${topik}.`,
    timeline: `Susun jejak ${topik} dari awal sampai akhir.`,
    map: `Sentuh titik peta yang menunjukkan ${topik}.`,
    experiment: `Atur alat virtual lalu uji perubahan pada ${topik}.`,
    manipulative: `Geser benda hitung untuk membentuk ${topik}.`,
    coding: `Susun blok perintah agar misi ${topik} berhasil.`,
    movement: `Ikuti rangkaian gerak ${topik} dengan aman.`,
    rhythm: `Ketuk pola warna dan bunyi untuk tema ${topik}.`,
  };
  return `${ikon} ${misi[tipe]}`;
}

function pilihanAktivitas(konteks: KonteksKontenGame, semuaKata: string[], indeks: number, maksimum: number): string[] {
  const bank = BANK_MAPEL[konteks.mapelKode] ?? [konteks.mapelNama, 'contoh', 'ciri', 'hubungan'];
  return [...semuaKata.slice(indeks), ...semuaKata, ...bank]
    .map((item) => item.trim()).filter((item, posisi, semua) => item && semua.indexOf(item) === posisi)
    .slice(0, Math.max(4, maksimum));
}

function butirInteraktif(
  engine: GameEngine,
  konteks: KonteksKontenGame,
  semuaKata: string[],
  indeks: number,
  pilihanMaks: number,
): ButirGame {
  const tipe = tipeGameplayEngine(engine);
  const topik = semuaKata[indeks % semuaKata.length] ?? konteks.mapelNama.toLocaleLowerCase('id');
  const kandidat = pilihanAktivitas(konteks, semuaKata, indeks, pilihanMaks);
  let pilihan = acakDeterministik(kandidat.slice(0, Math.max(4, pilihanMaks)), indeks + engine.kode.length);
  let jawaban = topik;

  if (['sorting', 'timeline', 'sentence_builder', 'coding', 'rhythm', 'movement', 'puzzle', 'image_puzzle'].includes(tipe)) {
    const urutan = kandidat.slice(0, Math.min(4, kandidat.length));
    jawaban = urutan.join(' → ');
    pilihan = acakDeterministik(urutan, indeks + konteks.tpId.length + 3);
  } else if (tipe === 'word_search' || tipe === 'crossword') {
    jawaban = topik.replace(/[^a-z0-9]/gi, '').toLocaleUpperCase('id').slice(0, 12) || 'KATA';
    pilihan = [...jawaban];
  } else if (!pilihan.some((item) => item === jawaban)) {
    pilihan = [jawaban, ...pilihan].slice(0, Math.max(4, pilihanMaks));
  }

  return {
    id: `BUTIR-${konteks.tpId}-${engine.kode}-${indeks + 1}`,
    pertanyaan: labelMisi(tipe, topik, ikonGameplay(konteks.mapelKode, indeks)),
    pilihan,
    jawaban,
    penjelasan: `Aktivitas ${engine.nama} memakai topik “${topik}” sebagai latihan kompetensi aktif tanpa menampilkan teks CP/TP sebagai soal.`,
    sumber: konteks.materi.length ? 'materi' : 'tp',
  };
}

/** Teks CP/TP hanya menentukan topik dan engine; tidak dijadikan pertanyaan. */
export function buatButirGameKontekstual(
  engine: GameEngine,
  konteks: KonteksKontenGame,
  jumlah: number,
  pilihanMaks: number,
): ButirGame[] {
  const kunci = kataKunci(konteks);
  return Array.from({ length: jumlah }, (_, indeks) =>
    butirInteraktif(engine, konteks, kunci, indeks, pilihanMaks),
  );
}

export function alasanEngineGame(engine: GameEngine, teksTp: string): string {
  const teks = teksTp.toLocaleLowerCase('id');
  const cocok = engine.kata_kerja_tp.find((kata) => kata !== '*' && teks.includes(kata));
  return cocok
    ? `Gameplay ${engine.nama} melatih tindakan “${cocok}” melalui interaksi ${tipeGameplayEngine(engine).replaceAll('_', ' ')}.`
    : `Gameplay visual ${tipeGameplayEngine(engine).replaceAll('_', ' ')} melatih ${engine.yang_diukur.toLocaleLowerCase('id')}.`;
}
