import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../../../api/ai/generate';

afterEach(() => {
  delete process.env.AI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  vi.unstubAllGlobals();
});

describe('endpoint server-side AI', () => {
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
});
