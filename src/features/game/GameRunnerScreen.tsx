import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { GAME_ENGINE_FINAL, nilaiJawabanGame, ringkasPermainan } from '../../lib/gameEngines';
import { tipeGameplayEngine } from '../../lib/gameplay';
import { mekanikGameAnak } from '../../lib/gameSemantics';
import { keAppError } from '../../lib/errors/AppError';
import { bacaGame, simpanHasilGame } from '../../lib/storage/gameRepo';
import type { GamePembelajaran, JawabanButirGame, ModePermainanGame } from '../../lib/types';
import { RUTE } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { InteractiveGameStage } from './InteractiveGameStage';
import './game.css';

function bacakan(teks: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const ujaran = new SpeechSynthesisUtterance(teks);
  ujaran.lang = 'id-ID';
  window.speechSynthesis.speak(ujaran);
}

function bunyi(benar: boolean) {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const konteks = new AudioContextClass();
  const osilator = konteks.createOscillator();
  const volume = konteks.createGain();
  osilator.frequency.value = benar ? 660 : 190;
  osilator.type = benar ? 'sine' : 'square';
  volume.gain.setValueAtTime(0.12, konteks.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.001, konteks.currentTime + 0.22);
  osilator.connect(volume); volume.connect(konteks.destination);
  osilator.start(); osilator.stop(konteks.currentTime + 0.23);
  window.setTimeout(() => void konteks.close(), 300);
}

export function GameRunnerScreen() {
  const { gameId = '' } = useParams();
  const [parameter] = useSearchParams();
  const { akun } = useAuth();
  const [game, setGame] = useState<GamePembelajaran | null>(null);
  const [posisi, setPosisi] = useState(0);
  const [jawaban, setJawaban] = useState<JawabanButirGame[]>([]);
  const [selesai, setSelesai] = useState(false);
  const [pesan, setPesan] = useState('');
  const [feedback, setFeedback] = useState<'benar' | 'salah' | ''>('');
  const [mengunci, setMengunci] = useState(false);
  const [modeAktif, setModeAktif] = useState<ModePermainanGame>('individu');
  const [jumlahTim, setJumlahTim] = useState(2);
  const [timAktif, setTimAktif] = useState(0);
  const [skorTim, setSkorTim] = useState([0, 0, 0, 0]);
  const [timerAktif, setTimerAktif] = useState(false);
  const [sisaDetik, setSisaDetik] = useState<number | null>(null);
  const [suaraAktif, setSuaraAktif] = useState(true);
  const [combo, setCombo] = useState(0);
  const [comboMaks, setComboMaks] = useState(0);
  const [koin, setKoin] = useState(0);

  useEffect(() => {
    void bacaGame(gameId)
      .then((hasil) => {
        if (!hasil) { setPesan('Game tidak ditemukan.'); return; }
        setGame(hasil); setModeAktif(hasil.mode_permainan);
      })
      .catch((galat: unknown) => setPesan(keAppError(galat).message));
  }, [gameId]);

  const butir = game?.butir[posisi];
  const engine = GAME_ENGINE_FINAL.find((item) => item.kode === game?.engine_kode);
  const ringkasan = useMemo(() => ringkasPermainan(jawaban), [jawaban]);

  useEffect(() => {
    setSisaDetik(timerAktif ? game?.detik_per_butir ?? 30 : null);
  }, [butir?.id, game?.detik_per_butir, timerAktif]);

  useEffect(() => {
    if (!timerAktif || sisaDetik === null || sisaDetik <= 0 || selesai || mengunci) return;
    const id = window.setTimeout(() => setSisaDetik((nilai) => Math.max(0, (nilai ?? 1) - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [mengunci, selesai, sisaDetik, timerAktif]);

  const simpanHasil = useCallback(async (gameAktif: GamePembelajaran, daftarJawaban: JawabanButirGame[]) => {
    const siswaId = parameter.get('siswa');
    const kelompok = parameter.get('kelompok')?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];
    const sesiId = parameter.get('sesi');
    if ((!siswaId && !kelompok.length) || !sesiId || !akun) return;
    const ringkas = ringkasPermainan(daftarJawaban);
    if (siswaId) await simpanHasilGame(gameAktif.id, { siswaId, sesiId, dinilaiOleh: akun.id, jawaban: daftarJawaban, ringkasan: ringkas });
    for (const kelompokId of kelompok.slice(0, 4)) {
      await simpanHasilGame(gameAktif.id, { kelompokId, sesiId, dinilaiOleh: akun.id, jawaban: daftarJawaban, ringkasan: ringkas });
    }
  }, [akun, parameter]);

  const jawab = useCallback((nilaiJawaban: string, tim = timAktif) => {
    if (!game || !butir || mengunci) return;
    setMengunci(true);
    const nilai = nilaiJawabanGame(butir, nilaiJawaban);
    const baru = [...jawaban, nilai];
    setJawaban(baru); setFeedback(nilai.benar ? 'benar' : 'salah'); if (suaraAktif) bunyi(nilai.benar);
    if (nilai.benar) {
      const comboBaru = combo + 1;
      setCombo(comboBaru); setComboMaks((lama) => Math.max(lama, comboBaru));
      setKoin((lama) => lama + 5 + Math.min(comboBaru, 5));
    } else setCombo(0);
    if (modeAktif === 'battle' && nilai.benar) setSkorTim((lama) => lama.map((nilaiTim, indeks) => indeks === tim ? nilaiTim + 10 : nilaiTim));
    window.setTimeout(() => {
      setFeedback(''); setMengunci(false);
      if (posisi + 1 < game.butir.length) {
        setPosisi((lama) => lama + 1);
        if (modeAktif === 'battle') setTimAktif((lama) => (lama + 1) % jumlahTim);
        return;
      }
      setSelesai(true);
      void simpanHasil(game, baru).catch((galat: unknown) => setPesan(keAppError(galat).message));
    }, 620);
  }, [butir, combo, game, jawaban, jumlahTim, mengunci, modeAktif, posisi, simpanHasil, suaraAktif, timAktif]);

  useEffect(() => {
    if (timerAktif && sisaDetik === 0 && !mengunci && butir) jawab('__WAKTU_HABIS__');
  }, [butir, jawab, mengunci, sisaDetik, timerAktif]);

  if (!game || !butir || !engine) {
    return <main className="game-main game-main--status"><p>{pesan || 'Memuat game dari perangkat…'}</p><Link to={RUTE.game}>Kembali ke katalog</Link></main>;
  }

  if (selesai) {
    const rasio = ringkasan.skor_maksimal ? ringkasan.skor / ringkasan.skor_maksimal : 0;
    const bintang = rasio >= .85 ? 3 : rasio >= .6 ? 2 : 1;
    return <main className="game-main game-main--selesai" data-testid="hasil-game">
      <span className="game-main__logo">🏆</span><p>Victory! Petualangan selesai</p><h1>{game.judul}</h1>
      <div className="game-bintang" aria-label={`${bintang} bintang`}>{Array.from({ length: 3 }, (_, i) => <span className={i < bintang ? 'aktif' : ''} key={i}>★</span>)}</div>
      <div className="game-skor"><strong>{ringkasan.skor}</strong><span>dari {ringkasan.skor_maksimal} poin</span></div>
      <div className="game-hadiah"><span>🪙 {koin} koin</span><span>🔥 Combo terbaik {comboMaks}</span><span>🎒 Level {Math.ceil(game.butir.length / 3)}</span></div>
      {modeAktif === 'battle' ? <div className="game-hasil-tim">{skorTim.slice(0, jumlahTim).map((skor, indeks) => <span key={indeks}>Tim {indeks + 1}<b>{skor}</b></span>)}</div> : null}
      <p>{jawaban.filter((item) => item.benar).length} dari {jawaban.length} misi berhasil.</p>
      {pesan ? <p role="alert">{pesan}</p> : null}
      <div className="game-main__aksi"><Link to={RUTE.game}>Kembali ke katalog</Link><button type="button" onClick={() => { setPosisi(0); setJawaban([]); setSelesai(false); setSkorTim([0, 0, 0, 0]); setCombo(0); setComboMaks(0); setKoin(0); }}>Main lagi</button></div>
    </main>;
  }

  const mekanik = butir.mekanik_anak ?? mekanikGameAnak(engine);
  return <main className="game-main" data-testid="game-runner" data-gameplay={tipeGameplayEngine(engine)} data-mekanik={mekanik}>
    <header className="game-main__kepala">
      <Link to={RUTE.game} aria-label="Tutup game">×</Link>
      <div><span>{engine.nama} · {mekanik.replaceAll('_', ' ')}</span><strong>{game.judul}</strong></div>
      <div className="game-meta-skor"><span>Level <b>{Math.floor(posisi / 3) + 1}</b></span><span>🔥 <b>{combo}</b></span><span>🪙 <b>{koin}</b></span><span>Skor <b>{ringkasan.skor}</b></span></div>
      <div className="game-main__alat">
        <button type="button" className={suaraAktif ? 'aktif' : ''} onClick={() => setSuaraAktif((nilai) => !nilai)} aria-label="Aktifkan atau matikan suara">{suaraAktif ? '🔊' : '🔇'}</button>
        <button type="button" onClick={() => bacakan(butir.pertanyaan)} aria-label="Bacakan misi">🗣️</button>
        <button type="button" className={timerAktif ? 'aktif' : ''} onClick={() => setTimerAktif((nilai) => !nilai)} aria-label="Aktifkan atau matikan timer">⏱ {sisaDetik ?? '—'}</button>
        <button type="button" onClick={() => void document.documentElement.requestFullscreen?.()} aria-label="Layar penuh">⛶</button>
      </div>
    </header>
    <div className="game-main__progres"><span style={{ width: `${((posisi + 1) / game.butir.length) * 100}%` }}/></div>
    <section className="game-panggung">
      <div className="game-mode" aria-label="Mode permainan">
        {(['individu', 'kelompok', 'battle'] as const).map((mode) => <button type="button" key={mode} className={modeAktif === mode ? 'aktif' : ''} onClick={() => setModeAktif(mode)}>{mode === 'individu' ? '👤 Individu' : mode === 'kelompok' ? '👥 Kelompok' : '⚔ Battle'}</button>)}
        {modeAktif === 'battle' ? <label>Tim<select value={jumlahTim} onChange={(e) => setJumlahTim(Number(e.target.value))}><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label> : null}
      </div>
      <p>Misi {posisi + 1} dari {game.butir.length}</p>
      <div className="game-pertanyaan"><h1>{butir.pertanyaan}</h1></div>
      <InteractiveGameStage key={butir.id} butir={butir} engine={engine} mapelKode={game.mapel_kode} mode={modeAktif} jumlahTim={jumlahTim} onJawab={jawab}/>
      {feedback ? <div className={`game-feedback game-feedback--${feedback}`} role="status"><b>{feedback === 'benar' ? '✓ Misi berhasil!' : '↻ Coba strategi berikutnya'}</b><span>{feedback === 'benar' ? '+10 poin' : butir.penjelasan}</span></div> : null}
    </section>
  </main>;
}
