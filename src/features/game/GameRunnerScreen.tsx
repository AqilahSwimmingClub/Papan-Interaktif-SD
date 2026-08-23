import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { GAME_ENGINE_FINAL, nilaiJawabanGame, PROFIL_FASE_GAME, ringkasPermainan } from '../../lib/gameEngines';
import { keAppError } from '../../lib/errors/AppError';
import { bacaGame, simpanHasilGame } from '../../lib/storage/gameRepo';
import type { GamePembelajaran, JawabanButirGame } from '../../lib/types';
import { RUTE } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import './game.css';

function bacakan(teks: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const ujaran = new SpeechSynthesisUtterance(teks);
  ujaran.lang = 'id-ID';
  window.speechSynthesis.speak(ujaran);
}

export function GameRunnerScreen() {
  const { gameId = '' } = useParams();
  const [parameter] = useSearchParams();
  const { akun } = useAuth();
  const [game, setGame] = useState<GamePembelajaran | null>(null);
  const [posisi, setPosisi] = useState(0);
  const [jawaban, setJawaban] = useState<JawabanButirGame[]>([]);
  const [pilihan, setPilihan] = useState('');
  const [selesai, setSelesai] = useState(false);
  const [pesan, setPesan] = useState('');

  useEffect(() => {
    void bacaGame(gameId)
      .then((hasil) => hasil ? setGame(hasil) : setPesan('Game tidak ditemukan.'))
      .catch((galat: unknown) => setPesan(keAppError(galat).message));
  }, [gameId]);

  const butir = game?.butir[posisi];
  const engine = GAME_ENGINE_FINAL.find((item) => item.kode === game?.engine_kode);
  const ringkasan = useMemo(() => ringkasPermainan(jawaban), [jawaban]);

  async function lanjut() {
    if (!game || !butir || !pilihan) return;
    const nilai = nilaiJawabanGame(butir, pilihan);
    const baru = [...jawaban, nilai];
    setJawaban(baru);
    setPilihan('');
    if (posisi + 1 < game.butir.length) {
      setPosisi(posisi + 1);
      return;
    }
    setSelesai(true);
    const siswaId = parameter.get('siswa');
    const sesiId = parameter.get('sesi');
    if (siswaId && sesiId && akun) {
      try {
        await simpanHasilGame(game.id, {
          siswaId,
          sesiId,
          dinilaiOleh: akun.id,
          jawaban: baru,
          ringkasan: ringkasPermainan(baru),
        });
      } catch (galat) {
        setPesan(keAppError(galat).message);
      }
    }
  }

  if (!game || !butir) {
    return <main className="game-main game-main--status"><p>{pesan || 'Memuat game dari perangkat…'}</p><Link to={RUTE.game}>Kembali ke katalog</Link></main>;
  }

  if (selesai) {
    return (
      <main className="game-main game-main--selesai" data-testid="hasil-game">
        <span className="game-main__logo">PI</span><p>Permainan selesai</p><h1>{game.judul}</h1>
        <div className="game-skor"><strong>{ringkasan.skor}</strong><span>dari {ringkasan.skor_maksimal} poin</span></div>
        <p>{jawaban.filter((item) => item.benar).length} dari {jawaban.length} jawaban benar.</p>
        {pesan ? <p role="alert">{pesan}</p> : null}
        <div className="game-main__aksi"><Link to={RUTE.game}>Kembali ke katalog</Link><button type="button" onClick={() => { setPosisi(0); setJawaban([]); setSelesai(false); }}>Main lagi</button></div>
      </main>
    );
  }

  const profil = PROFIL_FASE_GAME[game.fase_kode];
  return (
    <main className="game-main" data-testid="game-runner">
      <header className="game-main__kepala">
        <Link to={RUTE.game} aria-label="Tutup game">×</Link>
        <div><span>{engine?.nama}</span><strong>{game.judul}</strong></div>
        <p>Skor <b>{ringkasan.skor}</b></p>
      </header>
      <div className="game-main__progres"><span style={{ width: `${((posisi + 1) / game.butir.length) * 100}%` }} /></div>
      <section className="game-panggung">
        <p>Soal {posisi + 1} dari {game.butir.length} · {engine?.petunjuk}</p>
        <div className="game-pertanyaan">
          <button type="button" onClick={() => bacakan(`${butir.pertanyaan}. ${butir.pilihan.join('. ')}`)} aria-label="Bacakan soal">🔊</button>
          <h1>{butir.pertanyaan}</h1>
        </div>
        <div className={`game-pilihan game-pilihan--${Math.min(butir.pilihan.length, profil.jumlah_pilihan)}`}>
          {butir.pilihan.slice(0, profil.jumlah_pilihan).map((item, indeks) => (
            <button key={`${butir.id}-${indeks}`} type="button" className={pilihan === item ? 'terpilih' : ''} onClick={() => setPilihan(item)}>
              <span>{String.fromCharCode(65 + indeks)}</span>{item}
            </button>
          ))}
        </div>
        <button className="game-lanjut" type="button" disabled={!pilihan} onClick={() => void lanjut()}>
          {posisi + 1 === game.butir.length ? 'Lihat hasil' : 'Jawab & lanjut'}
        </button>
      </section>
    </main>
  );
}
