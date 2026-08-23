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
import { KurikulumProvider } from '../state/KurikulumProvider';
import { KerangkaGuru } from '../features/guru/KerangkaGuru';
import { PilihKelasScreen } from '../features/kurikulum/PilihKelasScreen';
import { PilihMapelScreen } from '../features/kurikulum/PilihMapelScreen';
import { CpTpScreen } from '../features/kurikulum/CpTpScreen';
import { FiturPembelajaranScreen } from '../features/pembelajaran/FiturPembelajaranScreen';
import { FiturMenyusulScreen } from '../features/guru/FiturMenyusulScreen';

/**
 * Peta rute aplikasi sampai Tahap 2.
 *
 * Hanya empat rute yang terbuka tanpa sesi: Opening, Setup Admin, Login, dan
 * Lupa Password. Rute kerja guru ditambahkan di dalam <RuteTerlindungi>
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
        element={
          <RuteTerlindungi>
            <KurikulumProvider>
              <KerangkaGuru />
            </KurikulumProvider>
          </RuteTerlindungi>
        }
      >
        <Route path={RUTE.dasbor} element={<BerandaTerlindungi />} />
        <Route path={RUTE.kelas} element={<PilihKelasScreen />} />
        <Route path={`${RUTE.kelas}/:tingkat/mapel`} element={<PilihMapelScreen />} />
        <Route path={`${RUTE.kelas}/:tingkat/mapel/:mapelKode`} element={<CpTpScreen />} />
        <Route path="/pembelajaran/:jenis" element={<FiturPembelajaranScreen />} />
        <Route path="/fitur/:fitur" element={<FiturMenyusulScreen />} />
      </Route>

      <Route path="*" element={<LayarTidakDitemukan />} />
    </Routes>
  );
}
