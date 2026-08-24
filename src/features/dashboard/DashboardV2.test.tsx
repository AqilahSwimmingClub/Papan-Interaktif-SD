import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { buatAdminPertama, buatAkunGuru, masuk } from '../../lib/auth/authService';
import { simpanPenugasanGuru } from '../../lib/storage/pelengkapRepo';
import { resetPenyimpanan } from '../../test/bantuan';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { AuthProvider } from '../../state/AuthProvider';
import { AppRoutes } from '../../routes/AppRoutes';
import { RUTE } from '../../routes/paths';

const ADMIN = { nama: 'Admin V2', username: 'admin.v2', password: 'SandiAdmin#2026', konfirmasi: 'SandiAdmin#2026' };

describe('dashboard V2 dan alat kelas', () => {
  beforeEach(async () => { await resetPenyimpanan(); tandaiOpeningSelesai(); });

  async function pasangGuru(rute: string) {
    const admin = await buatAdminPertama(ADMIN);
    const guru = await buatAkunGuru(admin, { nama: 'Guru Kelas Lima', username: 'guru.v2', password: 'SandiGuru#2026', konfirmasi: 'SandiGuru#2026' });
    await simpanPenugasanGuru(guru, [5], ['IPAS', 'MAT']);
    await masuk({ username: guru.username, password: 'SandiGuru#2026', peran: 'guru' });
    return render(<MemoryRouter initialEntries={[rute]}><AuthProvider><AppRoutes /></AuthProvider></MemoryRouter>);
  }

  it('memisahkan menu Guru dari menu Admin', async () => {
    await pasangGuru(RUTE.dasbor);
    const navigasi = await screen.findByRole('complementary', { name: 'Navigasi utama' });
    expect(within(navigasi).getByText('Kuis Langsung')).toBeVisible();
    expect(within(navigasi).getByText('VLAB/Simulasi')).toBeVisible();
    expect(within(navigasi).queryByText('Data Guru')).toBeNull();
    expect(screen.getByText('Kelas yang diampu')).toBeVisible();
  });

  it('dashboard Admin tidak menampilkan alat pembelajaran Guru', async () => {
    await buatAdminPertama(ADMIN); await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });
    render(<MemoryRouter initialEntries={[RUTE.dasbor]}><AuthProvider><AppRoutes /></AuthProvider></MemoryRouter>);
    const navigasi = await screen.findByRole('complementary', { name: 'Navigasi utama' });
    expect(within(navigasi).getByText('Data Guru')).toBeVisible();
    expect(within(navigasi).queryByText('Game Edukasi')).toBeNull();
    expect(screen.getByTestId('beranda-terlindungi')).toHaveAttribute('data-dashboard-role', 'admin');
  });

  it('menyediakan 21 alat matematika dan manipulatif basis sepuluh playable', async () => {
    const pengguna = userEvent.setup(); await pasangGuru(RUTE.alatMatematika);
    const layar = await screen.findByTestId('alat-matematika');
    const navigasi = within(layar).getByRole('navigation', { name: 'Daftar alat matematika' });
    expect(within(navigasi).getAllByRole('button')).toHaveLength(21);
    await pengguna.click(within(layar).getByRole('button', { name: '100' }));
    expect(within(layar).getByText('100', { selector: '.blok-basis>strong' })).toBeVisible();
  });

  it('timer tidak reset ketika viewport berubah orientasi', async () => {
    const pengguna = userEvent.setup(); await pasangGuru(RUTE.timerKelas);
    const layar = await screen.findByTestId('timer-kelas');
    await pengguna.click(within(layar).getByRole('button', { name: '1 menit' }));
    expect(within(layar).getByText('01:00')).toBeVisible();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 844 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 390 });
    fireEvent(window, new Event('resize'));
    expect(within(layar).getByText('01:00')).toBeVisible();
  });

  it('Dual Window memisahkan skor pointer A dan B', async () => {
    await pasangGuru(RUTE.dualWindow);
    const layar = await screen.findByTestId('dual-window');
    const arenaA = within(layar).getByRole('region', { name: 'Arena Pemain A' });
    const arenaB = within(layar).getByRole('region', { name: 'Arena Pemain B' });
    fireEvent.pointerDown(within(arenaA).getByRole('button', { name: 'Target benar' }), { pointerId: 11 });
    expect(within(arenaA).getByText('Skor 10')).toBeVisible();
    expect(within(arenaB).getByText('Skor 0')).toBeVisible();
    fireEvent.pointerDown(within(arenaB).getByRole('button', { name: 'Target benar' }), { pointerId: 22 });
    expect(within(arenaB).getByText('Skor 10')).toBeVisible();
  });

  it('generator baru menunggu ReferenceBook dan tidak mengarang isi', async () => {
    await pasangGuru(RUTE.generateLkpd);
    expect(await screen.findByRole('heading', { name: 'Pilih CP dan TP lebih dulu' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /Buat/ })).toBeNull();
  });
});
