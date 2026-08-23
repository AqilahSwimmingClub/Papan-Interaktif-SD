import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { AuthProvider } from '../state/AuthProvider';
import { RUTE, ruteTerbuka } from './paths';
import { resetPenyimpanan } from '../test/bantuan';
import { buatAdminPertama, masuk } from '../lib/auth/authService';
import { tandaiOpeningSelesai } from '../lib/opening/pemutaranOpening';

const ADMIN = {
  nama: 'Fahmi Djawas, S.Pd.',
  username: 'fahmi.djawas',
  password: 'SandiAdmin#2026',
  konfirmasi: 'SandiAdmin#2026',
};

function pasang(rute: string) {
  return render(
    <MemoryRouter initialEntries={[rute]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('penjagaan rute', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('hanya Opening, Setup Admin, Login, dan Lupa Password yang terbuka', () => {
    expect(ruteTerbuka(RUTE.pembuka)).toBe(true);
    expect(ruteTerbuka(RUTE.setupAdmin)).toBe(true);
    expect(ruteTerbuka(RUTE.masuk)).toBe(true);
    expect(ruteTerbuka(RUTE.lupaPassword)).toBe(true);
    expect(ruteTerbuka(RUTE.dasbor)).toBe(false);
    expect(ruteTerbuka(RUTE.kelas)).toBe(false);
    expect(ruteTerbuka(RUTE.akar)).toBe(false);
  });

  it('perangkat tanpa Admin dialihkan ke Setup Admin dari rute mana pun', async () => {
    pasang(RUTE.dasbor);
    expect(await screen.findByTestId('layar-setup-admin')).toBeInTheDocument();
  });

  it('perangkat tanpa Admin tidak dapat membuka Login', async () => {
    pasang(RUTE.masuk);
    expect(await screen.findByTestId('layar-setup-admin')).toBeInTheDocument();
  });

  it('menolak rute terlindungi tanpa sesi sah, bukan menyembunyikannya', async () => {
    await buatAdminPertama(ADMIN);
    pasang(RUTE.dasbor);

    expect(await screen.findByTestId('layar-login')).toBeInTheDocument();
    expect(screen.queryByTestId('beranda-terlindungi')).toBeNull();
  });

  it('Setup Admin tidak dapat dibuka lagi setelah Admin ada', async () => {
    await buatAdminPertama(ADMIN);
    pasang(RUTE.setupAdmin);

    expect(await screen.findByTestId('layar-login')).toBeInTheDocument();
  });

  it('membuka rute terlindungi bila sesi sah', async () => {
    await buatAdminPertama(ADMIN);
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });

    pasang(RUTE.dasbor);
    expect(await screen.findByTestId('beranda-terlindungi')).toBeInTheDocument();
  });

  it('menolak rute pemilihan kelas tanpa sesi sah', async () => {
    await buatAdminPertama(ADMIN);
    pasang(RUTE.kelas);

    expect(await screen.findByTestId('layar-login')).toBeInTheDocument();
  });

  it('sesi sah tidak dapat kembali ke Login', async () => {
    await buatAdminPertama(ADMIN);
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });

    pasang(RUTE.masuk);
    expect(await screen.findByTestId('beranda-terlindungi')).toBeInTheDocument();
  });

  it('Lupa Password terbuka tanpa sesi selama Admin sudah ada', async () => {
    await buatAdminPertama(ADMIN);
    pasang(RUTE.lupaPassword);

    expect(await screen.findByTestId('layar-lupa-password')).toBeInTheDocument();
  });

  it('alamat yang tidak dikenal menampilkan halaman tidak ditemukan', async () => {
    await buatAdminPertama(ADMIN);
    pasang('/rute-yang-tidak-ada');

    expect(await screen.findByText('Halaman tidak ditemukan')).toBeInTheDocument();
  });

  it('akar mengarahkan ke Opening bila video belum tampil pada pembukaan ini', async () => {
    globalThis.sessionStorage.clear();
    await buatAdminPertama(ADMIN);
    pasang(RUTE.akar);

    await waitFor(() => {
      expect(screen.getByTestId('layar-opening')).toBeInTheDocument();
    });
  });
});
