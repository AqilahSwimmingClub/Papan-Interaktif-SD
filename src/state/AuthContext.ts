import { createContext } from 'react';
import type { Akun, KeadaanSesi, Peran, SesiAktif } from '../lib/types';
import type { DataMasuk, DataSetupAdmin } from '../lib/auth/authService';
import type { AppError } from '../lib/errors/AppError';

export interface NilaiAuth {
  /** Benar selama keadaan sesi belum selesai dibaca dari penyimpanan lokal. */
  memuat: boolean;
  keadaan: KeadaanSesi;
  sesi: SesiAktif | null;
  akun: Akun | null;
  peran: Peran | null;
  /** Galat tingkat lapisan masuk, misalnya penyimpanan lokal tidak tersedia. */
  galat: AppError | null;
  /**
   * Benar selama alur Setup Admin masih berjalan — akun Admin sudah dibuat,
   * tetapi langkah identitas sekolah belum diselesaikan atau dilewati.
   * Penjaga rute memakainya agar langkah 2 tidak langsung terlempar ke Login.
   */
  setupBerjalan: boolean;
  setupAdmin: (data: DataSetupAdmin) => Promise<Akun>;
  masuk: (data: DataMasuk) => Promise<SesiAktif>;
  selesaikanSetup: () => void;
  keluar: () => Promise<void>;
  segarkan: () => Promise<void>;
}

export const AuthContext = createContext<NilaiAuth | null>(null);
