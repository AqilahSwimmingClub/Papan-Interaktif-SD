import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { buatAdminPertama, masuk } from '../../lib/auth/authService';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { simpanKonteksKurikulum } from '../../lib/storage/kurikulumRepo';
import { resetPenyimpanan, semaiRantaiTpUji } from '../../test/bantuan';
import { RUTE } from '../../routes/paths';

const ADMIN = {
  nama: 'Guru Penguji Lanjutan',
  username: 'guru.lanjutan',
  password: 'SandiAdmin#2026',
  konfirmasi: 'SandiAdmin#2026',
};

async function siapkanAkun() {
  const akun = await buatAdminPertama(ADMIN);
  await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });
  return akun;
}

function buka(rute: string) {
  return render(
    <MemoryRouter initialEntries={[rute]}>
      <AuthProvider><AppRoutes /></AuthProvider>
    </MemoryRouter>,
  );
}

describe('layar Tahap 3–6', () => {
  beforeEach(async () => { await resetPenyimpanan(); tandaiOpeningSelesai(); });

  it('menampilkan status struktur baru tanpa cacah CP/TP lama', async () => {
    await siapkanAkun();
    buka(RUTE.strukturKurikulum);
    expect(await screen.findByText('Semua relasi struktur sehat')).toBeVisible();
    expect(screen.getByText('Kelas', { selector: '.statistik-basis span' })).toBeVisible();
    expect(screen.getByText('Buku referensi', { selector: '.statistik-basis span' })).toBeVisible();
    for (const angka of ['47', '221', '212']) {
      expect(
        screen.queryByText(angka, { selector: '.statistik-basis strong' }),
      ).not.toBeInTheDocument();
    }
    const rantai = await screen.findByRole('region', { name: 'Kesiapan rantai isi' });
    expect(rantai.querySelectorAll('li[data-keadaan="menunggu_buku"]').length).toBe(9);
  });

  it('menambah siswa dan membuat kelompok yang persisten lokal', async () => {
    const pengguna = userEvent.setup();
    await siapkanAkun();
    buka(RUTE.kelompok);
    const input = await screen.findByLabelText('Tambah siswa');
    await pengguna.type(input, 'Aisyah Penguji');
    await pengguna.click(screen.getByRole('button', { name: 'Tambah' }));
    expect(await screen.findByText('1 siswa belum dikelompokkan')).toBeVisible();
    await pengguna.click(screen.getByRole('button', { name: 'Buat Kelompok' }));
    expect(await screen.findByText('Aisyah Penguji')).toBeVisible();
    expect(screen.getByText('Melati')).toBeVisible();
  });

  it('membuka seluruh layar pelengkap utama dari rute terlindungi', async () => {
    await siapkanAkun();
    const daftar = [
      [RUTE.rekap, 'Rekap CP/TP'], [RUTE.media, 'Media Pembelajaran'],
      [RUTE.profil, 'Profil Sekolah & Guru'], [RUTE.backup, 'Backup & Restore'],
      [RUTE.offline, 'Offline / PWA'],
    ] as const;
    for (const [rute, judul] of daftar) {
      const tampilan = buka(rute);
      expect(await screen.findByRole('heading', { name: judul })).toBeVisible();
      tampilan.unmount(); cleanup();
    }
  });

  it('tidak menemukan CP/TP lama, dan hanya mencari data yang benar-benar ada', async () => {
    const pengguna = userEvent.setup();
    await siapkanAkun();
    buka(RUTE.pencarian);

    const kotak = await screen.findByPlaceholderText(/Cari TP/);
    await pengguna.type(kotak, 'pecahan');
    expect(screen.queryByText(/TP-MAT-/)).not.toBeInTheDocument();

    // Setelah satu TP tersedia (kelak dari Buku Referensi), pencarian bekerja.
    await semaiRantaiTpUji();
    await pengguna.clear(kotak);
    await pengguna.type(kotak, 'pecahan');
    expect(await screen.findByRole('heading', { name: 'Kurikulum' })).toBeVisible();
    expect((await screen.findAllByText(/pecahan/i)).length).toBeGreaterThan(0);
  }, 20_000);

  it('menyediakan alat utama serta alat ukur interaktif pada papan', async () => {
    const pengguna = userEvent.setup();
    const akun = await siapkanAkun();
    const rantai = await semaiRantaiTpUji();
    await simpanKonteksKurikulum(akun.id, {
      tingkat_kelas: 1, fase_kode: 'A', mapel_kode: 'MAT', cabang_kode: null,
      agama_kode: null, cp_id: rantai.cpId, elemen_id: rantai.elemenId,
      tp_id: rantai.tpId, materi_id: null, referensi_id: null, referensi_bab_id: null,
    });
    buka(RUTE.papan);
    const toolbar = await screen.findByRole('navigation', { name: 'Delapan alat utama' });
    expect(within(toolbar).getByRole('button', { name: /Pena/ })).toBeVisible();
    expect(within(toolbar).getByRole('button', { name: /Undo \/ Redo/ })).toBeVisible();
    await pengguna.click(within(toolbar).getByRole('button', { name: /Alat lainnya/ }));
    const laci = await screen.findByRole('heading', { name: 'Alat lainnya' });
    const aside = laci.closest('aside')!;
    expect(within(aside).getByRole('button', { name: 'Penggaris' })).toBeVisible();
    expect(within(aside).getByRole('button', { name: 'Segitiga siku-siku' })).toBeVisible();
    expect(within(aside).getByRole('button', { name: 'Simpan sesi' })).toBeVisible();
    expect(within(aside).getAllByRole('button')).toHaveLength(18);
    await pengguna.click(within(aside).getByRole('button', { name: 'Penggaris' }));
    expect(document.querySelector('.objek-visual--penggaris')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeVisible();
  });

  it('Mode Siswa dan Mode Kelas memakai tata letak tersendiri tanpa sidebar', async () => {
    const akun = await siapkanAkun();
    const rantai = await semaiRantaiTpUji();
    await simpanKonteksKurikulum(akun.id, {
      tingkat_kelas: 1, fase_kode: 'A', mapel_kode: 'MAT', cabang_kode: null,
      agama_kode: null, cp_id: rantai.cpId, elemen_id: rantai.elemenId,
      tp_id: rantai.tpId, materi_id: null, referensi_id: null, referensi_bab_id: null,
    });
    const siswa = buka(RUTE.modeSiswa);
    expect(await screen.findByRole('heading', { name: 'Masukkan kode' })).toBeVisible();
    expect(document.querySelector('.guru-sidebar')).not.toBeInTheDocument();
    siswa.unmount(); cleanup();
    buka(RUTE.modeKelas);
    expect(await screen.findByTestId('mode-kelas')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Siapkan materi untuk TP aktif' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Buka VLAB' })).toBeVisible();
    expect(document.querySelector('.guru-sidebar')).not.toBeInTheDocument();
  });
});
