import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../../../api/ai/generate';

afterEach(() => {
  delete process.env.AI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.AI_PROVIDER;
  vi.unstubAllGlobals();
});

describe('endpoint server-side AI', () => {
  it('melaporkan status OpenAI dan Gemini tanpa membocorkan secret', async () => {
    process.env.OPENAI_API_KEY = 'openai-rahasia';
    process.env.GEMINI_API_KEY = 'gemini-rahasia';
    let status = 0; let hasil: unknown;
    const respons = { status(kode: number) { status = kode; return this; }, setHeader() {}, json(nilai: unknown) { hasil = nilai; } };
    await handler({ method: 'GET', headers: {}, query: { provider: 'gemini' } }, respons);
    expect(status).toBe(200);
    expect(hasil).toMatchObject({ ok: true, status: { providerAktif: 'gemini', provider: { openai: { tersedia: true }, gemini: { tersedia: true } } } });
    expect(JSON.stringify(hasil)).not.toContain('openai-rahasia');
    expect(JSON.stringify(hasil)).not.toContain('gemini-rahasia');
  });

  it('tidak pernah berpura-pura aktif ketika secret provider belum dikonfigurasi', async () => {
    delete process.env.AI_API_KEY;
    let status = 0;
    let hasil: unknown;
    const respons = {
      status(kode: number) { status = kode; return this; },
      setHeader() {},
      json(nilai: unknown) { hasil = nilai; },
    };

    await handler({ method: 'POST', headers: {}, body: {
      jenis: 'materi', prompt: 'Buat materi ringkas.', jumlah: 3,
      konteks: { cp: 'CP final', tp: 'TP aktif', terverifikasi: true },
    } }, respons);

    expect(status).toBe(503);
    expect(hasil).toEqual({
      ok: false,
      kode: 'AI_NOT_CONFIGURED',
      pesan: 'Layanan AI belum dikonfigurasi oleh administrator.',
    });
  });

  it('memakai adapter resmi Gemini ketika dipilih tanpa mengirim secret ke klien', async () => {
    process.env.GEMINI_API_KEY = 'secret-uji';
    const fetchUji = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ judul: 'Draf', ringkasan: 'Ringkas', butir: [{ pertanyaan: 'P?', jawaban: 'J', pilihan: ['J','K'], pembahasan: '', rubrik: '' }] }) }] } }] }) });
    vi.stubGlobal('fetch', fetchUji);
    let status = 0; let hasil: unknown;
    const respons = { status(kode: number) { status = kode; return this; }, setHeader() {}, json(nilai: unknown) { hasil = nilai; } };
    await handler({ method: 'POST', headers: {}, body: { provider: 'gemini', jenis: 'game', prompt: 'Buat game.', jumlah: 1, konteks: { cp: 'CP final', tp: 'TP aktif', terverifikasi: true } } }, respons);
    expect(status).toBe(200);
    expect(hasil).toMatchObject({ ok: true, hasil: { judul: 'Draf' } });
    expect(String(fetchUji.mock.calls[0]?.[0])).toContain('generativelanguage.googleapis.com');
    expect(String(fetchUji.mock.calls[0]?.[0])).toContain('secret-uji');
  });

  it('memakai adapter resmi OpenAI dan meneruskan hasil sukses', async () => {
    process.env.OPENAI_API_KEY = 'secret-openai-uji';
    const fetchUji = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ judul: 'Materi', ringkasan: 'Ringkas', butir: [{ pertanyaan: 'P?', jawaban: 'J', pilihan: ['J','K'], pembahasan: '', rubrik: '' }] }) } }] }) });
    vi.stubGlobal('fetch', fetchUji);
    let status = 0; let hasil: unknown;
    const respons = { status(kode: number) { status = kode; return this; }, setHeader() {}, json(nilai: unknown) { hasil = nilai; } };
    await handler({ method: 'POST', headers: {}, body: { provider: 'openai', jenis: 'materi', prompt: 'Buat materi.', jumlah: 1, konteks: { cp: 'CP final', tp: 'TP aktif', terverifikasi: true } } }, respons);
    expect(status).toBe(200); expect(hasil).toMatchObject({ ok: true, hasil: { judul: 'Materi' } });
    expect(String(fetchUji.mock.calls[0]?.[0])).toContain('api.openai.com');
  });

  it('menerjemahkan rate limit provider menjadi status yang dapat ditangani aplikasi', async () => {
    process.env.OPENAI_API_KEY = 'secret-uji';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limit' }));
    let status = 0; let hasil: unknown;
    const respons = { status(kode: number) { status = kode; return this; }, setHeader() {}, json(nilai: unknown) { hasil = nilai; } };
    await handler({ method: 'POST', headers: {}, body: { provider: 'openai', jenis: 'soal', prompt: 'Buat soal.', jumlah: 1, konteks: { cp: 'CP', tp: 'TP', terverifikasi: true } } }, respons);
    expect(status).toBe(429); expect(hasil).toMatchObject({ kode: 'AI_RATE_LIMIT' });
  });

  it('menolak LKPD/Bank Soal reference-gated tanpa sumber sebelum memanggil provider', async () => {
    process.env.OPENAI_API_KEY = 'secret-uji';
    const fetchUji = vi.fn(); vi.stubGlobal('fetch', fetchUji);
    let status = 0; let hasil: unknown;
    const respons = { status(kode: number) { status = kode; return this; }, setHeader() {}, json(nilai: unknown) { hasil = nilai; } };
    await handler({ method: 'POST', headers: {}, body: { provider: 'openai', jenis: 'lkpd', prompt: 'Buat LKPD.', jumlah: 8, kendali: { reference_gated: true }, konteks: { cp: 'CP', tp: 'TP', terverifikasi: true, referensi: [] } } }, respons);
    expect(status).toBe(400); expect(hasil).toMatchObject({ pesan: 'Referensi pembelajaran belum tersedia.' });
    expect(fetchUji).not.toHaveBeenCalled();
  });
});
