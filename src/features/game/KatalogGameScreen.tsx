import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { keAppError } from '../../lib/errors/AppError';
import { GAME_ENGINE_FINAL } from '../../lib/gameEngines';
import { buatKatalogGameUntukTp } from '../../lib/storage/gameRepo';
import { bacaRantaiTpAktif, type RantaiTpAktif } from '../../lib/storage/isiRepo';
import type { GamePembelajaran, ModePermainanGame } from '../../lib/types';
import { RUTE, ruteCpTp, ruteMainGame } from '../../routes/paths';
import { useKurikulum } from '../../state/useKurikulum';
import './game.css';

const LABEL_MODE: Record<ModePermainanGame, string> = {
  individu: 'Individu',
  kelompok: 'Kelompok',
  battle: 'Battle',
  seluruh_kelas: 'Seluruh kelas',
};

export function KatalogGameScreen() {
  const { konteks } = useKurikulum();
  const [game, setGame] = useState<GamePembelajaran[]>([]);
  const [rantai, setRantai] = useState<RantaiTpAktif | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [pesan, setPesan] = useState('');
  const [mode, setMode] = useState<'semua' | ModePermainanGame>('semua');
  const [kesulitan, setKesulitan] = useState('semua');

  useEffect(() => {
    if (!konteks.tp_id) return;
    let hidup = true;
    setMemuat(true);
    Promise.all([buatKatalogGameUntukTp(konteks.tp_id), bacaRantaiTpAktif(konteks.tp_id)])
      .then(([daftar, isi]) => {
        if (!hidup) return;
        setGame(daftar);
        setRantai(isi);
        setPesan('');
      })
      .catch((galat: unknown) => hidup && setPesan(keAppError(galat).message))
      .finally(() => hidup && setMemuat(false));
    return () => { hidup = false; };
  }, [konteks.tp_id]);

  const tersaring = useMemo(
    () => game.filter(
      (item) =>
        (mode === 'semua' || item.mode_permainan === mode) &&
        (kesulitan === 'semua' || item.tingkat_kesulitan === kesulitan),
    ),
    [game, mode, kesulitan],
  );

  if (!konteks.tp_id || !konteks.tingkat_kelas || !konteks.mapel_kode) {
    return (
      <main className="halaman-kurikulum game-katalog">
        <p className="label-data">Katalog game reusable</p>
        <h1>Game Edukasi</h1>
        <section className="keadaan-kosong keadaan-kosong--fitur">
          <span className="keadaan-kosong__ikon" aria-hidden="true">→</span>
          <h2>Pilih CP dan TP lebih dulu</h2>
          <p>Game selalu dibentuk dari rantai kelas → fase → mapel → CP → TP → materi aktif.</p>
          <Link className="tombol-guru tombol-guru--utama" to={RUTE.kelas}>Pilih Kelas</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="halaman-kurikulum game-katalog" data-testid="katalog-game">
      <header className="kop-kurikulum game-katalog__kop">
        <div>
          <p className="label-data">30 engine · local-first</p>
          <h1>Katalog Game Edukasi</h1>
          <p>{rantai?.tp.teks_tujuan ?? 'Menyiapkan TP aktif…'}</p>
        </div>
        <div className="game-katalog__angka" aria-label="Ringkasan pustaka game">
          <strong>{GAME_ENGINE_FINAL.length}</strong><span>engine reusable</span>
          <strong>{game.length}</strong><span>game untuk TP ini</span>
        </div>
      </header>

      <nav className="game-rantai" aria-label="Konteks game aktif">
        <span>Kelas {konteks.tingkat_kelas}</span><b>›</b>
        <span>Fase {konteks.fase_kode}</span><b>›</b>
        <span>{rantai?.mapel.nama ?? konteks.mapel_kode}</span><b>›</b>
        <span>{rantai?.tp.kode_tampil ?? konteks.tp_id}</span>
      </nav>

      <section className="game-filter" aria-label="Filter game">
        <label>Mode<select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
          <option value="semua">Semua mode</option>
          {Object.entries(LABEL_MODE).map(([nilai, label]) => <option key={nilai} value={nilai}>{label}</option>)}
        </select></label>
        <label>Kesulitan<select value={kesulitan} onChange={(e) => setKesulitan(e.target.value)}>
          <option value="semua">Semua tingkat</option><option value="mudah">Mudah</option>
          <option value="sedang">Sedang</option><option value="sulit">Sulit</option>
        </select></label>
        <Link to={ruteCpTp(konteks.tingkat_kelas, konteks.mapel_kode)}>Ganti TP</Link>
      </section>

      {pesan ? <p className="game-pesan" role="alert">{pesan}</p> : null}
      {memuat ? <section className="game-memuat">Menyiapkan katalog game dari data kurikulum lokal…</section> : null}
      {!memuat ? (
        <section className="game-grid" aria-label="Daftar game">
          {tersaring.map((item, indeks) => {
            const engine = GAME_ENGINE_FINAL.find((baris) => baris.kode === item.engine_kode);
            return (
              <article className="game-card" key={item.id}>
                <span className={`game-card__ikon game-card__ikon--${indeks % 6}`} aria-hidden="true">{item.engine_kode.replace('GE-', '')}</span>
                <div className="game-card__isi">
                  <p>{engine?.yang_diukur ?? 'Aktivitas TP'}</p><h2>{item.judul}</h2>
                  <div><span>{LABEL_MODE[item.mode_permainan]}</span><span>{item.durasi_menit} menit</span><span>{item.jumlah_butir} butir</span></div>
                </div>
                <Link to={ruteMainGame(item.id)}>Mainkan <span aria-hidden="true">→</span></Link>
              </article>
            );
          })}
          {!tersaring.length ? <p className="game-pesan">Tidak ada game yang cocok dengan filter ini.</p> : null}
        </section>
      ) : null}
    </main>
  );
}
