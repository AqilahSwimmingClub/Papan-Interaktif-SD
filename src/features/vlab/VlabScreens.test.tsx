import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../routes/AppRoutes';
import { AuthProvider } from '../../state/AuthProvider';
import { buatAdminPertama, masuk } from '../../lib/auth/authService';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { KATALOG_VLAB } from '../../lib/vlab/katalogVlab';
import { resetPenyimpanan } from '../../test/bantuan';
import { RUTE, ruteVlab } from '../../routes/paths';

const ADMIN = {
  nama: 'Guru VLAB',
  username: 'guru.vlab',
  password: 'SandiVlab#2026',
  konfirmasi: 'SandiVlab#2026',
};

async function bukaVlab(rute: string) {
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

function observasi(): string {
  return screen.getByTestId('vlab-observasi').textContent ?? '';
}

function panggung(): string {
  return document.querySelector('.vlab-panggung')?.innerHTML ?? '';
}

async function geser(pengguna: ReturnType<typeof userEvent.setup>, label: RegExp, nilai: number) {
  const penggeser = screen.getByRole('slider', { name: label });
  await pengguna.clear(penggeser).catch(() => undefined);
  // Penggeser rentang diubah lewat perubahan nilai langsung agar uji tidak
  // bergantung pada jumlah langkah panah keyboard.
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set;
  setter?.call(penggeser, String(nilai));
  penggeser.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('katalog VLAB', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('menampilkan seluruh laboratorium dengan tujuan yang berbeda', async () => {
    await bukaVlab(RUTE.vlab);

    expect(await screen.findByTestId('katalog-vlab')).toBeInTheDocument();
    for (const profil of KATALOG_VLAB) {
      expect(screen.getByRole('heading', { name: profil.nama })).toBeVisible();
      expect(screen.getByText(profil.tujuan)).toBeVisible();
    }
    expect(screen.getAllByRole('link', { name: /Buka laboratorium/ })).toHaveLength(
      KATALOG_VLAB.length,
    );
  });

  it('menyaring laboratorium menurut rumpun materi', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(RUTE.vlab);

    await screen.findByTestId('katalog-vlab');
    await pengguna.click(screen.getByRole('button', { name: 'Listrik & Magnet' }));

    expect(screen.getByRole('heading', { name: 'Circuit Lab' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Magnet Lab' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Light Ray Lab' })).not.toBeInTheDocument();
  });

  it('menolak kode laboratorium yang tidak terdaftar', async () => {
    await bukaVlab(ruteVlab('lab-tidak-ada'));
    expect(
      await screen.findByRole('heading', { name: 'Laboratorium virtual tidak ditemukan' }),
    ).toBeVisible();
  });
});

describe('Light Ray Lab — alignment berubah, hasil berubah', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('meneruskan cahaya ke layar hanya saat lubang sejajar', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('light-ray'));
    await screen.findByTestId('vlab-light-ray');

    await pengguna.click(screen.getByRole('button', { name: 'Sejajarkan semua lubang' }));
    expect(screen.getByText('Cahaya sampai layar')).toBeVisible();
    const sesudahSejajar = observasi();
    const panggungSejajar = panggung();

    await geser(pengguna, /Lubang papan 2/, 10);
    expect(screen.getByText('Cahaya terhalang papan')).toBeVisible();
    expect(observasi()).not.toBe(sesudahSejajar);
    expect(panggung()).not.toBe(panggungSejajar);
  }, 20_000);

  it('mengembalikan keadaan awal lewat tombol reset', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('light-ray'));
    await screen.findByTestId('vlab-light-ray');

    await pengguna.click(screen.getByRole('button', { name: 'Sejajarkan semua lubang' }));
    const sesudahSejajar = observasi();
    await pengguna.click(screen.getByRole('button', { name: 'Reset' }));
    expect(observasi()).not.toBe(sesudahSejajar);
  }, 20_000);
});

describe('Mirror Lab — rotate cermin mengubah pantulan', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('mengubah arah sinar pantul dan gambar panggung', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('mirror'));
    await screen.findByTestId('vlab-mirror');

    const sebelum = observasi();
    const gambarSebelum = panggung();
    await geser(pengguna, /Sudut cermin/, 70);

    expect(observasi()).not.toBe(sebelum);
    expect(panggung()).not.toBe(gambarSebelum);
    expect(observasi()).toMatch(/Sudut datang .* sudut pantul/);
  }, 20_000);
});

describe('Material Lab — material berbeda, transmisi berbeda', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('mengubah golongan bahan dan bacaan sensor', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('material'));
    await screen.findByTestId('vlab-material');

    expect(screen.getByTestId('material-kategori')).toHaveTextContent('Transparan');
    const bacaanKaca = observasi();

    const kontrol = screen.getByRole('group', { name: 'Bahan pada baki' });
    await pengguna.click(within(kontrol).getByRole('button', { name: 'Kertas minyak' }));
    expect(screen.getByTestId('material-kategori')).toHaveTextContent('Translusen');

    await pengguna.click(within(kontrol).getByRole('button', { name: 'Papan kayu' }));
    expect(screen.getByTestId('material-kategori')).toHaveTextContent('Opak');
    expect(observasi()).not.toBe(bacaanKaca);
  }, 20_000);
});

describe('Shadow Lab — jarak berubah, bayangan berubah', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('memperbesar bayangan saat objek didekatkan ke lampu', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('shadow'));
    await screen.findByTestId('vlab-shadow');

    const bacaanAwal = observasi();
    await geser(pengguna, /Posisi objek/, 15);

    expect(observasi()).not.toBe(bacaanAwal);
    expect(observasi()).toMatch(/bayangan gelap setinggi/);
    expect(panggung()).toContain('polygon');
  }, 20_000);
});

describe('Refraction Lab — sudut berubah, sinar bias berubah', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('mengubah sudut bias dan arah pembelokan', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('refraction'));
    await screen.findByTestId('vlab-refraction');

    expect(screen.getByTestId('refraction-arah')).toHaveTextContent('mendekati garis normal');
    const sebelum = observasi();

    await geser(pengguna, /Sudut datang/, 75);
    expect(observasi()).not.toBe(sebelum);

    await pengguna.selectOptions(screen.getByLabelText('Medium atas'), 'kaca');
    await pengguna.selectOptions(screen.getByLabelText('Medium bawah'), 'udara');
    expect(screen.getByTestId('refraction-arah')).toHaveTextContent('Pemantulan sempurna');
  }, 20_000);
});

describe('Color Light Lab — kombinasi warna mengubah keluaran', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('mengganti warna layar saat lampu dinyalakan dan dipadamkan', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('color-light'));
    await screen.findByTestId('vlab-color-light');

    expect(screen.getByTestId('color-nama')).toHaveTextContent('Kuning');

    await pengguna.click(screen.getByRole('button', { name: /Lampu biru/ }));
    expect(screen.getByTestId('color-nama')).toHaveTextContent('Putih');

    await pengguna.click(screen.getByRole('button', { name: /Lampu merah/ }));
    expect(screen.getByTestId('color-nama')).toHaveTextContent('Sian');
  }, 20_000);
});

describe('VLAB lain memakai kontrol dan hasil masing-masing', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('Sound Lab menghentikan bunyi di ruang hampa', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('sound'));
    await screen.findByTestId('vlab-sound');

    expect(screen.getByTestId('sound-status')).toHaveTextContent('Bunyi terdengar');
    await pengguna.selectOptions(screen.getByLabelText('Medium perambatan'), 'hampa');
    expect(screen.getByTestId('sound-status')).toHaveTextContent('Bunyi tidak terdengar');
    expect(observasi()).toMatch(/ruang hampa/);
  }, 20_000);

  it('Food Chain Lab meruntuhkan rantai saat organisme dihilangkan', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('food-chain'));
    await screen.findByTestId('vlab-food-chain');

    expect(screen.getByTestId('food-chain-status')).toHaveTextContent('Ekosistem');
    const sebelum = observasi();
    const kontrol = screen.getByRole('group', { name: 'Organisme dalam ekosistem' });
    await pengguna.click(within(kontrol).getByRole('button', { name: /Rumput/ }));

    expect(screen.getByTestId('food-chain-status')).toHaveTextContent('Rantai makanan terputus');
    expect(observasi()).not.toBe(sebelum);
  }, 20_000);

  it('Magnet Lab membalik arah gaya saat kutub dibalik', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('magnet'));
    await screen.findByTestId('vlab-magnet');

    expect(screen.getByTestId('magnet-arah')).toHaveTextContent('tarik-menarik');
    await pengguna.click(screen.getByRole('button', { name: /Kutub magnet kanan/ }));
    expect(screen.getByTestId('magnet-arah')).toHaveTextContent('tolak-menolak');
  }, 20_000);

  it('Circuit Lab memadamkan lampu seri saat saklar dibuka', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('circuit'));
    await screen.findByTestId('vlab-circuit');

    expect(screen.getByTestId('circuit-status')).toHaveTextContent('Lampu menyala');
    await pengguna.click(screen.getByRole('button', { name: /Saklar/ }));
    expect(screen.getByTestId('circuit-status')).toHaveTextContent('Semua lampu padam');
    expect(observasi()).toMatch(/Rangkaian terbuka/);
  }, 20_000);

  it('Erosion Lab menurunkan erosi saat vegetasi ditambah', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('erosion'));
    await screen.findByTestId('vlab-erosion');

    const sebelum = screen.getByTestId('erosion-tingkat').textContent;
    await geser(pengguna, /Tutupan vegetasi/, 95);
    expect(screen.getByTestId('erosion-tingkat').textContent).not.toBe(sebelum);
    expect(observasi()).toMatch(/tutupan vegetasi 95%/);
  }, 20_000);

  it('Breathing Lab menandai oksigen kurang saat aktivitas berat', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('breathing'));
    await screen.findByTestId('vlab-breathing');

    const kontrol = screen.getByRole('group', { name: 'Aktivitas tubuh' });
    await pengguna.click(within(kontrol).getByRole('button', { name: /Berlari/ }));
    expect(screen.getByTestId('breathing-status')).toHaveTextContent('Pasokan oksigen kurang');
    expect(observasi()).toMatch(/ventilasi alveolar/);
  }, 20_000);

  it('Environment Lab menaikkan skor saat sampah dikelola', async () => {
    const pengguna = userEvent.setup();
    await bukaVlab(ruteVlab('environment'));
    await screen.findByTestId('vlab-environment');

    const sebelum = observasi();
    await geser(pengguna, /Sampah terkelola/, 100);
    expect(observasi()).not.toBe(sebelum);
    expect(screen.getByTestId('environment-kategori')).toHaveTextContent('Lingkungan');
  }, 20_000);
});

describe('setiap VLAB memakai panggung dan kontrol sendiri', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    tandaiOpeningSelesai();
  });

  it('tidak ada dua lab yang menampilkan panggung atau kesimpulan yang sama', async () => {
    const sidikPanggung = new Set<string>();
    const kesimpulan = new Set<string>();

    for (const profil of KATALOG_VLAB) {
      const tampilan = await bukaVlab(ruteVlab(profil.kode));
      await screen.findByTestId(`vlab-${profil.kode}`);

      expect(screen.getByRole('heading', { name: profil.nama })).toBeVisible();
      expect(screen.getByText(profil.tujuan)).toBeVisible();
      expect(screen.getByText(profil.petunjuk)).toBeVisible();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Ulangi percobaan' })).toBeVisible();
      expect(screen.getByTestId('vlab-observasi').textContent?.length).toBeGreaterThan(30);

      sidikPanggung.add(panggung());
      kesimpulan.add(screen.getByTestId('vlab-kesimpulan').textContent ?? '');

      tampilan.unmount();
      cleanup();
      await resetPenyimpanan();
    }

    expect(sidikPanggung.size).toBe(KATALOG_VLAB.length);
    expect(kesimpulan.size).toBe(KATALOG_VLAB.length);
  }, 90_000);
});
