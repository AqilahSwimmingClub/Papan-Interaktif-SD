import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GAME_ENGINE_FINAL } from '../../lib/gameEngines';
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

describe('gameplay anak SD yang benar-benar dimainkan', () => {
  it('memetakan 60 engine ke seluruh 24 dunia game dan hanya tiga engine khusus kuis', () => {
    expect(Object.keys(semuaPemetaanGameplay())).toHaveLength(60);
    expect(Object.keys(MEKANIK_PER_ENGINE)).toHaveLength(60);
    expect(GAME_ENGINE_FINAL.every((item) => Boolean(tipeGameplayEngine(item)) && Boolean(mekanikGameAnak(item)))).toBe(true);
    expect(GAME_ENGINE_FINAL.filter((item) => mekanikGameAnak(item) === 'kuis')).toHaveLength(3);
    const dunia = new Set(Object.values(MEKANIK_PER_ENGINE).filter((item) => item !== 'kuis'));
    expect(dunia.size).toBe(24);
  });

  it('BI membuka tiga kunci Escape Room Detektif dengan petunjuk yang tepat', async () => {
    const jawab = stage('detektif-bacaan', 'BI'); const pengguna = userEvent.setup();
    expect(screen.getByRole('region', { name: 'Escape Room' })).toBeVisible();
    for (let i = 0; i < 3; i += 1) await pengguna.click(screen.getAllByRole('button', { name: /air/i })[0]!);
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });

  it('Matematika menjalankan Number Adventure pada garis angka manipulatif', async () => {
    const butir = { ...dasar, id: 'MAT', pilihan: ['2', '3', '4', '6'], jawaban: '4', mekanik_anak: 'number_adventure' as MekanikGameAnak };
    const jawab = stage('garis-bilangan', 'MAT', butir); const pengguna = userEvent.setup();
    await pengguna.click(screen.getByRole('button', { name: /4/ }));
    expect(jawab).toHaveBeenCalledWith('4', 0);
    expect(screen.getAllByText('●')).toHaveLength(4);
  });

  it('IPAS mengatur dan menyalakan Science Lab sebelum memilih bahan', async () => {
    const jawab = stage('uji-hipotesis', 'IPAS'); const pengguna = userEvent.setup();
    const bahan = screen.getByRole('button', { name: /air/i });
    expect(bahan).toBeDisabled();
    await pengguna.click(screen.getByRole('button', { name: 'Nyalakan alat' }));
    expect(bahan).toBeEnabled(); await pengguna.click(bahan);
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });

  it('Pancasila merebut wilayah untuk satu dari empat tim', async () => {
    const jawab = stage('musyawarah-kelas', 'PP', dasar, 4); const pengguna = userEvent.setup();
    await pengguna.click(screen.getByRole('button', { name: 'Tim 3' }));
    await pengguna.click(screen.getAllByRole('button', { name: /air/i })[0]!);
    expect(jawab).toHaveBeenCalledWith('air', 2);
  });

  it.each([
    ['KKA', 'coding-blocks', 'Coding Quest', 'Jalankan robot'],
    ['PJOK', 'sirkuit-gerak', 'Pjok Motion', 'Selesaikan sirkuit'],
    ['SMUS', 'pola-irama', 'Music Rhythm', 'Mainkan pola'],
    ['RUPA', 'galeri-warna-bentuk', 'Art Stage', 'Pasang keping'],
  ])('%s menyusun objek dan menjalankan %s, bukan menjawab kartu A-E', async (mapelKode, kode, namaRegion, aksi) => {
    const pengguna = userEvent.setup();
    const butir = { ...dasar, id: kode, pilihan: ['ketiga', 'pertama', 'kedua'], jawaban: 'pertama → kedua → ketiga' };
    const jawab = stage(kode, mapelKode, butir);
    expect(screen.getByRole('region', { name: namaRegion })).toBeVisible();
    for (const nama of ['pertama', 'kedua', 'ketiga']) await pengguna.click(screen.getByRole('button', { name: new RegExp(nama) }));
    await pengguna.click(screen.getByRole('button', { name: aksi }));
    expect(jawab).toHaveBeenCalledWith(butir.jawaban, 0);
    expect(screen.queryByText(/^[A-E]$/)).not.toBeInTheDocument();
  });

  it('PADB memainkan Story Adventure melalui keputusan tokoh, bukan teks CP', async () => {
    const jawab = stage('jejak-keteladanan', 'PAI'); const pengguna = userEvent.setup();
    expect(screen.getByRole('region', { name: 'Story Adventure' })).toBeVisible();
    await pengguna.click(screen.getByRole('button', { name: /air/i }));
    expect(jawab).toHaveBeenCalledWith('air', 0);
    expect(screen.queryByText(/TP aktif|CP aktif/i)).not.toBeInTheDocument();
  });

  it('Maze Adventure menggerakkan karakter, menghindari rintangan, lalu mencapai piala', async () => {
    const jawab = stage('maze-labirin', 'KKA'); const pengguna = userEvent.setup();
    for (let i = 0; i < 4; i += 1) await pengguna.click(screen.getByRole('button', { name: 'Kanan' }));
    for (let i = 0; i < 4; i += 1) await pengguna.click(screen.getByRole('button', { name: 'Bawah' }));
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });

  it('Balloon Pop memakai sasaran bergerak dan menyelesaikan misi lewat balon', async () => {
    const jawab = stage('siapa-cepat', 'BI'); const pengguna = userEvent.setup();
    expect(screen.getByRole('region', { name: 'Balloon Pop' })).toBeVisible();
    await pengguna.click(screen.getByRole('button', { name: /air/i }));
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });
});
