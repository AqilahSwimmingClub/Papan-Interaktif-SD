import { Route, Routes } from 'react-router-dom';
import { GerbangAwal } from './GerbangAwal';
import { RuteLapisanMasuk } from './RuteLapisanMasuk';
import { RuteTerlindungi } from './RuteTerlindungi';
import { RUTE } from './paths';
import { OpeningScreen } from '../features/opening/OpeningScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { SetupAdminScreen } from '../features/auth/SetupAdminScreen';
import { LupaPasswordScreen } from '../features/auth/LupaPasswordScreen';
import { BerandaTerlindungi } from '../features/dashboard/BerandaTerlindungi';
import { LayarTidakDitemukan } from './LayarTidakDitemukan';

/**
 * Peta rute Tahap 1.
 *
 * Hanya empat rute yang terbuka tanpa sesi: Opening, Setup Admin, Login, dan
 * Lupa Password. Rute tahap berikutnya ditambahkan di dalam <RuteTerlindungi>
 * sehingga penjagaan sesi tidak perlu dipasang ulang per layar.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path={RUTE.akar} element={<GerbangAwal />} />

      <Route path={RUTE.pembuka} element={<OpeningScreen />} />

      <Route
        path={RUTE.setupAdmin}
        element={
          <RuteLapisanMasuk hanyaBelumSetup>
            <SetupAdminScreen />
          </RuteLapisanMasuk>
        }
      />

      <Route
        path={RUTE.masuk}
        element={
          <RuteLapisanMasuk butuhAdmin>
            <LoginScreen />
          </RuteLapisanMasuk>
        }
      />

      <Route
        path={RUTE.lupaPassword}
        element={
          <RuteLapisanMasuk butuhAdmin>
            <LupaPasswordScreen />
          </RuteLapisanMasuk>
        }
      />

      <Route
        path={RUTE.dasbor}
        element={
          <RuteTerlindungi>
            <BerandaTerlindungi />
          </RuteTerlindungi>
        }
      />

      <Route path="*" element={<LayarTidakDitemukan />} />
    </Routes>
  );
}
