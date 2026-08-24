import { AppError } from '../errors/AppError';
import { buatButirGameKontekstual } from '../gameContent';
import { engineAdalahKuis } from '../gameplay';
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
  Kelompok,
  Siswa,
  TautanTp,
  TujuanPembelajaran,
} from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';
import { bacaRantaiTpAktif } from './isiRepo';
import { pastikanKurikulumTersedia } from './kurikulumRepo';

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

async function buatButir(
  tpId: string,
  engine: GameEngine,
  jumlah: number,
  pilihanMaks: number,
): Promise<ButirGame[]> {
  const rantai = await bacaRantaiTpAktif(tpId);
  const tujuanSerumpun = await jalankanTransaksi(TOKO.tp, 'readonly', (toko) =>
    kueri.semuaLewatIndeks<TujuanPembelajaran>(toko(TOKO.tp), 'elemen_id', rantai.elemen.id),
  );
  const kontekstual = buatButirGameKontekstual(engine, {
    tpId,
    tingkatKelas: rantai.tp.tingkat_kelas,
    mapelKode: rantai.cp.mapel_kode,
    mapelNama: rantai.mapel.nama,
    teksCp: rantai.cp.teks_capaian,
    teksElemen: rantai.elemen.teks_elemen,
    teksTp: rantai.tp.teks_tujuan,
    materi: rantai.materi.flatMap((materi) => materi.blok.map((blok) => blok.isi)),
    tpSerumpun: tujuanSerumpun
      .filter((tujuan) => tujuan.id !== rantai.tp.id && tujuan.status === 'aktif')
      .map((tujuan) => tujuan.teks_tujuan),
  }, jumlah, pilihanMaks);
  if (!kontekstual.length) throw new AppError('VALIDASI', 'Konten interaktif untuk TP aktif tidak dapat dibentuk.');
  return kontekstual;
}

export async function buatKatalogGameUntukTp(tpId: string): Promise<GamePembelajaran[]> {
  await pastikanPustakaGameTersedia();
  const ada = await daftarGameUntukTp(tpId);
  const rantai = await bacaRantaiTpAktif(tpId);
  const profil = PROFIL_FASE_GAME[rantai.cp.fase_kode];
  const tersaring = saringEngineGame({
    fase_kode: rantai.cp.fase_kode,
    mapel_kode: rantai.cp.mapel_kode,
    teks_tp: rantai.tp.teks_tujuan,
  });
  const engine = [
    ...tersaring.filter((item) => !engineAdalahKuis(item)).slice(0, 12),
    ...tersaring.filter(engineAdalahKuis).slice(0, 3),
  ];
  const perEngine = new Map(ada.map((baris) => [baris.engine_kode, baris]));
  const tambahan: GamePembelajaran[] = [];
  for (const item of engine) {
    const tersimpan = perEngine.get(item.kode);
    const gameplayBaru = tersimpan?.butir.every((butir) =>
      butir.penjelasan.includes('tanpa menampilkan teks CP/TP'),
    );
    if (tersimpan?.prompt_ai_id || (tersimpan && gameplayBaru)) continue;
    const butir = await buatButir(
      tpId,
      item,
      Math.min(profil.jumlah_butir_maks, 8),
      profil.jumlah_pilihan,
    );
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
  if (!engine) throw new AppError('VALIDASI', 'Engine game tidak terdaftar pada pustaka engine.');
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
  siswaId?: string;
  kelompokId?: string;
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
  const waktu = new Date().toISOString();
  const hasil = await jalankanTransaksi([TOKO.game, TOKO.hasil, TOKO.poinBadge, TOKO.siswa, TOKO.kelompok], 'readwrite', async (toko) => {
    let sasaran: Siswa[] = [];
    if (masukan.kelompokId) {
      const semua = await kueri.semua<Siswa>(toko(TOKO.siswa));
      sasaran = semua.filter((item) => (item.kelompok_ids ?? (item.kelompok_id ? [item.kelompok_id] : [])).includes(masukan.kelompokId!));
    } else if (masukan.siswaId) {
      const siswa = await kueri.ambil<Siswa>(toko(TOKO.siswa), masukan.siswaId);
      if (siswa) sasaran = [siswa];
    }
    if (!sasaran.length) throw new AppError('VALIDASI', 'Pilih siswa atau kelompok yang mengikuti game.');
    const daftarHasil: HasilBelajar[] = sasaran.map((siswa) => ({
      id: `HASIL-GAME-${crypto.randomUUID()}`, siswa_id: siswa.id, tp_id: game.tp_id,
      sesi_id: masukan.sesiId, jenis_aktivitas: game.mode_permainan === 'battle' ? 'battle' : 'game',
      isi_id: game.id, skor: masukan.ringkasan.skor, skor_maksimal: maksimal,
      ketuntasan: rasio >= 0.75 ? 'tuntas' : rasio >= 0.5 ? 'berkembang' : 'perlu_bimbingan',
      waktu, tanggal_kegiatan: waktu.slice(0, 10), dinilai_oleh: masukan.dinilaiOleh,
      kelompok_id: masukan.kelompokId ?? null,
    }));
    for (const baris of daftarHasil) await kueri.simpan(toko(TOKO.hasil), baris);
    await kueri.simpan(toko(TOKO.game), { ...game, jumlah_dimainkan: game.jumlah_dimainkan + 1 });
    const poin = Math.round(masukan.ringkasan.skor / 10);
    for (const siswa of sasaran) {
      const badge = await kueri.ambil<PoinBadge>(toko(TOKO.poinBadge), siswa.id);
      await kueri.simpan(toko(TOKO.poinBadge), {
        siswa_id: siswa.id, poin_total: (badge?.poin_total ?? 0) + poin,
        badge_diraih: badge?.badge_diraih ?? [],
        riwayat: [...(badge?.riwayat ?? []), { waktu, poin, alasan: game.judul }],
      } satisfies PoinBadge);
    }
    if (masukan.kelompokId) {
      const kelompok = await kueri.ambil<Kelompok>(toko(TOKO.kelompok), masukan.kelompokId);
      if (kelompok) await kueri.simpan(toko(TOKO.kelompok), { ...kelompok, poin_total: kelompok.poin_total + poin });
    }
    return daftarHasil;
  });
  return hasil[0]!;
}

export async function hitungRelasiGame(tpId: string): Promise<{
  elemen: ElemenKurikulum;
  jumlahGame: number;
}> {
  const rantai = await bacaRantaiTpAktif(tpId);
  return { elemen: rantai.elemen, jumlahGame: (await daftarGameUntukTp(tpId)).length };
}
