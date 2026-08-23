import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { buatAdminPertama, masuk } from '../../lib/auth/authService';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { resetPenyimpanan } from '../../test/bantuan';
import { RUTE } from '../../routes/paths';

const ADMIN = {
  nama: 'Guru Penguji',
  username: 'guru.penguji',
  password: 'SandiAdmin#2026',
  konfirmasi: 'SandiAdmin#2026',
};

async function pasangTahap2(rute: string) {
  await buatAdminPertama(ADMIN);
  await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });
  return render(
    <MemoryRouter initialEntries={[rute]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('layar Tahap 2', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('menampilkan Dashboard setelah login dengan ringkasan dataset final', async () => {
    await pasangTahap2(RUTE.dasbor);

    expect(await screen.findByTestId('beranda-terlindungi')).toBeInTheDocument();
    expect(await screen.findByText('47', { selector: '.kartu-statistik strong' })).toBeVisible();
    expect(screen.getByText('221', { selector: '.kartu-statistik strong' })).toBeVisible();
    expect(screen.getByText('212', { selector: '.kartu-statistik strong' })).toBeVisible();
    expect(screen.getByText('Belum ada jadwal mengajar')).toBeVisible();
  });

  it('menyediakan enam kelas dan menyimpan pilihan menuju mata pelajaran', async () => {
    const pengguna = userEvent.setup();
    await pasangTahap2(RUTE.kelas);

    expect(await screen.findByRole('heading', { name: 'Pilih kelas' })).toBeVisible();
    expect(
      await screen.findAllByText(/Kelas [1-6]/, { selector: '.kartu-kelas > strong' }),
    ).toHaveLength(6);
    await pengguna.click(screen.getByRole('link', { name: /Kelas 4/i }));
    expect(await screen.findByRole('heading', { name: 'Mata pelajaran Kelas 4' })).toBeVisible();
  });

  it('menampilkan seluruh agama dari 020/2026 dan batas KKA pada kelas 4', async () => {
    await pasangTahap2('/kelas/4/mapel');

    expect(await screen.findByText('Pendidikan Agama Islam dan Budi Pekerti')).toBeVisible();
    expect(screen.getByText('Pendidikan Agama Kristen dan Budi Pekerti')).toBeVisible();
    expect(screen.getByText('Pendidikan Agama Katolik dan Budi Pekerti')).toBeVisible();
    expect(screen.getByText('Pendidikan Agama Hindu dan Budi Pekerti')).toBeVisible();
    expect(screen.getByText('Pendidikan Agama Buddha dan Budi Pekerti')).toBeVisible();
    expect(screen.getByText('Pendidikan Agama Khonghucu dan Budi Pekerti')).toBeVisible();
    expect(screen.getByText(/Koding dan Kecerdasan Artifisial belum tersedia/)).toBeVisible();
  });

  it('menampilkan CP agama verbatim tanpa mengarang TP dari dokumen 020/2026', async () => {
    await pasangTahap2('/kelas/1/mapel/PAI');

    expect(await screen.findByTestId('layar-cp-tp')).toBeInTheDocument();
    expect(screen.getByText('CP Resmi · 2026.1')).toBeVisible();
    expect(
      screen.getByText(/Membaca dan membedakan huruf hijaiah berharakat/),
    ).toBeVisible();
    expect(screen.getByText('Belum ada TP Rekomendasi untuk elemen ini')).toBeVisible();
    expect(screen.getByText(/Nomor 020 Tahun 2026 menetapkan CP/)).toBeVisible();
  });

  it('membawa TP terpilih ke tujuan navigasi pembelajaran', async () => {
    const pengguna = userEvent.setup();
    await pasangTahap2('/kelas/1/mapel/MAT');

    const tautanTp = await screen.findAllByRole('link', { name: 'Buka TP' });
    await pengguna.click(tautanTp[0]!);

    expect(await screen.findByRole('heading', { name: 'Materi Pembelajaran' })).toBeVisible();
    expect(
      screen.getByText('Semua materi wajib tertaut TP dan dapat dibuka kembali tanpa internet.'),
    ).toBeVisible();
    expect(screen.getByText(/^TP-MAT-/)).toBeVisible();
  });
});
