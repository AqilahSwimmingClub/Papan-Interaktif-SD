import { describe, expect, it } from 'vitest';
import { AppError } from '../errors/AppError';
import {
  kekuatanSandi,
  validasiKonfirmasi,
  validasiNama,
  validasiSandi,
  validasiUsername,
} from './validasi';

describe('validasi formulir lapisan masuk', () => {
  it('membersihkan nama dan menolak yang terlalu pendek', () => {
    expect(validasiNama('  Fahmi Djawas, S.Pd.  ')).toBe('Fahmi Djawas, S.Pd.');
    expect(() => validasiNama('Fa')).toThrow(AppError);
  });

  it('menormalkan username menjadi huruf kecil', () => {
    expect(validasiUsername('Fahmi.Djawas')).toBe('fahmi.djawas');
  });

  it('menolak username dengan karakter yang tidak diizinkan', () => {
    expect(() => validasiUsername('fahmi djawas')).toThrow(AppError);
    expect(() => validasiUsername('.fahmi')).toThrow(AppError);
    expect(() => validasiUsername('ab')).toThrow(AppError);
  });

  it('menolak sandi kurang dari delapan karakter', () => {
    expect(() => validasiSandi('pendek1')).toThrow(AppError);
    expect(validasiSandi('cukupPanjang1')).toBe('cukupPanjang1');
  });

  it('menolak konfirmasi yang belum sama', () => {
    expect(() => validasiKonfirmasi('SandiBaru1', 'SandiBaru2')).toThrow(AppError);
    expect(() => validasiKonfirmasi('SandiBaru1', 'SandiBaru1')).not.toThrow();
  });

  it('menghitung kekuatan sandi untuk empat batang indikator', () => {
    expect(kekuatanSandi('abc').tingkat).toBe('lemah');
    expect(kekuatanSandi('abcdefgh').skor).toBeGreaterThanOrEqual(1);
    expect(kekuatanSandi('Sandi#Kuat2026').skor).toBe(4);
  });
});
