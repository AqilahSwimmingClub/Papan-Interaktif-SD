import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { buatAdminPertama, masuk } from '../../lib/auth/authService';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { simpanKonteksKurikulum } from '../../lib/storage/kurikulumRepo';
import { resetPenyimpanan, semaiRantaiTpUji } from '../../test/bantuan';
import { RUTE } from '../../routes/paths';

const ADMIN = { nama: 'Admin AI', username: 'admin.ai', password: 'SandiAI#2026', konfirmasi: 'SandiAI#2026' };

describe('Studio AI fungsional', () => {
  beforeEach(async () => {
    await resetPenyimpanan(); tandaiOpeningSelesai();
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('tidak lagi menyediakan Game Generator lama pada Studio AI', async () => {
    await buatAdminPertama(ADMIN);
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });
    const tampilan = render(<MemoryRouter initialEntries={['/fitur/studio-ai']}><AuthProvider><AppRoutes/></AuthProvider></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Menunggu Buku Referensi' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Game' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Uji butir pertama/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Masukkan Buku Referensi' })).toHaveAttribute(
      'href',
      RUTE.bukuReferensi,
    );
    tampilan.unmount();
    cleanup();
  }, 15_000);

  it('menghasilkan, meninjau, dan menyimpan LKPD, soal, serta materi', async () => {
    const akun = await buatAdminPertama(ADMIN);
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });
    const rantai = await semaiRantaiTpUji();
    await simpanKonteksKurikulum(akun.id, { tingkat_kelas: 1, fase_kode: 'A', mapel_kode: 'MAT', cabang_kode: null, agama_kode: null, cp_id: rantai.cpId, elemen_id: rantai.elemenId, tp_id: rantai.tpId, materi_id: null, referensi_id: null, referensi_bab_id: null });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, hasil: { judul: 'Draf AI Lengkap', ringkasan: 'Ringkasan sesuai konteks.', butir: [{ pertanyaan: 'Jelaskan bilangan dua.', jawaban: 'Bilangan setelah satu.', pilihan: ['Bilangan setelah satu.', 'Bilangan setelah lima.'], pembahasan: 'Sesuai TP aktif.', rubrik: 'Jawaban tepat.' }] } }) } as Response);

    for (const [rute, label] of [
      ['/fitur/pembuat-lkpd', 'Pembuat LKPD'],
      ['/fitur/pembuat-soal', 'Pembuat Soal'],
      ['/fitur/pembuat-materi', 'Pembuat Materi'],
    ] as const) {
      const pengguna = userEvent.setup();
      const tampilan = render(<MemoryRouter initialEntries={[rute]}><AuthProvider><AppRoutes/></AuthProvider></MemoryRouter>);
      const layar = await screen.findByTestId('studio-ai', {}, { timeout: 10_000 });
      expect(within(layar).getByRole('heading', { name: label })).toBeVisible();
      const tombolBuat = await screen.findByRole('button', { name: `Buat ${label}` }, { timeout: 10_000 });
      await waitFor(() => expect(tombolBuat).toBeEnabled(), { timeout: 10_000 });
      await pengguna.click(tombolBuat);
      expect(await screen.findByRole('heading', { name: 'Draf AI Lengkap' }, { timeout: 10_000 })).toBeVisible();
      await pengguna.click(screen.getByRole('button', { name: 'Setujui & simpan lokal' }));
      expect(await screen.findByText(`${label} sudah disetujui dan tersimpan pada perangkat.`)).toBeVisible();
      tampilan.unmount(); cleanup();
    }
  }, 30_000);
});
