import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { RUTE } from '../../routes/paths';
import { resetPenyimpanan } from '../../test/bantuan';
import { buatAdminPertama } from '../../lib/auth/authService';
import { TEKS_IDENTITAS } from '../../components/IdentitasPembuat';

const ADMIN = {
  nama: 'Fahmi Djawas, S.Pd.',
  username: 'fahmi.djawas',
  password: 'SandiAdmin#2026',
  konfirmasi: 'SandiAdmin#2026',
};

function pasang(rute = RUTE.masuk) {
  return render(
    <MemoryRouter initialEntries={[rute]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('layar login', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    globalThis.sessionStorage.setItem('papan-interaktif-sd:opening-selesai', '1');
    await buatAdminPertama(ADMIN);
  });

  it('menampilkan identitas visual final dan ketiga baris identitas pembuat', async () => {
    pasang();
    await screen.findByTestId('layar-login');

    expect(screen.getByRole('heading', { name: 'PAPAN INTERAKTIF SD' })).toBeInTheDocument();
    expect(screen.getByText(/Platform Pembelajaran Interaktif/)).toBeInTheDocument();
    expect(screen.getByAltText('Tut Wuri Handayani')).toBeInTheDocument();
    expect(
      screen.getByAltText(/Dua siswa SDN Satria Jaya 01 berdiri di depan papan nama sekolah/),
    ).toBeInTheDocument();

    const identitas = screen.getByTestId('identitas-pembuat');
    expect(identitas).toHaveTextContent(TEKS_IDENTITAS.pengantar);
    expect(identitas).toHaveTextContent(TEKS_IDENTITAS.nama);
    expect(identitas).toHaveTextContent(TEKS_IDENTITAS.hakCipta);
  });

  it('menyediakan username, password, pilihan peran, dan Lupa Password', async () => {
    pasang();
    await screen.findByTestId('layar-login');

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Guru' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'MASUK' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lupa Password' })).toBeInTheDocument();
  });

  it('menyembunyikan sandi sampai tombol Lihat ditekan', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-login');

    const isian = screen.getByLabelText('Password');
    expect(isian).toHaveAttribute('type', 'password');

    await pengguna.click(screen.getByRole('button', { name: 'Lihat' }));
    expect(isian).toHaveAttribute('type', 'text');
  });

  it('masuk dengan kredensial benar lalu membuka rute terlindungi', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-login');

    await pengguna.type(screen.getByLabelText('Username'), ADMIN.username);
    await pengguna.type(screen.getByLabelText('Password'), ADMIN.password);
    await pengguna.click(screen.getByRole('radio', { name: 'Admin' }));
    await pengguna.click(screen.getByRole('button', { name: 'MASUK' }));

    expect(await screen.findByTestId('beranda-terlindungi')).toBeInTheDocument();
  });

  it('menampilkan pesan galat dan tetap di Login bila sandi salah', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-login');

    await pengguna.type(screen.getByLabelText('Username'), ADMIN.username);
    await pengguna.type(screen.getByLabelText('Password'), 'SandiSalah#1');
    await pengguna.click(screen.getByRole('button', { name: 'MASUK' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Username atau password salah.');
    expect(screen.getByTestId('layar-login')).toBeInTheDocument();
  });

  it('menolak masuk bila peran yang dipilih tidak cocok', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-login');

    await pengguna.type(screen.getByLabelText('Username'), ADMIN.username);
    await pengguna.type(screen.getByLabelText('Password'), ADMIN.password);
    await pengguna.click(screen.getByRole('radio', { name: 'Guru' }));
    await pengguna.click(screen.getByRole('button', { name: 'MASUK' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/terdaftar sebagai Admin/i);
  });

  it('Lupa Password membuka jalur pemulihan tanpa janji surel', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-login');

    await pengguna.click(screen.getByRole('link', { name: 'Lupa Password' }));

    const layar = await screen.findByTestId('layar-lupa-password');
    expect(layar).toHaveTextContent(/tidak ada pengaturan ulang lewat surel/i);
    expect(layar).toHaveTextContent(/berkas cadangan/i);
    expect(layar).toHaveTextContent(/setup ulang perangkat/i);
    expect(layar.textContent).not.toMatch(/kirim (tautan|surel|email)/i);
  });

  it('Logout mengembalikan ke Login tanpa menghapus akun', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-login');

    await pengguna.type(screen.getByLabelText('Username'), ADMIN.username);
    await pengguna.type(screen.getByLabelText('Password'), ADMIN.password);
    await pengguna.click(screen.getByRole('button', { name: 'MASUK' }));
    await screen.findByTestId('beranda-terlindungi');

    await pengguna.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('layar-login')).toBeInTheDocument();
    });
    expect(screen.getByText(/Anda sudah keluar/)).toBeInTheDocument();
    // Akun tetap ada: layar Setup Admin tidak muncul kembali.
    expect(screen.queryByTestId('layar-setup-admin')).toBeNull();
  });
});
