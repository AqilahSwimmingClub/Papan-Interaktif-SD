import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { buatAdminPertama, masuk } from '../../lib/auth/authService';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { simpanKonteksKurikulum } from '../../lib/storage/kurikulumRepo';
import { resetPenyimpanan } from '../../test/bantuan';

const ADMIN = { nama: 'Admin AI', username: 'admin.ai', password: 'SandiAI#2026', konfirmasi: 'SandiAI#2026' };

describe('Studio AI fungsional', () => {
  beforeEach(async () => {
    await resetPenyimpanan(); tandaiOpeningSelesai();
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mengganti placeholder, merekomendasikan engine, menguji, lalu menyimpan game', async () => {
    const pengguna = userEvent.setup();
    const akun = await buatAdminPertama(ADMIN);
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });
    await simpanKonteksKurikulum(akun.id, { tingkat_kelas: 1, fase_kode: 'A', mapel_kode: 'MAT', cabang_kode: null, agama_kode: null, cp_id: 'CP-MAT-A', elemen_id: 'ELM-MAT-A-01', tp_id: 'TP-MAT-1-1.1', materi_id: null, referensi_id: null, referensi_bab_id: null });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, hasil: { judul: 'Game Bilangan Ceria', ringkasan: 'Draf sesuai TP.', butir: [{ pertanyaan: 'Pilih bilangan yang sesuai.', jawaban: 'Dua', pilihan: ['Dua', 'Lima'], pembahasan: 'Sesuai tujuan aktif.', rubrik: '' }] } }) } as Response);
    render(<MemoryRouter initialEntries={['/fitur/game-generator']}><AuthProvider><AppRoutes/></AuthProvider></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Game Generator' })).toBeVisible();
    expect(screen.queryByText(/fitur belum diimplementasikan/i)).not.toBeInTheDocument();
    expect((await screen.findAllByText(/Dunia game/, {}, { timeout: 5_000 })).length).toBeGreaterThan(0);
    const tombolBuat = screen.getByRole('button', { name: 'Buat Game Generator' });
    await waitFor(() => expect(tombolBuat).toBeEnabled());
    await pengguna.click(tombolBuat);
    expect(await screen.findByRole('heading', { name: 'Game Bilangan Ceria' })).toBeVisible();
    await pengguna.click(screen.getByRole('button', { name: /Uji butir pertama/ }));
    const simpan = screen.getByRole('button', { name: 'Setujui & simpan lokal' });
    await pengguna.click(simpan);
    expect(await screen.findByRole('link', { name: 'Mainkan game tersimpan' })).toBeVisible();
    await waitFor(() => expect(simpan).toBeEnabled());
  }, 15_000);

  it('menghasilkan, meninjau, dan menyimpan LKPD, soal, serta materi', async () => {
    const akun = await buatAdminPertama(ADMIN);
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });
    await simpanKonteksKurikulum(akun.id, { tingkat_kelas: 1, fase_kode: 'A', mapel_kode: 'MAT', cabang_kode: null, agama_kode: null, cp_id: 'CP-MAT-A', elemen_id: 'ELM-MAT-A-01', tp_id: 'TP-MAT-1-1.1', materi_id: null, referensi_id: null, referensi_bab_id: null });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, hasil: { judul: 'Draf AI Lengkap', ringkasan: 'Ringkasan sesuai konteks.', butir: [{ pertanyaan: 'Jelaskan bilangan dua.', jawaban: 'Bilangan setelah satu.', pilihan: ['Bilangan setelah satu.', 'Bilangan setelah lima.'], pembahasan: 'Sesuai TP aktif.', rubrik: 'Jawaban tepat.' }] } }) } as Response);

    for (const [rute, label] of [
      ['/fitur/pembuat-lkpd', 'Pembuat LKPD'],
      ['/fitur/pembuat-soal', 'Pembuat Soal'],
      ['/fitur/pembuat-materi', 'Pembuat Materi'],
    ] as const) {
      const pengguna = userEvent.setup();
      const tampilan = render(<MemoryRouter initialEntries={[rute]}><AuthProvider><AppRoutes/></AuthProvider></MemoryRouter>);
      await waitFor(() => expect(screen.getByRole('heading', { name: label })).toBeVisible(), { timeout: 10_000 });
      const tombolBuat = await screen.findByRole('button', { name: `Buat ${label}` }, { timeout: 10_000 });
      await waitFor(() => expect(tombolBuat).toBeEnabled(), { timeout: 10_000 });
      await pengguna.click(tombolBuat);
      expect(await screen.findByRole('heading', { name: 'Draf AI Lengkap' }, { timeout: 10_000 })).toBeVisible();
      await pengguna.click(screen.getByRole('button', { name: 'Setujui & simpan lokal' }));
      expect(await screen.findByText(`${label} sudah disetujui dan tersimpan pada perangkat.`)).toBeVisible();
      await waitFor(() => expect(screen.getByRole('button', { name: 'Setujui & simpan lokal' })).toBeEnabled());
      tampilan.unmount(); cleanup();
    }
  }, 30_000);

  it('menampilkan tombol Konfigurasi AI ketika secret server belum tersedia', async () => {
    const pengguna = userEvent.setup();
    const akun = await buatAdminPertama(ADMIN);
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });
    await simpanKonteksKurikulum(akun.id, { tingkat_kelas: 1, fase_kode: 'A', mapel_kode: 'MAT', cabang_kode: null, agama_kode: null, cp_id: 'CP-MAT-A', elemen_id: 'ELM-MAT-A-01', tp_id: 'TP-MAT-1-1.1', materi_id: null, referensi_id: null, referensi_bab_id: null });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 503, json: async () => ({ ok: false, kode: 'AI_NOT_CONFIGURED', pesan: 'Layanan AI belum dikonfigurasi oleh administrator.' }) } as Response);
    render(<MemoryRouter initialEntries={['/fitur/game-generator']}><AuthProvider><AppRoutes/></AuthProvider></MemoryRouter>);
    const buat = await screen.findByRole('button', { name: 'Buat Game Generator' });
    await waitFor(() => expect(buat).toBeEnabled()); await pengguna.click(buat);
    const tautan = await screen.findAllByRole('link', { name: 'Konfigurasi AI' });
    expect(tautan.some((item) => item.classList.contains('ai-konfigurasi-link') && item.getAttribute('href') === '/pengaturan/ai')).toBe(true);
    await waitFor(() => expect(buat).toBeEnabled());
  });
});
