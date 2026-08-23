import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { buatAdminPertama, masuk } from '../../lib/auth/authService';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { simpanMedia } from '../../lib/storage/pelengkapRepo';
import { resetPenyimpanan } from '../../test/bantuan';
import { RUTE } from '../../routes/paths';

const createObjectUrlAsli = URL.createObjectURL;
const revokeObjectUrlAsli = URL.revokeObjectURL;
const ADMIN = { nama: 'Admin Media', username: 'admin.media', password: 'Media#2026', konfirmasi: 'Media#2026' };

describe('renderer media pembelajaran', () => {
  beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: () => 'blob:http://lokal/media-uji' });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: () => undefined });
  });
  afterAll(() => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrlAsli });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrlAsli });
  });
  beforeEach(async () => { await resetPenyimpanan(); tandaiOpeningSelesai(); });

  it('merender gambar, video, audio, dan PDF dari Blob IndexedDB', async () => {
    const pengguna = userEvent.setup();
    const akun = await buatAdminPertama(ADMIN);
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });
    for (const [jenis, nama, tipe] of [
      ['gambar', 'uji.png', 'image/png'],
      ['video', 'uji.mp4', 'video/mp4'],
      ['audio', 'uji.mp3', 'audio/mpeg'],
      ['pdf', 'uji.pdf', 'application/pdf'],
    ] as const) {
      const blob = new Blob([nama], { type: tipe });
      await simpanMedia({ jenis, nama_berkas: nama, ukuran_byte: blob.size, durasi: null, tersedia_offline: true, diunggah_oleh: akun.id, tp_id: null, data_berkas: blob });
    }
    render(<MemoryRouter initialEntries={[RUTE.media]}><AuthProvider><AppRoutes/></AuthProvider></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Media Pembelajaran' })).toBeVisible();

    for (const [nama, selector] of [
      ['uji.png', '.pemutar-media img'],
      ['uji.mp4', '.pemutar-media video'],
      ['uji.mp3', '.pemutar-media audio'],
      ['uji.pdf', '.pemutar-media iframe'],
    ] as const) {
      const kartu = (await screen.findByRole('heading', { name: nama }, { timeout: 5_000 })).closest('article')!;
      await pengguna.click(within(kartu).getByRole('button', { name: 'Buka / putar' }));
      expect(document.querySelector(selector)).toBeInTheDocument();
      await pengguna.click(screen.getByRole('button', { name: 'Tutup pratinjau' }));
    }
  });
});
