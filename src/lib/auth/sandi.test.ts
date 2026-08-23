import { describe, expect, it } from 'vitest';
import {
  KDF_ALGORITMA,
  KDF_ITERASI,
  hashSandi,
  imbuhanAcak,
  periksaSandi,
  samaWaktuTetap,
  tokenAcak,
} from './sandi';

// Iterasi rendah khusus uji; produksi tetap memakai KDF_ITERASI.
const ITERASI_UJI = 1_000;

describe('turunan kunci sandi', () => {
  it('memakai fungsi turunan kunci lambat, bukan hash cepat', () => {
    expect(KDF_ALGORITMA).toBe('PBKDF2-SHA256');
    expect(KDF_ITERASI).toBeGreaterThanOrEqual(100_000);
  });

  it('tidak pernah menyimpan sandi sebagai teks terbuka', async () => {
    const sandi = 'SandiGuru#2026';
    const hasil = await hashSandi(sandi, ITERASI_UJI);

    expect(hasil.hash).not.toContain(sandi);
    expect(hasil.hash).not.toBe(sandi);
    expect(hasil.imbuhan).not.toContain(sandi);
    expect(hasil.iterasi).toBe(ITERASI_UJI);
  });

  it('memberi imbuhan acak berbeda untuk sandi yang sama', async () => {
    const satu = await hashSandi('SandiSama123', ITERASI_UJI);
    const dua = await hashSandi('SandiSama123', ITERASI_UJI);

    expect(satu.imbuhan).not.toBe(dua.imbuhan);
    expect(satu.hash).not.toBe(dua.hash);
  });

  it('menerima sandi benar dan menolak sandi salah', async () => {
    const hasil = await hashSandi('SandiBenar!9', ITERASI_UJI);

    await expect(periksaSandi('SandiBenar!9', hasil.hash, hasil.imbuhan, ITERASI_UJI)).resolves.toBe(
      true,
    );
    await expect(periksaSandi('SandiSalah!9', hasil.hash, hasil.imbuhan, ITERASI_UJI)).resolves.toBe(
      false,
    );
  });

  it('membandingkan hash dengan cara waktu tetap', () => {
    expect(samaWaktuTetap('abcdef', 'abcdef')).toBe(true);
    expect(samaWaktuTetap('abcdef', 'abcdeg')).toBe(false);
    expect(samaWaktuTetap('abcdef', 'abcde')).toBe(false);
  });

  it('membuat imbuhan dan token acak dengan panjang yang benar', () => {
    expect(imbuhanAcak()).toHaveLength(16);
    expect(tokenAcak()).toMatch(/^[0-9a-f]{64}$/);
    expect(tokenAcak()).not.toBe(tokenAcak());
  });
});
