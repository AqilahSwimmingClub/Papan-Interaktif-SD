import { Link } from 'react-router-dom';
import { GAME_KELAS5_IPAS_BAB1 } from './GameKelas5Bab1Screen';
import { GAME_KELAS5_IPAS_BAB2 } from './GameKelas5RunnerScreen';
import { RUTE } from '../../routes/paths';
import './game.css';

export function KatalogGameScreen() {
  const total = GAME_KELAS5_IPAS_BAB1.length + GAME_KELAS5_IPAS_BAB2.length;
  return (
    <main className="halaman-kurikulum game-katalog" data-testid="katalog-game">
      <header className="kop-kurikulum game-katalog__kop">
        <div>
          <p className="label-data">Kelas V · master/percontohan</p>
          <h1>Game Edukasi</h1>
          <p>Konten playable mengikuti Buku IPAS Kelas V. Bab 1 dan Bab 2 sudah aktif.</p>
        </div>
        <div className="game-katalog__angka"><strong>{total}</strong><span>game playable</span><strong>2</strong><span>bab aktif</span></div>
      </header>

      <div className="game-rantai"><span>Kelas V</span><b>›</b><span>IPAS</span><b>›</b><span>Buku Referensi</span></div>

      <section className="game-catatan"><h2>Bab 1 · Melihat karena Cahaya, Mendengar karena Bunyi</h2><p>5 game: cahaya, proses melihat, bunyi, dan proses mendengar.</p></section>
      <section className="game-grid" aria-label="Game IPAS Kelas V Bab 1">
        {GAME_KELAS5_IPAS_BAB1.map((game,indeks)=>(
          <article className="game-card" key={game.kode}>
            <div className={`game-card__ikon game-card__ikon--${(indeks%5)+1}`}>{game.ikon}</div>
            <div className="game-card__isi"><p>{game.topik}</p><h2>{game.judul}</h2><small>{game.tujuan}</small><div><span>{game.mekanik}</span><span>Playable</span><span>Bab 1</span></div></div>
            <Link to={`${RUTE.game}/kelas5-bab1/${game.kode}`}>Mainkan <span>→</span></Link>
          </article>
        ))}
      </section>

      <section className="game-catatan"><h2>Bab 2 · Harmoni dalam Ekosistem</h2><p>5 game: rantai makanan, jaring-jaring makanan, aliran energi, dan keseimbangan ekosistem.</p></section>
      <section className="game-grid" aria-label="Game IPAS Kelas V Bab 2">
        {GAME_KELAS5_IPAS_BAB2.map((game,indeks)=>(
          <article className="game-card" key={game.kode}>
            <div className={`game-card__ikon game-card__ikon--${(indeks%5)+1}`}>{game.ikon}</div>
            <div className="game-card__isi"><p>{game.topik}</p><h2>{game.judul}</h2><small>{game.tujuan}</small><div><span>{game.mekanik}</span><span>Playable</span><span>Bab 2</span></div></div>
            <Link to={`${RUTE.game}/${game.kode}`}>Mainkan <span>→</span></Link>
          </article>
        ))}
      </section>
    </main>
  );
}
