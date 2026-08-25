import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { buatAdminPertama, masuk, perangkatSudahPunyaAdmin } from '../../lib/auth/authService';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { resetPenyimpanan } from '../../test/bantuan';
import { RUTE } from '../../routes/paths';

const ADMIN = {
  nama: 'Guru Penguji',
  username: 'guru.penguji',
  password: 'SandiAdmin#2026',
  konfirmasi: 'SandiAdmin#2026',
};

async function bukaSebagaiAdmin(rute: string) {
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

describe('layar kelas dan mata pelajaran', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('menampilkan Dashboard tanpa satu pun angka CP/TP lama', async () => {
    await bukaSebagaiAdmin(RUTE.dasbor);

    expect(await screen.findByTestId('beranda-terlindungi')).toBeInTheDocument();
    expect(await screen.findByText('Kelas', { selector: '.kartu-statistik p' })).toBeVisible();
    expect(screen.getByText('Buku referensi', { selector: '.kartu-statistik p' })).toBeVisible();

    for (const angka of ['47', '221', '212']) {
      expect(
        screen.queryByText(angka, { selector: '.kartu-statistik strong' }),
      ).not.toBeInTheDocument();
    }
    expect(screen.queryByText(/TP Rekomendasi/)).not.toBeInTheDocument();
    expect(screen.queryByText(/CP resmi/)).not.toBeInTheDocument();
    expect(screen.getByText('Belum ada jadwal mengajar')).toBeVisible();
  });

  it('menyediakan enam kelas dan menyimpan pilihan menuju mata pelajaran', async () => {
    const pengguna = userEvent.setup();
    await bukaSebagaiAdmin(RUTE.kelas);

    expect(await screen.findByRole('heading', { name: 'Pilih kelas' })).toBeVisible();
    expect(
      await screen.findAllByText(/Kelas [1-6]/, { selector: '.kartu-kelas > strong' }),
    ).toHaveLength(6);
    await pengguna.click(screen.getByRole('link', { name: /Kelas 4/i }));
    expect(
      await screen.findByRole('heading', { name: 'Mata pelajaran Kelas 4' }, { timeout: 5_000 }),
    ).toBeVisible();
  }, 20_000);

  it('mempertahankan struktur mata pelajaran termasuk agama dan batas KKA', async () => {
    await bukaSebagaiAdmin('/kelas/4/mapel');

    expect(await screen.findByText('Pendidikan Agama Islam dan Budi Pekerti')).toBeVisible();
    expect(screen.getByText('Pendidikan Agama Kristen dan Budi Pekerti')).toBeVisible();
    expect(screen.getByText('Pendidikan Agama Khonghucu dan Budi Pekerti')).toBeVisible();
    expect(screen.getByText(/Koding dan Kecerdasan Artifisial belum tersedia/)).toBeVisible();
    expect(screen.queryByText(/TP Rekomendasi/)).not.toBeInTheDocument();
  });

  it('menampilkan rantai isi kosong yang menunggu Buku Referensi', async () => {
    await bukaSebagaiAdmin('/kelas/1/mapel/MAT');

    expect(await screen.findByTestId('layar-struktur-mapel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Buku Referensi belum dimasukkan' })).toBeVisible();
    expect(
      screen.getByText(/Konten akan tersedia setelah Buku Referensi dimasukkan/),
    ).toBeVisible();

    const rantai = screen.getByRole('region', { name: 'Rantai isi pembelajaran' });
    for (const nama of ['CP', 'TP', 'Kuis', 'Game Edukasi', 'LKPD', 'Bank Soal']) {
      expect(rantai).toHaveTextContent(nama);
    }
    expect(rantai.querySelectorAll('li[data-keadaan="menunggu_buku"]').length).toBeGreaterThan(5);
  });

  it('mendaftarkan buku referensi baru dan menampilkannya pada struktur mapel', async () => {
    const pengguna = userEvent.setup();
    await bukaSebagaiAdmin(RUTE.bukuReferensi);

    expect(await screen.findByTestId('buku-referensi')).toBeInTheDocument();
    await screen.findByRole('option', { name: 'Matematika' }, { timeout: 5_000 });
    await pengguna.selectOptions(screen.getByLabelText('Mata pelajaran'), 'MAT');
    await pengguna.type(screen.getByLabelText('Judul buku'), 'Matematika Kelas 1 Sekolah Kami');
    await pengguna.click(screen.getByRole('button', { name: 'Tambah buku referensi' }));

    expect(await screen.findByText('Matematika Kelas 1 Sekolah Kami')).toBeVisible();
  }, 15_000);

  it('menampilkan katalog Game Edukasi IPAS Kelas 5 yang playable', async () => {
    await bukaSebagaiAdmin(RUTE.game);

    expect(await screen.findByTestId('katalog-game')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Game Edukasi' })).toBeVisible();
    expect(screen.getByText('40', { selector: '.game-katalog__angka strong' })).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Mainkan/ })).toHaveLength(40);
    expect(screen.queryByText(/engine reusable/)).not.toBeInTheDocument();
  });

  it('menampilkan aksi akun yang jelas dan ganti akun hanya menutup sesi', async () => {
    const pengguna = userEvent.setup();
    await bukaSebagaiAdmin(RUTE.dasbor);
    const tombol = await screen.findAllByRole('button', { name: 'Buka menu akun' });
    await pengguna.click(tombol[0]!);
    expect(screen.getByRole('link', { name: 'Kelola Akun Guru' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ganti Akun' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeVisible();
    expect(screen.getByText(/Logout hanya menutup sesi/)).toBeVisible();
    await pengguna.click(screen.getByRole('button', { name: 'Ganti Akun' }));
    expect(await screen.findByTestId('layar-login')).toBeVisible();
    expect(await perangkatSudahPunyaAdmin()).toBe(true);
  });
});
