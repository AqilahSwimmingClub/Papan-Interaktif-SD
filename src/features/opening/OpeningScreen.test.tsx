import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OpeningScreen } from './OpeningScreen';
import { TENGGANG_AUTOPLAY_MS, pilihObjectFit } from './aturanOpening';
import { RUTE } from '../../routes/paths';
import { KUNCI_OPENING, openingSudahTampil, resetOpening } from '../../lib/opening/pemutaranOpening';

function pasang() {
  return render(
    <MemoryRouter initialEntries={[RUTE.pembuka]}>
      <Routes>
        <Route path={RUTE.pembuka} element={<OpeningScreen />} />
        <Route path={RUTE.akar} element={<p>LAPISAN LOGIN</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function videoOpening(): HTMLVideoElement {
  const video = document.querySelector('video');
  if (!video) throw new Error('Elemen video Opening tidak ditemukan.');
  return video as HTMLVideoElement;
}

describe('layar opening', () => {
  beforeEach(() => {
    resetOpening();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('memutar otomatis tanpa suara, layar penuh, dan tidak melooping', () => {
    pasang();
    const video = videoOpening();

    expect(video).toHaveAttribute('autoplay');
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(false);
    expect(video.controls).toBe(false);
    expect(screen.getByTestId('layar-opening')).toBeInTheDocument();
  });

  it('TIDAK menyediakan tombol Skip, Lewati, atau tutup', () => {
    pasang();

    const tombol = screen.queryAllByRole('button');
    const teks = tombol.map((simpul) => simpul.textContent?.toLowerCase() ?? '');
    for (const kata of ['skip', 'lewati', 'tutup', 'close', 'lanjut']) {
      expect(teks.some((isi) => isi.includes(kata))).toBe(false);
    }
    expect(screen.queryByText(/lewati/i)).toBeNull();
    expect(screen.queryByText(/skip/i)).toBeNull();
  });

  it('Esc dan klik tidak melewatkan video', () => {
    pasang();

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByTestId('layar-opening'));
    fireEvent.click(videoOpening());

    expect(screen.queryByText('LAPISAN LOGIN')).toBeNull();
    expect(openingSudahTampil()).toBe(false);
  });

  it('meneruskan ke Login setelah video selesai, lewat transisi lembut', async () => {
    vi.useFakeTimers();
    pasang();

    act(() => {
      fireEvent.ended(videoOpening());
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText('LAPISAN LOGIN')).toBeInTheDocument();
    expect(globalThis.sessionStorage.getItem(KUNCI_OPENING)).toBe('1');
  });

  it('video yang gagal dimuat langsung meneruskan ke Login tanpa pesan galat', async () => {
    vi.useFakeTimers();
    pasang();

    act(() => {
      fireEvent.error(videoOpening());
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText('LAPISAN LOGIN')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('batas waktu aman durasi + 5 detik meneruskan sendiri', async () => {
    vi.useFakeTimers();
    pasang();
    const video = videoOpening();

    Object.defineProperty(video, 'duration', { value: 10, configurable: true });
    Object.defineProperty(video, 'videoWidth', { value: 1920, configurable: true });
    Object.defineProperty(video, 'videoHeight', { value: 1080, configurable: true });

    act(() => {
      fireEvent.loadedMetadata(video);
    });

    // Sebelum batas: belum berpindah.
    act(() => {
      vi.advanceTimersByTime(14_000);
    });
    expect(screen.queryByText('LAPISAN LOGIN')).toBeNull();

    // Durasi 10 detik + margin 5 detik = 15 detik, lalu transisi 400 ms.
    act(() => {
      vi.advanceTimersByTime(1_400);
    });
    expect(screen.getByText('LAPISAN LOGIN')).toBeInTheDocument();
  });

  it('meneruskan sendiri bila metadata video tidak pernah tiba', async () => {
    vi.useFakeTimers();
    pasang();

    act(() => {
      vi.advanceTimersByTime(15_400);
    });

    expect(screen.getByText('LAPISAN LOGIN')).toBeInTheDocument();
  });

  it('menyediakan lencana Ketuk untuk suara, bukan tombol lewati', async () => {
    pasang();

    const lencana = screen.getByRole('button', { name: /ketuk untuk suara/i });
    expect(lencana).toBeInTheDocument();

    fireEvent.click(lencana);

    await waitFor(() => {
      expect(videoOpening().muted).toBe(false);
    });
    // Menyalakan suara tidak melewatkan video.
    expect(screen.queryByText('LAPISAN LOGIN')).toBeNull();
  });

  it('penolakan autoplay tidak langsung melompat, tetapi tidak membiarkan layar hitam', async () => {
    const asli = HTMLMediaElement.prototype.play;
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      writable: true,
      value: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
    });

    try {
      vi.useFakeTimers();
      pasang();

      // Masa tenggang belum lewat: masih di Opening.
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.queryByText('LAPISAN LOGIN')).toBeNull();

      act(() => {
        vi.advanceTimersByTime(TENGGANG_AUTOPLAY_MS + 400);
      });
      expect(screen.getByText('LAPISAN LOGIN')).toBeInTheDocument();
    } finally {
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        writable: true,
        value: asli,
      });
    }
  });

  it('tidak melompat bila video ternyata berjalan setelah janji play ditolak', async () => {
    const asli = HTMLMediaElement.prototype.play;
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      writable: true,
      value: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
    });

    try {
      vi.useFakeTimers();
      pasang();
      const video = videoOpening();
      Object.defineProperty(video, 'paused', { value: false, configurable: true });
      Object.defineProperty(video, 'currentTime', { value: 1.5, configurable: true });

      await act(async () => {
        await Promise.resolve();
      });
      act(() => {
        vi.advanceTimersByTime(TENGGANG_AUTOPLAY_MS + 400);
      });

      expect(screen.queryByText('LAPISAN LOGIN')).toBeNull();
    } finally {
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        writable: true,
        value: asli,
      });
    }
  });

  it('mempertahankan rasio: contain bila selisih rasio besar, cover bila rapat', () => {
    // Video 16:9 pada HP tegak 390x844 → selisih besar → contain (letterbox navy).
    expect(pilihObjectFit(1920 / 1080, 390 / 844)).toBe('contain');
    // Video 16:9 pada papan 1920x1080 → rasio sama → cover.
    expect(pilihObjectFit(1920 / 1080, 1920 / 1080)).toBe('cover');
    // Selisih tepat di bawah ambang 0,25 → cover.
    expect(pilihObjectFit(1.78, 1.6)).toBe('cover');
    expect(pilihObjectFit(Number.NaN, 1.78)).toBe('contain');
  });
});
