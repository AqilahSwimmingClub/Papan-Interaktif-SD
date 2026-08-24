import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GAME_ENGINE_FINAL } from '../../lib/gameEngines';
import { MEKANIK_GAME_V2 } from '../../lib/gameMechanicsV2';
import { MEKANIK_PER_ENGINE, mekanikGameAnak } from '../../lib/gameSemantics';
import { semuaPemetaanGameplay, tipeGameplayEngine } from '../../lib/gameplay';
import type { ButirGame, GameEngine, MekanikGameAnak } from '../../lib/types';
import { InteractiveGameStage } from './InteractiveGameStage';

const dasar: ButirGame = { id: 'BUTIR-UJI', pertanyaan: 'Selesaikan misi visual.', pilihan: ['air', 'tanah', 'api', 'angin'], jawaban: 'air', penjelasan: 'Latihan topik.', sumber: 'materi', narasi: 'Kiko menemukan petunjuk di dunia permainan.' };
const engine = (kode: string): GameEngine => GAME_ENGINE_FINAL.find((item) => item.kode === kode)!;
const stage = (kode: string, mapelKode: string, butir = dasar, jumlahTim = 2) => {
  const jawab = vi.fn();
  render(<InteractiveGameStage butir={butir} engine={engine(kode)} mapelKode={mapelKode} mode="individu" jumlahTim={jumlahTim} onJawab={jawab}/>);
  return jawab;
};

describe('Game Edukasi V2 yang benar-benar dimainkan', () => {
  it('mendaftarkan tepat 40 keluarga playable dan memetakan 60 engine dengan kuis sebagai mode khusus', () => {
    expect(MEKANIK_GAME_V2).toHaveLength(40);
    expect(new Set(MEKANIK_GAME_V2.map((item) => item.kode))).toHaveLength(40);
    expect(Object.keys(semuaPemetaanGameplay())).toHaveLength(60);
    expect(Object.keys(MEKANIK_PER_ENGINE)).toHaveLength(60);
    expect(GAME_ENGINE_FINAL.every((item) => Boolean(tipeGameplayEngine(item)) && Boolean(mekanikGameAnak(item)))).toBe(true);
    expect(GAME_ENGINE_FINAL.filter((item) => mekanikGameAnak(item) === 'kuis')).toHaveLength(3);
    expect(new Set(Object.values(MEKANIK_PER_ENGINE).filter((item) => item !== 'kuis'))).toHaveLength(40);
  });

  it('BI mengumpulkan tiga bukti di Reading Detective sebelum skor dikirim', async () => {
    const jawab = stage('detektif-bacaan', 'BI'); const pengguna = userEvent.setup();
    expect(screen.getByRole('region', { name: 'Reading Detective' })).toBeVisible();
    const bukti = screen.getAllByRole('button', { name: /air/i })[0]!;
    await pengguna.click(bukti); await pengguna.click(bukti);
    expect(jawab).not.toHaveBeenCalled();
    await pengguna.click(bukti);
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });

  it('Matematika menjalankan Number Adventure dengan benda manipulatif', async () => {
    const butir = { ...dasar, id: 'MAT', pilihan: ['2', '3', '4', '6'], jawaban: '4', mekanik_anak: 'number_adventure' as MekanikGameAnak };
    const jawab = stage('garis-bilangan', 'MAT', butir); const pengguna = userEvent.setup();
    expect(screen.getByRole('region', { name: 'Number Adventure' })).toBeVisible();
    expect(screen.getByRole('group', { name: 'Benda hitung' }).querySelectorAll('button')).toHaveLength(4);
    await pengguna.click(screen.getByRole('button', { name: /4/ }));
    expect(jawab).toHaveBeenCalledWith('4', 0);
  });

  it('IPAS merakit alat, mengubah variabel, menjalankan Science Mission, lalu memilih bahan', async () => {
    const jawab = stage('uji-hipotesis', 'IPAS'); const pengguna = userEvent.setup();
    const bahan = screen.getByRole('button', { name: /air/i });
    const jalan = screen.getByRole('button', { name: '▶ Jalankan eksperimen' });
    expect(jalan).toBeDisabled(); expect(bahan).toBeDisabled();
    for (const nama of ['sumber', 'wadah', 'sensor']) await pengguna.click(screen.getByRole('button', { name: new RegExp(nama) }));
    fireEvent.change(screen.getByRole('slider', { name: 'Variabel percobaan' }), { target: { value: '80' } });
    expect(jalan).toBeEnabled(); await pengguna.click(jalan);
    expect(screen.getByText(/Output visual:/)).toHaveTextContent('11');
    expect(bahan).toBeEnabled(); await pengguna.click(bahan);
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });

  it('Pancasila merebut tiga wilayah untuk satu dari empat tim', async () => {
    const jawab = stage('musyawarah-kelas', 'PP', dasar, 4); const pengguna = userEvent.setup();
    await pengguna.click(screen.getByRole('button', { name: 'Tim 3' }));
    const petak = screen.getAllByRole('button', { name: /air/i })[0]!;
    await pengguna.click(petak); await pengguna.click(petak); await pengguna.click(petak);
    expect(jawab).toHaveBeenCalledWith('air', 2);
  });

  it.each([
    ['KKA', 'coding-blocks', 'Coding Quest', 'Jalankan robot'],
    ['PJOK', 'sirkuit-gerak', 'Movement/PJOK Challenge', 'Selesaikan sirkuit'],
    ['SMUS', 'pola-irama', 'Rhythm Game', 'Mainkan pola'],
    ['RUPA', 'galeri-warna-bentuk', 'Art Puzzle', 'Pasang keping'],
  ])('%s menyusun objek dan menjalankan %s, bukan menjawab kartu A-E', async (mapelKode, kode, namaRegion, aksi) => {
    const pengguna = userEvent.setup();
    const butir = { ...dasar, id: kode, pilihan: ['ketiga', 'pertama', 'kedua'], jawaban: 'pertama → kedua → ketiga' };
    const jawab = stage(kode, mapelKode, butir);
    expect(screen.getByRole('region', { name: namaRegion })).toBeVisible();
    for (const nama of ['pertama', 'kedua', 'ketiga']) await pengguna.click(screen.getByRole('button', { name: new RegExp(`^.+${nama}$`) }));
    await pengguna.click(screen.getByRole('button', { name: aksi }));
    expect(jawab).toHaveBeenCalledWith(butir.jawaban, 0);
    expect(screen.queryByText(/^[A-E]$/)).not.toBeInTheDocument();
  });

  it('PADB memainkan Scenario Adventure melalui keputusan tokoh, bukan teks CP', async () => {
    const jawab = stage('jejak-keteladanan', 'PAI'); const pengguna = userEvent.setup();
    expect(screen.getByRole('region', { name: 'Scenario Adventure' })).toBeVisible();
    await pengguna.click(screen.getByRole('button', { name: /air/i }));
    expect(jawab).toHaveBeenCalledWith('air', 0);
    expect(screen.queryByText(/TP aktif|CP aktif/i)).not.toBeInTheDocument();
  });

  it('Maze Adventure menggerakkan karakter, menahan collision, lalu mencapai piala', async () => {
    const jawab = stage('maze-labirin', 'KKA'); const pengguna = userEvent.setup();
    await pengguna.click(screen.getByRole('button', { name: 'Bawah' }));
    expect(screen.getByRole('region', { name: 'Maze Adventure' }).querySelector('[data-position="5"]')).toBeTruthy();
    await pengguna.click(screen.getByRole('button', { name: 'Kanan' }));
    expect(screen.getByRole('region', { name: 'Maze Adventure' }).querySelector('[data-position="5"]')).toBeTruthy();
    await pengguna.click(screen.getByRole('button', { name: 'Atas' }));
    for (let i = 0; i < 4; i += 1) await pengguna.click(screen.getByRole('button', { name: 'Kanan' }));
    for (let i = 0; i < 4; i += 1) await pengguna.click(screen.getByRole('button', { name: 'Bawah' }));
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });

  it('Balloon Pop memakai pointer, target bergerak, progress, dan completion', async () => {
    const jawab = stage('siapa-cepat', 'BI'); const pengguna = userEvent.setup();
    const balon = screen.getByRole('button', { name: /air/i });
    await pengguna.click(balon); await pengguna.click(balon); await pengguna.click(balon);
    expect(screen.getByText(/3\/3/)).toBeVisible();
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });

  it('Sorting Factory menerima drag/drop dan baru selesai setelah tiga paket benar', () => {
    const jawab = stage('drag-drop', 'IPAS');
    const gerbang = screen.getByRole('button', { name: /Gerbang misi/ });
    const transfer = { getData: () => 'air', setData: vi.fn() };
    for (let i = 0; i < 3; i += 1) fireEvent.drop(gerbang, { dataTransfer: transfer });
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });
});
