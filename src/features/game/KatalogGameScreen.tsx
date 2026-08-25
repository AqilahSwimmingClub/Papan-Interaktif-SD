import { Link } from 'react-router-dom';
import { GAME_KELAS5_IPAS_BAB2 } from './GameKelas5RunnerScreen';
import { RUTE } from '../../routes/paths';
import './game.css';

export function KatalogGameScreen() {
  return (
    <main className="halaman-kurikulum game-katalog" data-testid="katalog-game">
      <header className="kop-kurikulum game-katalog__kop">
        <div>
          <p className="label-data">Kelas V · master/percontohan</p>
          <h1>Game Edukasi</h1>
          <p>Game pertama sudah dibangun dari Buku IPAS Kelas V, Bab 2: Harmoni dalam Ekosistem.</p>
        </div>
        <div className="game-katalog__angka"><strong>{GAME_KELAS5_IPAS_BAB2.length}</strong><span>game playable</span><strong>1</strong><span>bab aktif</span></div>
      </header>

      <div className="game-rantai" aria-label="Sumber konten">
        <span>Kelas V</span><b>›</b><span>IPAS</span><b>›</b><span>Bab 2</span><b>›</b><span>Harmoni dalam Ekosistem</span>
      </div>

      <section className="game-grid" aria-label="Game IPAS Kelas V Bab 2">
        {GAME_KELAS5_IPAS_BAB2.map((game,indeks)=>(
          <article className="game-card" key={game.kode}>
            <div className={`game-card__ikon game-card__ikon--${(indeks%5)+1}`}>{game.ikon}</div>
            <div className="game-card__isi">
              <p>{game.topik}</p>
              <h2>{game.judul}</h2>
              <small>{game.tujuan}</small>
              <div><span>{game.mekanik}</span><span>Playable</span><span>Kelas V</span></div>
            </div>
            <Link to={`${RUTE.game}/${game.kode}`}>Mainkan <span>→</span></Link>
          </article>
        ))}
      </section>

      <section className="game-catatan">
        <h2>Status pengembangan Kelas V</h2>
        <p>Bab dan mapel lain akan mengikuti struktur Buku Referensi Kelas V yang sudah masuk. Konten belum dibuat jika rincian buku belum tersedia, agar tidak mengarang materi.</p>
      </section>
    </main>
  );
}
