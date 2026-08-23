import type { ButirGame, GameEngine } from './types';

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
  'sesuai', 'siswa', 'suatu', 'tentang', 'untuk', 'yang',
]);

function ringkas(teks: string, maksimum = 170): string {
  const bersih = teks.replace(/\s+/g, ' ').trim();
  return bersih.length > maksimum ? `${bersih.slice(0, maksimum - 1).trimEnd()}…` : bersih;
}

function kalimat(teks: string): string[] {
  return teks.replace(/\s+/g, ' ').split(/(?<=[.!?;])\s+/)
    .map((item) => ringkas(item)).filter((item) => item.length >= 18);
}

function kataKunci(konteks: KonteksKontenGame): string[] {
  return `${konteks.teksTp} ${konteks.materi.join(' ')}`
    .toLocaleLowerCase('id').normalize('NFKD').replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/).filter((kata) => kata.length >= 4 && !KATA_UMUM.has(kata))
    .filter((kata, posisi, semua) => semua.indexOf(kata) === posisi).slice(0, 18);
}

function konteksTokoh(kode: string, kata: string): string {
  if (kode === 'MAT') return `Bima sedang menyelesaikan tantangan tentang ${kata}.`;
  if (['BI', 'BING'].includes(kode)) return `Sinta membaca teks dan menemukan bagian tentang ${kata}.`;
  if (kode === 'IPAS') return `Raka mengamati lingkungan untuk memahami ${kata}.`;
  if (kode === 'PP') return `Ayu berdiskusi dengan kelompoknya tentang ${kata}.`;
  if (['PAI', 'PAK', 'PAKat', 'PAH', 'PAB', 'PAKh'].includes(kode)) return `Ayu dan Bima membahas sikap serta pemahaman tentang ${kata}.`;
  if (['SMUS', 'RUPA', 'TARI', 'TEATER'].includes(kode)) return `Nara menyiapkan karya dan memperhatikan ${kata}.`;
  if (kode === 'PJOK') return `Dimas berlatih bersama teman-temannya dengan fokus ${kata}.`;
  if (kode === 'KKA') return `Lani menyusun langkah untuk memecahkan tantangan ${kata}.`;
  return `Sinta dan Bima mempelajari ${kata} bersama kelompoknya.`;
}

function acakDeterministik<T>(daftar: T[], benih: number): T[] {
  return [...daftar].sort((a, b) => {
    const nilai = (item: T) => `${String(item)}-${benih}`.split('')
      .reduce((jumlah, huruf) => jumlah + huruf.charCodeAt(0), 0) % 97;
    return nilai(a) - nilai(b) || String(a).localeCompare(String(b), 'id');
  });
}

function pilihanUnik(jawaban: string, alternatif: string[], maksimum: number, benih: number): string[] {
  const unik = alternatif.map((item) => ringkas(item))
    .filter((item, posisi, semua) => item && item !== jawaban && semua.indexOf(item) === posisi);
  return acakDeterministik([jawaban, ...unik].slice(0, Math.max(2, maksimum)), benih);
}

function pertanyaanKontekstual(
  engine: GameEngine,
  konteks: KonteksKontenGame,
  kata: string,
  sumber: ButirGame['sumber'],
  isi: string,
  indeks: number,
): { pertanyaan: string; jawaban?: string; pilihan?: string[] } {
  if (engine.mekanik === 'benar_salah') {
    const pembanding = konteks.tpSerumpun[indeks % Math.max(1, konteks.tpSerumpun.length)];
    const salah = indeks % 2 === 1 && pembanding;
    return {
      pertanyaan: `Apakah pernyataan “${salah ? ringkas(pembanding) : isi}” merupakan fokus ${sumber.toUpperCase()} aktif ini?`,
      jawaban: salah ? 'Salah' : 'Benar', pilihan: ['Benar', 'Salah'],
    };
  }
  if (['isi-rumpang', 'tebak-kata', 'susun-kata'].includes(engine.kode) && isi.toLocaleLowerCase('id').includes(kata)) {
    return {
      pertanyaan: `Lengkapi bagian kosong berdasarkan ${sumber.toUpperCase()} aktif: “${isi.replace(new RegExp(`\\b${kata}\\b`, 'i'), '_____')}”`,
      jawaban: kata,
    };
  }
  const tokoh = konteksTokoh(konteks.mapelKode, kata);
  if (engine.mekanik === 'pasangan') return { pertanyaan: `${tokoh} Pilih pasangan informasi yang paling tepat untuk petunjuk “${kata}”.` };
  if (engine.mekanik === 'urutan') return { pertanyaan: `${tokoh} Pilih urutan atau pernyataan yang paling sesuai dengan TP aktif.` };
  if (engine.mekanik === 'klasifikasi') return { pertanyaan: `${tokoh} Pilih informasi yang termasuk dalam konteks ${konteks.mapelNama} untuk TP ini.` };
  if (engine.mekanik === 'simulasi') return { pertanyaan: `${tokoh} Keputusan mana yang paling didukung oleh materi dan TP aktif?` };
  if (engine.mekanik === 'papan') return { pertanyaan: `${tokoh} Tantangan kelas: pilih petunjuk yang benar-benar bersumber dari TP aktif.` };
  return { pertanyaan: `${tokoh} Pilih jawaban yang paling sesuai dengan ${sumber.toUpperCase()} aktif.` };
}

/** Mengisi engine tanpa mengubah CP/TP tersimpan; jawaban berasal dari rantai aktif. */
export function buatButirGameKontekstual(
  engine: GameEngine,
  konteks: KonteksKontenGame,
  jumlah: number,
  pilihanMaks: number,
): ButirGame[] {
  const sumber = [
    ...kalimat(konteks.teksTp).map((teks) => ({ teks, jenis: 'tp' as const })),
    ...kalimat(konteks.teksElemen).map((teks) => ({ teks, jenis: 'elemen' as const })),
    ...konteks.materi.flatMap((teks) => kalimat(teks).map((isi) => ({ teks: isi, jenis: 'materi' as const }))),
    ...kalimat(konteks.teksCp).map((teks) => ({ teks, jenis: 'cp' as const })),
  ];
  const isiSumber = sumber.length ? sumber : [{ teks: ringkas(konteks.teksTp), jenis: 'tp' as const }];
  const kunci = kataKunci(konteks);
  const alternatifDasar = [...konteks.tpSerumpun, konteks.teksElemen, konteks.teksCp, `Kelas ${konteks.tingkatKelas}`, konteks.mapelNama];

  return Array.from({ length: jumlah }, (_, indeks) => {
    const baris = isiSumber[indeks % isiSumber.length]!;
    const kata = kunci[indeks % Math.max(1, kunci.length)] ?? konteks.mapelNama.toLocaleLowerCase('id');
    const bentuk = pertanyaanKontekstual(engine, konteks, kata, baris.jenis, baris.teks, indeks);
    const jawaban = bentuk.jawaban ?? baris.teks;
    const alternatifKata = bentuk.jawaban === kata ? kunci.filter((item) => item !== kata) : [];
    const pilihan = bentuk.pilihan ?? pilihanUnik(jawaban, [
      ...alternatifKata, ...alternatifDasar, ...isiSumber.map((item) => item.teks),
    ], pilihanMaks, indeks + konteks.tpId.length + engine.kode.length);
    return {
      id: `BUTIR-${konteks.tpId}-${engine.kode}-${indeks + 1}`,
      pertanyaan: bentuk.pertanyaan, pilihan, jawaban,
      penjelasan: `Jawaban diturunkan dari ${baris.jenis.toUpperCase()} aktif; data kurikulum sumber tetap read-only.`,
      sumber: baris.jenis,
    };
  });
}

export function alasanEngineGame(engine: GameEngine, teksTp: string): string {
  const teks = teksTp.toLocaleLowerCase('id');
  const cocok = engine.kata_kerja_tp.find((kata) => kata !== '*' && teks.includes(kata));
  return cocok
    ? `Cocok karena TP memuat kata kerja “${cocok}” dan mengukur ${engine.yang_diukur.toLocaleLowerCase('id')}.`
    : `Cocok untuk melatih ${engine.yang_diukur.toLocaleLowerCase('id')} pada konteks TP aktif.`;
}
