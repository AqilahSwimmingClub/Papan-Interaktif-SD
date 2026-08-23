import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { keAppError, type AppError } from '../lib/errors/AppError';
import { log } from '../lib/errors/logger';
import type { KonteksKurikulum, KodeFase } from '../lib/types';
import {
  bacaKonteksKurikulum,
  KONTEKS_KURIKULUM_KOSONG,
  pastikanKurikulumTersedia,
  simpanKonteksKurikulum,
} from '../lib/storage/kurikulumRepo';
import { useAuth } from './useAuth';
import { KurikulumContext, type NilaiKurikulum, type PilihanMapel } from './KurikulumContext';

export function KurikulumProvider({ children }: { children: ReactNode }) {
  const { akun } = useAuth();
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<AppError | null>(null);
  const [konteks, setKonteks] = useState<KonteksKurikulum>({
    ...KONTEKS_KURIKULUM_KOSONG,
  });

  const segarkan = useCallback(async () => {
    if (!akun) return;
    setMemuat(true);
    try {
      await pastikanKurikulumTersedia();
      setKonteks(await bacaKonteksKurikulum(akun.id));
      setGalat(null);
    } catch (mentah) {
      const kesalahan = keAppError(mentah);
      log.galat('Kurikulum lokal gagal disiapkan.', kesalahan);
      setGalat(kesalahan);
    } finally {
      setMemuat(false);
    }
  }, [akun]);

  useEffect(() => {
    void segarkan();
  }, [segarkan]);

  const perbarui = useCallback(
    (pembentuk: (lama: KonteksKurikulum) => KonteksKurikulum) => {
      if (!akun) return;
      setKonteks((lama) => {
        const baru = pembentuk(lama);
        if (baru === lama) return lama;
        void simpanKonteksKurikulum(akun.id, baru).catch((kesalahan: unknown) => {
          log.galat('Konteks kurikulum gagal disimpan.', kesalahan);
        });
        return baru;
      });
    },
    [akun],
  );

  const pilihKelas = useCallback(
    (tingkat: number, faseKode: KodeFase) => {
      perbarui((lama) =>
        lama.tingkat_kelas === tingkat && lama.fase_kode === faseKode
          ? lama
          : {
              ...KONTEKS_KURIKULUM_KOSONG,
              tingkat_kelas: tingkat,
              fase_kode: faseKode,
            },
      );
    },
    [perbarui],
  );

  const pilihMapel = useCallback(
    ({ mapelKode, cpId, cabangKode, agamaKode }: PilihanMapel) => {
      perbarui((lama) =>
        lama.mapel_kode === mapelKode && lama.cp_id === cpId
          ? lama
          : {
              ...lama,
              mapel_kode: mapelKode,
              cabang_kode: cabangKode,
              agama_kode: agamaKode,
              cp_id: cpId,
              elemen_id: null,
              tp_id: null,
              materi_id: null,
              referensi_id: null,
              referensi_bab_id: null,
            },
      );
    },
    [perbarui],
  );

  const pilihElemen = useCallback(
    (elemenId: string) => {
      perbarui((lama) =>
        lama.elemen_id === elemenId
          ? lama
          : { ...lama, elemen_id: elemenId, tp_id: null, materi_id: null },
      );
    },
    [perbarui],
  );

  const pilihTp = useCallback(
    (tpId: string) => {
      perbarui((lama) => (lama.tp_id === tpId ? lama : { ...lama, tp_id: tpId, materi_id: null }));
    },
    [perbarui],
  );

  const pilihReferensi = useCallback(
    (referensiId: string | null, referensiBabId: string | null = null) => {
      perbarui((lama) =>
        lama.referensi_id === referensiId && lama.referensi_bab_id === referensiBabId
          ? lama
          : { ...lama, referensi_id: referensiId, referensi_bab_id: referensiBabId },
      );
    },
    [perbarui],
  );

  const nilai: NilaiKurikulum = useMemo(
    () => ({ memuat, galat, konteks, pilihKelas, pilihMapel, pilihElemen, pilihTp, pilihReferensi, segarkan }),
    [memuat, galat, konteks, pilihKelas, pilihMapel, pilihElemen, pilihTp, pilihReferensi, segarkan],
  );

  return <KurikulumContext.Provider value={nilai}>{children}</KurikulumContext.Provider>;
}
