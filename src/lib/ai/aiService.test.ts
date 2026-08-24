import { afterEach, describe, expect, it, vi } from 'vitest';
import { GalatAi, mintaGenerasiAi, type PermintaanGenerasiAi } from './aiService';

const permintaan: PermintaanGenerasiAi = {
  jenis: 'soal', prompt: 'Buat soal.', jumlah: 1, kendali: {},
  konteks: { tingkatKelas: 3, faseKode: 'B', mapelKode: 'IPAS', cpId: 'CP', tpId: 'TP', cp: 'CP terverifikasi', tp: 'TP aktif', referensi: [], terverifikasi: true },
};

function jaringan(online: boolean) { Object.defineProperty(navigator, 'onLine', { configurable: true, value: online }); }

describe('layanan AI client', () => {
  afterEach(() => { vi.restoreAllMocks(); jaringan(true); });

  it('memvalidasi respons terstruktur dari endpoint server-side', async () => {
    jaringan(true);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, hasil: { judul: 'Soal IPAS', ringkasan: 'Draf', butir: [{ pertanyaan: 'Apa perubahan air?', jawaban: 'Menguap', pilihan: ['Menguap', 'Membeku'], pembahasan: 'Sesuai materi.', rubrik: '' }] } }) } as Response);
    await expect(mintaGenerasiAi(permintaan)).resolves.toMatchObject({ judul: 'Soal IPAS', butir: [{ jawaban: 'Menguap' }] });
  });

  it('memberi status konfigurasi yang jelas tanpa membocorkan secret', async () => {
    jaringan(true);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 503, json: async () => ({ ok: false, kode: 'AI_NOT_CONFIGURED', pesan: 'Layanan AI belum dikonfigurasi oleh administrator.' }) } as Response);
    await expect(mintaGenerasiAi(permintaan)).rejects.toMatchObject({ kode: 'AI_NOT_CONFIGURED', message: 'Layanan AI belum dikonfigurasi oleh administrator.' });
  });

  it('menganggap fallback HTML SPA sebagai endpoint yang belum dikonfigurasi', async () => {
    jaringan(true);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('Bukan JSON'); },
    } as unknown as Response);
    await expect(mintaGenerasiAi(permintaan)).rejects.toMatchObject({
      kode: 'AI_NOT_CONFIGURED',
      message: 'Layanan AI belum dikonfigurasi oleh administrator.',
    });
  });

  it('menjelaskan endpoint 404 sebagai layanan yang belum dikonfigurasi', async () => {
    jaringan(true);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => { throw new SyntaxError('Bukan JSON'); },
    } as unknown as Response);
    await expect(mintaGenerasiAi(permintaan)).rejects.toMatchObject({
      kode: 'AI_NOT_CONFIGURED',
      message: 'Layanan AI belum dikonfigurasi oleh administrator.',
    });
  });

  it('tidak memanggil jaringan ketika offline', async () => {
    jaringan(false); const fetchMock = vi.spyOn(globalThis, 'fetch');
    await expect(mintaGenerasiAi(permintaan)).rejects.toEqual(expect.objectContaining<Partial<GalatAi>>({ kode: 'AI_OFFLINE' }));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
