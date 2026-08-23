import { afterEach, describe, expect, it } from 'vitest';
import handler from '../../../api/ai/generate';

afterEach(() => {
  delete process.env.AI_API_KEY;
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
});
