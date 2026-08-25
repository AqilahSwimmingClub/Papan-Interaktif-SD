import { Link } from 'react-router-dom';
import { GAME_KELAS5_IPAS_BAB1 } from './GameKelas5Bab1Screen';
import { GAME_KELAS5_IPAS_BAB2 } from './GameKelas5RunnerScreen';
import { GAME_KELAS5_IPAS_BAB3 } from './GameKelas5Bab3Screen';
import { RUTE } from '../../routes/paths';
import './game.css';

const BAGIAN = [
  { bab:1, judul:'Melihat karena Cahaya, Mendengar karena Bunyi', ringkas:'cahaya, proses melihat, bunyi, dan proses mendengar', games:GAME_KELAS5_IPAS_BAB1, rute:(kode:string)=>`${RUTE.game}/kelas5-bab1/${kode}` },
  { bab:2, judul:'Harmoni dalam Ekosistem', ringkas:'rantai makanan, jaring-jaring makanan, aliran energi, dan keseimbangan ekosistem', games:GAME_KELAS5_IPAS_BAB2, rute:(kode:string)=>`${RUTE.game}/${kode}` },
  { bab:3, judul:'Magnet, Listrik, dan Teknologi untuk Kehidupan', ringkas:'magnet, rangkaian listrik, sumber energi, dan pemanfaatan teknologi', games:GAME_KELAS5_IPAS_BAB3, rute:(kode:string)=>`${RUTE.game}/kelas5-bab3/${kode}` },
] as const;

export function KatalogGameScreen() {
  const total = BAGIAN.reduce((jumlah,b)=>jumlah+b.games.length,0);
  return <main className="halaman-kurikulum game-katalog" data-testid="katalog-game">
    <header className="kop-kurikulum game-katalog__kop"><div><p className="label-data">Kelas V · master/percontohan</p><h1>Game Edukasi</h1><p>Konten playable mengikuti Buku IPAS Kelas V. Bab 1–3 sudah aktif.</p></div><div className="game-katalog__angka"><strong>{total}</strong><span>game playable</span><strong>{BAGIAN.length}</strong><span>bab aktif</span></div></header>
    <div className="game-rantai"><span>Kelas V</span><b>›</b><span>IPAS</span><b>›</b><span>Buku Referensi</span></div>
    {BAGIAN.map((bagian)=><section key={bagian.bab}><div className="game-catatan"><h2>Bab {bagian.bab} · {bagian.judul}</h2><p>5 game: {bagian.ringkas}.</p></div><div className="game-grid" aria-label={`Game IPAS Kelas V Bab ${bagian.bab}`}>{bagian.games.map((game,indeks)=><article className="game-card" key={game.kode}><div className={`game-card__ikon game-card__ikon--${(indeks%5)+1}`}>{game.ikon}</div><div className="game-card__isi"><p>{game.topik}</p><h2>{game.judul}</h2><small>{game.tujuan}</small><div><span>{game.mekanik}</span><span>Playable</span><span>Bab {bagian.bab}</span></div></div><Link to={bagian.rute(game.kode)}>Mainkan <span>→</span></Link></article>)}</div></section>)}
  </main>;
}
