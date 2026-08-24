import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { buatAdminPertama, buatAkunGuru, masuk } from '../../lib/auth/authService';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { bacaKonteksKurikulum, pastikanKurikulumTersedia, simpanKonteksKurikulum } from '../../lib/storage/kurikulumRepo';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { resetPenyimpanan } from '../../test/bantuan';

const ADMIN = { nama: 'Admin Navigasi', username: 'admin.nav', password: 'SandiNav#2026', konfirmasi: 'SandiNav#2026' };

describe('navigasi besar, drawer HP, dan Back', () => {
  beforeEach(async () => { await resetPenyimpanan(); tandaiOpeningSelesai(); vi.restoreAllMocks(); });

  async function siapkan() {
    const admin = await buatAdminPertama(ADMIN);
    const akun = await buatAkunGuru(admin, { nama: 'Guru Navigasi', username: 'guru.nav', password: 'SandiGuru#2026', konfirmasi: 'SandiGuru#2026' });
    await masuk({ username: akun.username, password: 'SandiGuru#2026', peran: 'guru' });
    await pastikanKurikulumTersedia();
    await simpanKonteksKurikulum(akun.id, { tingkat_kelas: 1, fase_kode: 'A', mapel_kode: 'MAT', cabang_kode: null, agama_kode: null, cp_id: 'CP-MAT-A', elemen_id: 'ELM-MAT-A-01', tp_id: 'TP-MAT-1-1.1', materi_id: null, referensi_id: null, referensi_bab_id: null });
    return akun;
  }

  it('sidebar memuat ikon dan label lengkap, sedangkan hamburger membuka drawer HP', async () => {
    await siapkan(); const pengguna = userEvent.setup();
    render(<MemoryRouter initialEntries={['/kelas/data-siswa']}><AuthProvider><AppRoutes/></AuthProvider></MemoryRouter>);
    expect(await screen.findByRole('link', { name: /Game Edukasi/ })).toHaveTextContent('Game Edukasi');
    expect(screen.getByRole('link', { name: /Generate LKPD/ })).toHaveTextContent('Generate LKPD');
    expect(screen.getByRole('link', { name: /Ganti Password/ })).toBeVisible();
    const hamburger = screen.getByRole('button', { name: 'Buka menu navigasi' });
    await pengguna.click(hamburger);
    expect(screen.getByRole('complementary', { name: 'Navigasi utama' })).toHaveClass('guru-sidebar--terbuka');
    await pengguna.click(screen.getByRole('button', { name: 'Tutup menu navigasi' }));
    expect(screen.getByRole('complementary', { name: 'Navigasi utama' })).not.toHaveClass('guru-sidebar--terbuka');
  });

  it('tombol Back kembali ke route sebelumnya dan mempertahankan state CP/TP', async () => {
    const akun = await siapkan(); const pengguna = userEvent.setup();
    render(<MemoryRouter initialEntries={['/dasbor', '/kelas/data-siswa']} initialIndex={1}><AuthProvider><AppRoutes/></AuthProvider></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Data Siswa' })).toBeVisible();
    await pengguna.click(screen.getByRole('button', { name: '← Kembali' }));
    expect(await screen.findByTestId('beranda-terlindungi', {}, { timeout: 5_000 })).toBeVisible();
    await waitFor(async () => expect((await bacaKonteksKurikulum(akun.id)).tp_id).toBe('TP-MAT-1-1.1'));
  }, 15_000);
});
