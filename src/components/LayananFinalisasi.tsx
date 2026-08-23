import { useEffect } from 'react';
import { useAuth } from '../state/useAuth';
import { mulaiSinkronisasiAntreanAi } from '../lib/offline/antreanAi';
import { pastikanCadanganHarian } from '../lib/storage/pelengkapRepo';
import { log } from '../lib/errors/logger';

/** Layanan local-first yang hidup selama aplikasi terbuka, tanpa menghasilkan UI baru. */
export function LayananFinalisasi() {
  const { sesi } = useAuth();

  useEffect(() => mulaiSinkronisasiAntreanAi(), []);

  useEffect(() => {
    if (!sesi) return;
    void pastikanCadanganHarian().catch((galat: unknown) =>
      log.galat('Cadangan lokal harian gagal dibuat.', galat),
    );
  }, [sesi]);

  return null;
}
