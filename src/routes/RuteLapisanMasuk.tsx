import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/useAuth';
import { sudahMasuk } from '../lib/auth/keadaanSesi';
import { LayarMemuat } from '../components/LayarMemuat';
import { RUTE } from './paths';

interface Props {
  children: ReactNode;
  /** Layar ini hanya sah pada keadaan belum_setup (Setup Admin). */
  hanyaBelumSetup?: boolean;
  /** Layar ini tidak sah pada keadaan belum_setup (Login, Lupa Password). */
  butuhAdmin?: boolean;
}

/**
 * Penjaga untuk layar lapisan masuk. Sesi yang sudah sah tidak boleh kembali
 * ke Login; perangkat tanpa Admin hanya boleh membuka Setup Admin.
 */
export function RuteLapisanMasuk({ children, hanyaBelumSetup, butuhAdmin }: Props) {
  const { memuat, keadaan, setupBerjalan } = useAuth();

  if (memuat) return <LayarMemuat />;

  if (sudahMasuk(keadaan)) {
    return <Navigate to={RUTE.dasbor} replace />;
  }

  // Langkah 2 Setup Admin (identitas sekolah) berjalan setelah akun Admin
  // dibuat, jadi keadaan sudah bukan belum_setup — jangan lempar ke Login
  // selama alurnya belum diselesaikan atau dilewati.
  if (hanyaBelumSetup && keadaan !== 'belum_setup' && !setupBerjalan) {
    return <Navigate to={RUTE.masuk} replace />;
  }

  if (butuhAdmin && keadaan === 'belum_setup') {
    return <Navigate to={RUTE.setupAdmin} replace />;
  }

  return <>{children}</>;
}
