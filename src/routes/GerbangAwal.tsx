import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/useAuth';
import { sudahMasuk } from '../lib/auth/keadaanSesi';
import { openingSudahTampil } from '../lib/opening/pemutaranOpening';
import { LayarMemuat } from '../components/LayarMemuat';
import { RUTE } from './paths';

/**
 * Titik masuk "/". Urutannya mengikuti Tahap 11 §01:
 * Opening → Setup Admin (bila perangkat belum punya Admin) → Login → Dashboard.
 */
export function GerbangAwal() {
  const { memuat, keadaan } = useAuth();

  if (!openingSudahTampil()) {
    return <Navigate to={RUTE.pembuka} replace />;
  }

  if (memuat) return <LayarMemuat />;

  if (keadaan === 'belum_setup') return <Navigate to={RUTE.setupAdmin} replace />;
  if (sudahMasuk(keadaan)) return <Navigate to={RUTE.dasbor} replace />;
  return <Navigate to={RUTE.masuk} replace />;
}
