import { createContext } from 'react';
import type { KonteksKurikulum, KodeFase } from '../lib/types';
import type { AppError } from '../lib/errors/AppError';

export interface PilihanMapel {
  mapelKode: string;
  cpId: string;
  cabangKode: string | null;
  agamaKode: string | null;
}

export interface NilaiKurikulum {
  memuat: boolean;
  galat: AppError | null;
  konteks: KonteksKurikulum;
  pilihKelas: (tingkat: number, faseKode: KodeFase) => void;
  pilihMapel: (pilihan: PilihanMapel) => void;
  pilihElemen: (elemenId: string) => void;
  pilihTp: (tpId: string) => void;
  pilihReferensi: (referensiId: string | null, referensiBabId?: string | null) => void;
  segarkan: () => Promise<void>;
}

export const KurikulumContext = createContext<NilaiKurikulum | null>(null);
