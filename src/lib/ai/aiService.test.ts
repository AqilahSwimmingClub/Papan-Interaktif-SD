import { afterEach, describe, expect, it, vi } from 'vitest';
import { bacaStatusKonfigurasiAi, GalatAi, mintaGenerasiAi, statusOperasionalAi, type PermintaanGenerasiAi } from './aiService';

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

  it('menerjemahkan rate limit tanpa retry', async () => {
    jaringan(true);
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 429, json: async () => ({ ok: false, kode: 'AI_RATE_LIMIT', pesan: 'Terlalu banyak permintaan.' }) } as Response);
    await expect(mintaGenerasiAi(permintaan)).rejects.toMatchObject({ kode: 'AI_RATE_LIMIT' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('melaporkan timeout setelah satu retry aman', async () => {
    jaringan(true); vi.useFakeTimers();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Batas waktu', 'AbortError'));
    const proses = mintaGenerasiAi(permintaan);
    const penolakan = expect(proses).rejects.toMatchObject({ kode: 'AI_TIMEOUT' });
    await vi.advanceTimersByTimeAsync(700);
    await penolakan;
    vi.useRealTimers();
  });

  it('membedakan backend unavailable dari API key yang belum tersedia', async () => {
    jaringan(true);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    let tertangkap: unknown;
    try { await bacaStatusKonfigurasiAi('openai'); } catch (galat) { tertangkap = galat; }
    expect(statusOperasionalAi(tertangkap)).toBe('SERVER TIDAK DAPAT DIJANGKAU');
    expect(statusOperasionalAi(new GalatAi('AI_NOT_CONFIGURED', 'Belum ada key'))).toBe('API KEY BELUM TERSEDIA');
  });

  it('menolak paket Bank Soal yang tidak berisi tepat 25 soal', async () => {
    jaringan(true);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, hasil: { judul: 'Bank Soal', ringkasan: 'Draf', butir: [{ pertanyaan: 'Satu soal', jawaban: 'Kunci', pilihan: [], pembahasan: '', rubrik: '' }] } }) } as Response);
    await expect(mintaGenerasiAi({ ...permintaan, jumlah: 25, kendali: { paket_bank_soal: '10 pilihan ganda + 10 menjodohkan + 5 esai' } })).rejects.toMatchObject({ kode: 'AI_INVALID_RESPONSE' });
  });
});
