import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AuthContext, type NilaiAuth } from './AuthContext';
import type { KeadaanSesi, SesiAktif } from '../lib/types';
import {
  buatAdminPertama,
  keluar as keluarService,
  masuk as masukService,
  perangkatSudahPunyaAdmin,
  sesiSekarang,
  type DataMasuk,
  type DataSetupAdmin,
} from '../lib/auth/authService';
import { keadaanSesi } from '../lib/auth/keadaanSesi';
import { keAppError, type AppError } from '../lib/errors/AppError';
import { log } from '../lib/errors/logger';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [memuat, setMemuat] = useState(true);
  const [adaAdmin, setAdaAdmin] = useState(false);
  const [sesi, setSesi] = useState<SesiAktif | null>(null);
  const [baruKeluar, setBaruKeluar] = useState(false);
  const [setupBerjalan, setSetupBerjalan] = useState(false);
  const [galat, setGalat] = useState<AppError | null>(null);
  const terpasang = useRef(true);

  useEffect(() => {
    terpasang.current = true;
    return () => {
      terpasang.current = false;
    };
  }, []);

  const segarkan = useCallback(async () => {
    try {
      const [admin, aktif] = await Promise.all([perangkatSudahPunyaAdmin(), sesiSekarang()]);
      if (!terpasang.current) return;
      setAdaAdmin(admin);
      setSesi(aktif);
      setGalat(null);
    } catch (mentah) {
      const kesalahan = keAppError(mentah);
      log.galat('Keadaan sesi gagal dibaca.', kesalahan);
      if (!terpasang.current) return;
      setGalat(kesalahan);
    } finally {
      if (terpasang.current) setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void segarkan();
  }, [segarkan]);

  const setupAdmin = useCallback(async (data: DataSetupAdmin) => {
    const akun = await buatAdminPertama(data);
    setAdaAdmin(true);
    setBaruKeluar(false);
    setSetupBerjalan(true);
    return akun;
  }, []);

  const masuk = useCallback(async (data: DataMasuk) => {
    const aktif = await masukService(data);
    setSesi(aktif);
    setAdaAdmin(true);
    setBaruKeluar(false);
    setSetupBerjalan(false);
    return aktif;
  }, []);

  const selesaikanSetup = useCallback(() => {
    setSetupBerjalan(false);
  }, []);

  const keluar = useCallback(async () => {
    await keluarService();
    setSesi(null);
    setBaruKeluar(true);
  }, []);

  const keadaan: KeadaanSesi = useMemo(
    () => keadaanSesi({ adaAdmin, sesi, baruKeluar }),
    [adaAdmin, sesi, baruKeluar],
  );

  const nilai: NilaiAuth = useMemo(
    () => ({
      memuat,
      keadaan,
      sesi,
      akun: sesi?.akun ?? null,
      peran: sesi?.akun.peran ?? null,
      galat,
      setupBerjalan,
      setupAdmin,
      masuk,
      selesaikanSetup,
      keluar,
      segarkan,
    }),
    [
      memuat,
      keadaan,
      sesi,
      galat,
      setupBerjalan,
      setupAdmin,
      masuk,
      selesaikanSetup,
      keluar,
      segarkan,
    ],
  );

  return <AuthContext.Provider value={nilai}>{children}</AuthContext.Provider>;
}
