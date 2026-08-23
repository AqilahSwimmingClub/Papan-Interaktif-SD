import { AppError } from '../errors/AppError';
import { GAME_ENGINE_FINAL, PROFIL_FASE_GAME, saringEngineGame } from '../gameEngines';
import type {
  ButirGame,
  ElemenKurikulum,
  GameEngine,
  GamePembelajaran,
  HasilBelajar,
  JawabanButirGame,
  PoinBadge,
  RingkasanPermainan,
  TautanTp,
  TujuanPembelajaran,
} from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';
import { bacaRantaiTpAktif } from './isiRepo';
import { pastikanKurikulumTersedia } from './kurikulumRepo';

function ringkas(teks: string, maksimum = 180): string {
  const bersih = teks.replace(/\s+/g, ' ').trim();
  return bersih.length > maksimum ? `${bersih.slice(0, maksimum - 1).trimEnd()}…` : bersih;
}

export async function pastikanPustakaGameTersedia(): Promise<void> {
  await pastikanKurikulumTersedia();
  await jalankanTransaksi(TOKO.gameEngine, 'readwrite', async (toko) => {
    for (const engine of GAME_ENGINE_FINAL) await kueri.simpan(toko(TOKO.gameEngine), engine);
  });
}

export async function daftarEngineGame(): Promise<GameEngine[]> {
  await pastikanPustakaGameTersedia();
  return jalankanTransaksi(TOKO.gameEngine, 'readonly', (toko) =>
    kueri.semua<GameEngine>(toko(TOKO.gameEngine)),
  );
}

async function buatButir(tpId: string, jumlah: number, pilihanMaks: number): Promise<ButirGame[]> {
  const rantai = await bacaRantaiTpAktif(tpId);
  const tujuanSerumpun = await jalankanTransaksi(TOKO.tp, 'readonly', (toko) =>
    kueri.semuaLewatIndeks<TujuanPembelajaran>(toko(TOKO.tp), 'elemen_id', rantai.elemen.id),
  );
  const sumber = [
    { teks: rantai.tp.teks_tujuan, jenis: 'tp' as const },
    { teks: rantai.elemen.teks_elemen, jenis: 'elemen' as const },
    { teks: rantai.cp.teks_capaian, jenis: 'cp' as const },
    ...rantai.materi.flatMap((materi) =>
      materi.blok.map((blok) => ({ teks: blok.isi, jenis: 'materi' as const })),
    ),
  ].filter((baris) => baris.teks.trim());
  const pengecoh = tujuanSerumpun
    .filter((tujuan) => tujuan.id !== rantai.tp.id && tujuan.status === 'aktif')
    .map((tujuan) => ringkas(tujuan.teks_tujuan));

  return Array.from({ length: jumlah }, (_, indeks) => {
    const baris = sumber[indeks % sumber.length]!;
    const jawaban = ringkas(baris.teks);
    const alternatif = [
      ...pengecoh,
      ringkas(rantai.elemen.nama),
      ringkas(rantai.mapel.nama),
      `Kelas ${rantai.tp.tingkat_kelas} · Fase ${rantai.cp.fase_kode}`,
    ].filter((nilai, posisi, semua) => nilai !== jawaban && semua.indexOf(nilai) === posisi);
    const pilihan = [jawaban, ...alternatif].slice(0, Math.max(2, pilihanMaks));
    return {
      id: `BUTIR-${tpId}-${indeks + 1}`,
      pertanyaan: `Pilih pernyataan yang sesuai dengan ${baris.jenis.toUpperCase()} aktif.`,
      pilihan,
      jawaban,
      penjelasan: `Bersumber langsung dari ${baris.jenis.toUpperCase()} aktif; teks kurikulum tidak diubah.`,
      sumber: baris.jenis,
    };
  });
}

export async function buatKatalogGameUntukTp(tpId: string): Promise<GamePembelajaran[]> {
  await pastikanPustakaGameTersedia();
  const ada = await daftarGameUntukTp(tpId);
  if (ada.length >= 6) return ada;
  const rantai = await bacaRantaiTpAktif(tpId);
  const profil = PROFIL_FASE_GAME[rantai.cp.fase_kode];
  const engine = saringEngineGame({
    fase_kode: rantai.cp.fase_kode,
    mapel_kode: rantai.cp.mapel_kode,
    teks_tp: rantai.tp.teks_tujuan,
  }).slice(0, Math.max(6, 6 - ada.length));
  const sudah = new Set(ada.map((baris) => baris.engine_kode));
  const tambahan: GamePembelajaran[] = [];
  for (const item of engine) {
    if (sudah.has(item.kode)) continue;
    const butir = await buatButir(tpId, Math.min(profil.jumlah_butir_maks, 8), profil.jumlah_pilihan);
    tambahan.push({
      id: `GAME-${tpId}-${item.kode}`,
      tp_id: rantai.tp.id,
      tingkat_kelas: rantai.tp.tingkat_kelas,
      fase_kode: rantai.cp.fase_kode,
      mapel_kode: rantai.cp.mapel_kode,
      cp_id: rantai.cp.id,
      materi_id: rantai.materi[0]?.id ?? null,
      engine_kode: item.kode,
      judul: `${item.nama} · ${rantai.tp.kode_tampil}`,
      tingkat_kesulitan: rantai.cp.fase_kode === 'A' ? 'mudah' : 'sedang',
      mode_permainan: item.mode_didukung[0] ?? 'seluruh_kelas',
      durasi_menit: Math.max(5, Math.ceil(butir.length * ((profil.detik_per_butir ?? 30) / 60))),
      jumlah_butir: butir.length,
      detik_per_butir: profil.detik_per_butir,
      butir,
      prompt_ai_id: null,
      status_persetujuan: 'disetujui',
      jumlah_dimainkan: 0,
      referensi_bab_id: rantai.materi[0]?.referensi_bab_id ?? null,
    });
  }
  for (const game of tambahan) await simpanGame(game);
  return daftarGameUntukTp(tpId);
}

export async function simpanGame(game: GamePembelajaran): Promise<void> {
  const rantai = await bacaRantaiTpAktif(game.tp_id);
  const engine = GAME_ENGINE_FINAL.find((item) => item.kode === game.engine_kode);
  if (!engine) throw new AppError('VALIDASI', 'Engine game tidak terdaftar pada pustaka 30 engine.');
  if (engine.dukungan_fase[rantai.cp.fase_kode] === 'tidak') {
    throw new AppError('VALIDASI', 'Engine ini tidak tersedia untuk fase aktif.');
  }
  if (
    game.cp_id !== rantai.cp.id ||
    game.mapel_kode !== rantai.cp.mapel_kode ||
    game.fase_kode !== rantai.cp.fase_kode ||
    game.tingkat_kelas !== rantai.tp.tingkat_kelas
  ) {
    throw new AppError('VALIDASI', 'Relasi kelas → fase → mapel → CP → TP pada game tidak konsisten.');
  }
  if (!game.butir.length || game.jumlah_butir !== game.butir.length) {
    throw new AppError('VALIDASI', 'Jumlah butir game tidak valid.');
  }
  await jalankanTransaksi([TOKO.game, TOKO.tautanTp], 'readwrite', async (toko) => {
    await kueri.simpan(toko(TOKO.game), game);
    const tautan: TautanTp = {
      tp_id: game.tp_id,
      jenis_isi: 'game',
      isi_id: game.id,
      peran: 'utama',
      dibuat_oleh_ai: Boolean(game.prompt_ai_id),
    };
    await kueri.simpan(toko(TOKO.tautanTp), tautan);
  });
}

export async function daftarGameUntukTp(tpId: string): Promise<GamePembelajaran[]> {
  return jalankanTransaksi(TOKO.game, 'readonly', async (toko) => {
    const semua = await kueri.semuaLewatIndeks<GamePembelajaran>(toko(TOKO.game), 'tp_id', tpId);
    return semua
      .filter((game) => game.status_persetujuan === 'disetujui')
      .sort((a, b) => a.judul.localeCompare(b.judul, 'id', { numeric: true }));
  });
}

export async function bacaGame(id: string): Promise<GamePembelajaran | undefined> {
  return jalankanTransaksi(TOKO.game, 'readonly', (toko) =>
    kueri.ambil<GamePembelajaran>(toko(TOKO.game), id),
  );
}

export interface SimpanHasilGame {
  siswaId: string;
  sesiId: string;
  dinilaiOleh: string;
  jawaban: JawabanButirGame[];
  ringkasan: RingkasanPermainan;
}

/** Orkestrator menyimpan hasil; fungsi engine penilaian sendiri tetap murni. */
export async function simpanHasilGame(
  gameId: string,
  masukan: SimpanHasilGame,
): Promise<HasilBelajar> {
  const game = await bacaGame(gameId);
  if (!game) throw new AppError('VALIDASI', 'Game tidak ditemukan.');
  const maksimal = game.butir.length * 10;
  if (
    masukan.ringkasan.skor_maksimal !== maksimal ||
    masukan.ringkasan.skor < 0 ||
    masukan.ringkasan.skor > maksimal ||
    masukan.jawaban.length !== game.butir.length
  ) throw new AppError('VALIDASI', 'Ringkasan hasil game tidak konsisten.');
  const rasio = maksimal ? masukan.ringkasan.skor / maksimal : 0;
  const hasil: HasilBelajar = {
    id: `HASIL-GAME-${crypto.randomUUID()}`,
    siswa_id: masukan.siswaId,
    tp_id: game.tp_id,
    sesi_id: masukan.sesiId,
    jenis_aktivitas: 'game',
    isi_id: game.id,
    skor: masukan.ringkasan.skor,
    skor_maksimal: maksimal,
    ketuntasan: rasio >= 0.75 ? 'tuntas' : rasio >= 0.5 ? 'berkembang' : 'perlu_bimbingan',
    waktu: new Date().toISOString(),
    dinilai_oleh: masukan.dinilaiOleh,
  };
  await jalankanTransaksi([TOKO.game, TOKO.hasil, TOKO.poinBadge], 'readwrite', async (toko) => {
    const badge = await kueri.ambil<PoinBadge>(toko(TOKO.poinBadge), masukan.siswaId);
    await kueri.simpan(toko(TOKO.hasil), hasil);
    await kueri.simpan(toko(TOKO.game), { ...game, jumlah_dimainkan: game.jumlah_dimainkan + 1 });
    const poin = Math.round(masukan.ringkasan.skor / 10);
    await kueri.simpan(toko(TOKO.poinBadge), {
      siswa_id: masukan.siswaId,
      poin_total: (badge?.poin_total ?? 0) + poin,
      badge_diraih: badge?.badge_diraih ?? [],
      riwayat: [...(badge?.riwayat ?? []), { waktu: hasil.waktu, poin, alasan: game.judul }],
    } satisfies PoinBadge);
  });
  return hasil;
}

export async function hitungRelasiGame(tpId: string): Promise<{
  elemen: ElemenKurikulum;
  jumlahGame: number;
}> {
  const rantai = await bacaRantaiTpAktif(tpId);
  return { elemen: rantai.elemen, jumlahGame: (await daftarGameUntukTp(tpId)).length };
}
