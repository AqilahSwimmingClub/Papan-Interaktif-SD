import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { RUTE } from '../../routes/paths';
import { resetPenyimpanan } from '../../test/bantuan';
import { semuaAkun } from '../../lib/storage/akunRepo';
import { bacaSekolah } from '../../lib/storage/sekolahRepo';
import { TEKS_IDENTITAS } from '../../components/IdentitasPembuat';

function pasang(rute = RUTE.setupAdmin) {
  return render(
    <MemoryRouter initialEntries={[rute]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function isiLangkahAkun(pengguna: ReturnType<typeof userEvent.setup>) {
  await pengguna.type(screen.getByLabelText('Nama Admin'), 'Fahmi Djawas, S.Pd.');
  await pengguna.type(screen.getByLabelText('Username'), 'fahmi.djawas');
  await pengguna.type(screen.getByLabelText('Password'), 'SandiAdmin#2026');
  await pengguna.type(screen.getByLabelText('Konfirmasi Password'), 'SandiAdmin#2026');
  await pengguna.click(screen.getByRole('button', { name: 'LANJUT' }));
}

describe('setup admin pertama', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    globalThis.sessionStorage.setItem('papan-interaktif-sd:opening-selesai', '1');
  });

  it('menjelaskan bahwa akun hanya tersimpan di perangkat ini', async () => {
    pasang();
    await screen.findByTestId('layar-setup-admin');

    expect(screen.getByText('SETUP PAPAN INTERAKTIF SD')).toBeInTheDocument();
    expect(
      screen.getByText(/Perangkat ini belum memiliki Admin\. Buat satu akun untuk memulai\./),
    ).toBeInTheDocument();
    expect(screen.getByText('Akun ini tersimpan hanya di perangkat ini')).toBeInTheDocument();
    expect(screen.getByText(/pemulihannya lewat berkas cadangan/i)).toBeInTheDocument();
  });

  it('menampilkan identitas pembuat dalam satu container tiga baris', async () => {
    pasang();
    await screen.findByTestId('layar-setup-admin');

    const identitas = screen.getByTestId('identitas-pembuat');
    const baris = identitas.querySelectorAll('p');
    expect(baris).toHaveLength(3);
    expect(baris[0]).toHaveTextContent(TEKS_IDENTITAS.pengantar);
    expect(baris[1]).toHaveTextContent(TEKS_IDENTITAS.nama);
    expect(baris[2]).toHaveTextContent(TEKS_IDENTITAS.hakCipta);
  });

  it('menolak konfirmasi password yang belum sama', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-setup-admin');

    await pengguna.type(screen.getByLabelText('Nama Admin'), 'Fahmi Djawas, S.Pd.');
    await pengguna.type(screen.getByLabelText('Username'), 'fahmi.djawas');
    await pengguna.type(screen.getByLabelText('Password'), 'SandiAdmin#2026');
    await pengguna.type(screen.getByLabelText('Konfirmasi Password'), 'SandiLain#2026');
    await pengguna.click(screen.getByRole('button', { name: 'LANJUT' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Konfirmasi password belum sama.');
    expect(await semuaAkun()).toHaveLength(0);
  });

  it('membuat akun Admin lalu melanjutkan ke langkah identitas sekolah', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-setup-admin');

    await isiLangkahAkun(pengguna);

    expect(await screen.findByLabelText('Nama Sekolah')).toBeInTheDocument();
    const akun = await semuaAkun();
    expect(akun).toHaveLength(1);
    expect(akun[0].peran).toBe('admin');
    expect(akun[0].hash_sandi).not.toContain('SandiAdmin#2026');
  });

  it('menyimpan identitas sekolah ke tabel, lalu membuka Login', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-setup-admin');
    await isiLangkahAkun(pengguna);

    await pengguna.type(await screen.findByLabelText('Nama Sekolah'), 'SDN Satria Jaya 01');
    await pengguna.type(screen.getByLabelText('NPSN'), '20218123');
    await pengguna.click(screen.getByRole('button', { name: 'SIMPAN & MASUK' }));

    expect(await screen.findByTestId('layar-login')).toBeInTheDocument();
    const sekolah = await bacaSekolah();
    expect(sekolah?.nama).toBe('SDN Satria Jaya 01');
    expect(sekolah?.npsn).toBe('20218123');
  });

  it('identitas sekolah dapat dilewati', async () => {
    const pengguna = userEvent.setup();
    pasang();
    await screen.findByTestId('layar-setup-admin');
    await isiLangkahAkun(pengguna);

    await pengguna.click(await screen.findByRole('button', { name: 'Lewati identitas sekolah' }));

    expect(await screen.findByTestId('layar-login')).toBeInTheDocument();
    expect(await bacaSekolah()).toBeUndefined();
  });
});
