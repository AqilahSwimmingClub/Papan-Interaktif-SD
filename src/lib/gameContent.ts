import { ikonGameplay } from './gameplay';
import { deteksiTagKompetensi, mekanikGameAnak } from './gameSemantics';
import type { ButirGame, GameEngine, MekanikGameAnak } from './types';

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

function labelMisi(mekanik: MekanikGameAnak, topik: string, ikon: string): string {
  const misi: Record<MekanikGameAnak, string> = {
    kuis: `Pilih contoh yang paling dekat dengan ${topik}.`,
    maze_adventure: `Bantu Kiko menjelajah labirin dan mengambil lencana ${topik}.`,
    balloon_pop: `Pecahkan balon ${topik} sebelum terbang melewati awan.`,
    whack_target: `Pukul target ${topik} saat muncul dari lubang warna-warni.`,
    treasure_hunt: `Buka peti yang menyimpan petunjuk ${topik}.`,
    racing_game: `Pilih bahan bakar ${topik} agar kendaraan melaju.`,
    tower_builder: `Kumpulkan balok ${topik} untuk membangun menara.`,
    territory_battle: `Rebut petak wilayah ${topik} untuk timmu.`,
    monster_battle: `Isi daya sahabat monster dengan kristal ${topik}.`,
    fishing_catch: `Pancing ikan yang membawa tanda ${topik}.`,
    platform_jump: `Lompat ke platform yang menunjukkan ${topik}.`,
    sorting_factory: `Arahkan paket ${topik} dari konveyor ke gerbang tepat.`,
    puzzle_builder: `Susun keping petualangan ${topik} sampai lengkap.`,
    memory_world: `Temukan semua pasangan kartu di dunia ${topik}.`,
    board_game: `Bantu pion mencapai bintang tujuan ${topik}.`,
    bingo_classroom: `Tandai petak ${topik} untuk menyelesaikan satu garis.`,
    escape_room: `Temukan petunjuk ${topik} untuk membuka pintu rahasia.`,
    number_adventure: `Gerakkan roket angka menuju hasil ${topik}.`,
    word_adventure: `Kumpulkan huruf untuk membuka kata rahasia ${topik}.`,
    science_lab: `Pilih bahan dan jalankan eksperimen ${topik}.`,
    coding_quest: `Susun blok agar robot mencapai tujuan ${topik}.`,
    music_rhythm: `Ketuk lampu nada mengikuti pola ${topik}.`,
    art_stage: `Bangun panggung warna, bentuk, atau gerak ${topik}.`,
    pjok_motion: `Selesaikan pos gerak aman bertema ${topik}.`,
    story_adventure: `Bantu tokoh memilih tindakan terbaik dalam kisah ${topik}.`,
  };
  return `${ikon} ${misi[mekanik]}`;
}

function narasiMisi(mapelKode: string, topik: string, indeks: number): string {
  const tokoh = ['Kiko', 'Nara', 'Bimo', 'Lumi'][indeks % 4];
  if (mapelKode === 'BI' || mapelKode === 'BING') return `${tokoh} menemukan buku bergambar di perpustakaan. Setiap petunjuk tentang ${topik} akan membuka halaman berikutnya.`;
  if (mapelKode === 'MAT') return `${tokoh} menyalakan roket angka. Susunan ${topik} yang tepat memberi tenaga untuk terbang lebih jauh.`;
  if (mapelKode === 'IPAS') return `${tokoh} berada di laboratorium mini. Benda bertanda ${topik} perlu diamati sebelum alat dinyalakan.`;
  if (mapelKode === 'PP' || mapelKode.startsWith('PA')) return `${tokoh} dan teman-temannya menghadapi situasi di sekolah. Tindakan tentang ${topik} membantu mereka menyelesaikannya dengan baik.`;
  if (mapelKode === 'KKA') return `Robot ${tokoh} menunggu urutan perintah. Blok ${topik} membantunya keluar dari arena.`;
  if (mapelKode === 'PJOK') return `${tokoh} memasuki sirkuit gerak. Pos ${topik} harus dilakukan dengan aman dan bergantian.`;
  if (['SMUS', 'RUPA', 'TARI', 'TEATER'].includes(mapelKode)) return `Panggung karya ${tokoh} belum lengkap. Pola ${topik} akan menyalakan lampu pertunjukan.`;
  return `${tokoh} memulai petualangan bertema ${topik}. Temukan objek yang paling membantu misi.`;
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
  const mekanik = mekanikGameAnak(engine);
  const tag = deteksiTagKompetensi(konteks.teksTp)[0];
  const topik = semuaKata[indeks % semuaKata.length] ?? konteks.mapelNama.toLocaleLowerCase('id');
  const kandidat = pilihanAktivitas(konteks, semuaKata, indeks, pilihanMaks);
  let pilihan = acakDeterministik(kandidat.slice(0, Math.max(4, pilihanMaks)), indeks + engine.kode.length);
  let jawaban = topik;

  if (['puzzle_builder', 'coding_quest', 'music_rhythm', 'art_stage', 'pjok_motion'].includes(mekanik)) {
    const urutan = kandidat.slice(0, Math.min(4, kandidat.length));
    jawaban = urutan.join(' → ');
    pilihan = acakDeterministik(urutan, indeks + konteks.tpId.length + 3);
  } else if (mekanik === 'word_adventure') {
    jawaban = topik.replace(/[^a-z0-9]/gi, '').toLocaleUpperCase('id').slice(0, 12) || 'KATA';
    pilihan = [...jawaban];
  } else if (mekanik === 'number_adventure') {
    const sasaran = konteks.tingkatKelas * 2 + indeks + 2;
    jawaban = String(sasaran);
    pilihan = [sasaran - 2, sasaran - 1, sasaran, sasaran + 2].map(String);
  } else if (!pilihan.some((item) => item === jawaban)) {
    pilihan = [jawaban, ...pilihan].slice(0, Math.max(4, pilihanMaks));
  }

  return {
    id: `BUTIR-${konteks.tpId}-${engine.kode}-${indeks + 1}`,
    pertanyaan: labelMisi(mekanik, topik, ikonGameplay(konteks.mapelKode, indeks)),
    pilihan,
    jawaban,
    penjelasan: `Petualangan ${engine.nama} memakai materi “${topik}” untuk melatih ${tag}; teks CP/TP tidak ditampilkan sebagai soal.`,
    sumber: konteks.materi.length ? 'materi' : 'tp',
    narasi: narasiMisi(konteks.mapelKode, topik, indeks),
    tag_kompetensi: tag,
    mekanik_anak: mekanik,
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
    ? `Gameplay ${engine.nama} melatih tindakan “${cocok}” melalui dunia ${mekanikGameAnak(engine).replaceAll('_', ' ')}.`
    : `Dunia game ${mekanikGameAnak(engine).replaceAll('_', ' ')} melatih ${engine.yang_diukur.toLocaleLowerCase('id')}.`;
}
