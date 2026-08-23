import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IdentitasPembuat, TEKS_IDENTITAS } from './IdentitasPembuat';

describe('identitas pembuat', () => {
  it('menampilkan ketiga baris dengan teks persis', () => {
    render(<IdentitasPembuat />);

    expect(screen.getByText('Dirancang & Dikembangkan oleh')).toBeInTheDocument();
    expect(screen.getByText('FAHMI DJAWAS, S.Pd.')).toBeInTheDocument();
    expect(
      screen.getByText('© 2026 PAPAN INTERAKTIF SD — Semua Hak Dilindungi'),
    ).toBeInTheDocument();
  });

  it('memuat kalimat hak cipta utuh, tidak dipendekkan', () => {
    expect(TEKS_IDENTITAS.hakCipta).toBe('© 2026 PAPAN INTERAKTIF SD — Semua Hak Dilindungi');
    expect(TEKS_IDENTITAS.nama).toBe('FAHMI DJAWAS, S.Pd.');
  });

  it('memakai SATU container dengan tiga baris rata tengah', () => {
    render(<IdentitasPembuat />);
    const wadah = screen.getByTestId('identitas-pembuat');
    const baris = wadah.querySelectorAll('p');

    // Satu container, tiga anak — bukan dua kolom kiri-kanan.
    expect(baris).toHaveLength(3);
    expect(baris[0]).toHaveTextContent(TEKS_IDENTITAS.pengantar);
    expect(baris[1]).toHaveTextContent(TEKS_IDENTITAS.nama);
    expect(baris[2]).toHaveTextContent(TEKS_IDENTITAS.hakCipta);
    expect(wadah.className).toContain('identitas-pembuat');
  });

  it('urutan barisnya tetap sama pada ukuran ringkas maupun besar', () => {
    const { rerender } = render(<IdentitasPembuat ukuran="ringkas" />);
    let baris = screen.getByTestId('identitas-pembuat').querySelectorAll('p');
    expect(baris[1]).toHaveTextContent(TEKS_IDENTITAS.nama);

    rerender(<IdentitasPembuat ukuran="besar" />);
    baris = screen.getByTestId('identitas-pembuat').querySelectorAll('p');
    expect(baris).toHaveLength(3);
    expect(baris[1]).toHaveTextContent(TEKS_IDENTITAS.nama);
  });
});
