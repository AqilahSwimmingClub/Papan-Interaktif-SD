import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import { TOKO, jalankanTransaksi, kueri } from '../storage/db';
import type { AntreanAi } from '../types';
import {
  antrekanPermintaanAi,
  mulaiSinkronisasiAntreanAi,
  pasangPemrosesAntreanAi,
} from './antreanAi';

function aturOnline(nilai: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: nilai });
}

describe('antrean AI offline-first', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    aturOnline(false);
    pasangPemrosesAntreanAi(null);
  });

  afterEach(() => {
    pasangPemrosesAntreanAi(null);
    aturOnline(true);
  });

  it('mencegah duplikat aktif dan berjalan otomatis saat jaringan kembali', async () => {
    const pertama = await antrekanPermintaanAi('PROMPT-1');
    const kedua = await antrekanPermintaanAi('PROMPT-1');
    expect(kedua.id).toBe(pertama.id);

    const pemroses = vi.fn().mockResolvedValue(undefined);
    pasangPemrosesAntreanAi(pemroses);
    const berhenti = mulaiSinkronisasiAntreanAi();
    expect(pemroses).not.toHaveBeenCalled();

    aturOnline(true);
    window.dispatchEvent(new Event('online'));
    await vi.waitFor(() => expect(pemroses).toHaveBeenCalledTimes(1));

    const tersimpan = await jalankanTransaksi(TOKO.antreanAi, 'readonly', (toko) =>
      kueri.ambil<AntreanAi>(toko(TOKO.antreanAi), pertama.id),
    );
    expect(tersimpan).toMatchObject({ status: 'selesai', percobaan: 1 });
    berhenti();
  });

  it('menandai gagal tanpa menganggap permintaan selesai', async () => {
    aturOnline(true);
    const antrean = await antrekanPermintaanAi('PROMPT-GAGAL');
    pasangPemrosesAntreanAi(vi.fn().mockRejectedValue(new Error('layanan tidak tersedia')));
    await vi.waitFor(async () => {
      const tersimpan = await jalankanTransaksi(TOKO.antreanAi, 'readonly', (toko) =>
        kueri.ambil<AntreanAi>(toko(TOKO.antreanAi), antrean.id),
      );
      expect(tersimpan?.status).toBe('gagal');
    });
  });
});
