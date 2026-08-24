import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GAME_ENGINE_FINAL } from '../../lib/gameEngines';
import { semuaPemetaanGameplay, tipeGameplayEngine } from '../../lib/gameplay';
import type { ButirGame } from '../../lib/types';
import { InteractiveGameStage } from './InteractiveGameStage';

const butir: ButirGame = { id: 'BUTIR-UJI', pertanyaan: 'Seret bukti air ke papan.', pilihan: ['air', 'tanah', 'api', 'angin'], jawaban: 'air', penjelasan: 'Latihan topik.', sumber: 'materi' };
const engine = (kode: string) => GAME_ENGINE_FINAL.find((item) => item.kode === kode)!;

describe('runner gameplay visual', () => {
  it('memetakan seluruh 60 engine ke gameplay nyata dan hanya tiga engine khusus kuis', () => {
    expect(Object.keys(semuaPemetaanGameplay())).toHaveLength(60);
    expect(GAME_ENGINE_FINAL.every((item) => Boolean(tipeGameplayEngine(item)))).toBe(true);
    expect(GAME_ENGINE_FINAL.filter((item) => tipeGameplayEngine(item) === 'kuis')).toHaveLength(3);
  });

  it('memainkan drag and drop dengan fallback sentuh tanpa pilihan A-E', async () => {
    const jawab = vi.fn(); const pengguna = userEvent.setup();
    render(<InteractiveGameStage butir={butir} engine={engine('detektif-bacaan')} mapelKode="BI" mode="individu" jumlahTim={2} onJawab={jawab}/>);
    await pengguna.click(screen.getByRole('button', { name: /air/i }));
    await pengguna.click(screen.getByRole('button', { name: /Papan bukti/i }));
    expect(jawab).toHaveBeenCalledWith('air', 0);
    expect(screen.queryByText(/^[A-E]$/)).not.toBeInTheDocument();
  });

  it('memainkan susun urutan dan coding sebagai blok yang dapat disentuh', async () => {
    const jawab = vi.fn(); const pengguna = userEvent.setup();
    const susun = { ...butir, pilihan: ['ketiga', 'pertama', 'kedua'], jawaban: 'pertama → kedua → ketiga' };
    render(<InteractiveGameStage butir={susun} engine={engine('coding-blocks')} mapelKode="KKA" mode="kelompok" jumlahTim={2} onJawab={jawab}/>);
    for (const nama of ['pertama', 'kedua', 'ketiga']) await pengguna.click(screen.getByRole('button', { name: new RegExp(nama) }));
    await pengguna.click(screen.getByRole('button', { name: 'Jalankan susunan' }));
    expect(jawab).toHaveBeenCalledWith(susun.jawaban, 0);
  });

  it('memainkan maze dengan kontrol arah besar sampai garis akhir', async () => {
    const jawab = vi.fn(); const pengguna = userEvent.setup();
    render(<InteractiveGameStage butir={butir} engine={engine('maze-labirin')} mapelKode="KKA" mode="individu" jumlahTim={2} onJawab={jawab}/>);
    for (let i = 0; i < 4; i += 1) await pengguna.click(screen.getByRole('button', { name: 'Kanan' }));
    for (let i = 0; i < 4; i += 1) await pengguna.click(screen.getByRole('button', { name: 'Bawah' }));
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });

  it('memainkan board game dengan dadu sampai tujuan', async () => {
    const jawab = vi.fn(); const pengguna = userEvent.setup();
    render(<InteractiveGameStage butir={butir} engine={engine('bingo-edukasi')} mapelKode="IPAS" mode="seluruh_kelas" jumlahTim={2} onJawab={jawab}/>);
    const dadu = screen.getByRole('button', { name: 'Lempar dadu' });
    for (let i = 0; i < 12; i += 1) await pengguna.click(dadu);
    expect(jawab).toHaveBeenCalledWith('air', 0);
  });
});
