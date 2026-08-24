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
import { MateriScreen } from '../features/pembelajaran/MateriScreen';
import { PapanInteraktifScreen } from '../features/papan/PapanInteraktifScreen';
import { KelompokSiswaScreen } from '../features/pelengkap/KelompokSiswaScreen';
import { RekapCpTpScreen } from '../features/pelengkap/RekapCpTpScreen';
import { MediaScreen } from '../features/pelengkap/MediaScreen';
import { PencarianScreen } from '../features/pelengkap/PencarianScreen';
import { ProfilScreen } from '../features/pelengkap/ProfilScreen';
import { BackupScreen } from '../features/pelengkap/BackupScreen';
import { OfflineScreen } from '../features/pelengkap/OfflineScreen';
import { ModeSiswaScreen } from '../features/pelengkap/ModeSiswaScreen';
import { ModeKelasScreen } from '../features/pelengkap/ModeKelasScreen';
import { BasisDataScreen } from '../features/kurikulum/BasisDataScreen';
import { KelolaTpSekolahScreen } from '../features/kurikulum/KelolaTpSekolahScreen';
import { MuatCpScreen } from '../features/kurikulum/MuatCpScreen';
import { MenuLainnyaScreen } from '../features/guru/MenuLainnyaScreen';
import { KatalogGameScreen } from '../features/game/KatalogGameScreen';
import { GameRunnerScreen } from '../features/game/GameRunnerScreen';
import { ReferensiScreen } from '../features/referensi/ReferensiScreen';
import { PemetaanReferensiScreen } from '../features/referensi/PemetaanReferensiScreen';
import { KelolaAkunScreen } from '../features/auth/KelolaAkunScreen';
import { TentangAplikasiScreen } from '../features/pelengkap/TentangAplikasiScreen';
import { AiStudioScreen } from '../features/ai/AiStudioScreen';
import { DataSiswaScreen } from '../features/pelengkap/DataSiswaScreen';
import { PenilaianScreen } from '../features/pelengkap/PenilaianScreen';
import { KonfigurasiAiScreen } from '../features/ai/KonfigurasiAiScreen';
import { IpasKelas5Screen } from '../features/ipas/IpasKelas5Screen';
import { VirtualLabScreen } from '../features/ipas/VirtualLabScreen';
import { AlatMatematikaScreen, KuisLangsungScreen, PoinKelompokScreen, TimerKelasScreen, UndianNamaScreen } from '../features/kelas/AlatKelasScreens';
import { DualWindowScreen } from '../features/game/DualWindowScreen';
import { VlabHubScreen } from '../features/vlab/VlabHubScreen';
import { GantiPasswordScreen, GantiProfilScreen, ProfilSekolahScreen } from '../features/pelengkap/ProfilRoleScreens';

/**
 * Peta rute aplikasi sampai Tahap 11.
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
        <Route path={RUTE.kuisLangsung} element={<RuteTerlindungi peranDiizinkan={['guru']}><KuisLangsungScreen /></RuteTerlindungi>} />
        <Route path={RUTE.alatMatematika} element={<RuteTerlindungi peranDiizinkan={['guru']}><AlatMatematikaScreen /></RuteTerlindungi>} />
        <Route path={RUTE.undianNama} element={<RuteTerlindungi peranDiizinkan={['guru']}><UndianNamaScreen /></RuteTerlindungi>} />
        <Route path={RUTE.timerKelas} element={<RuteTerlindungi peranDiizinkan={['guru']}><TimerKelasScreen /></RuteTerlindungi>} />
        <Route path={RUTE.poinKelompok} element={<RuteTerlindungi peranDiizinkan={['guru']}><PoinKelompokScreen /></RuteTerlindungi>} />
        <Route path={RUTE.vlab} element={<RuteTerlindungi peranDiizinkan={['guru']}><VlabHubScreen /></RuteTerlindungi>} />
        <Route path={RUTE.dualWindow} element={<RuteTerlindungi peranDiizinkan={['guru']}><DualWindowScreen /></RuteTerlindungi>} />
        <Route path={RUTE.kelas} element={<PilihKelasScreen />} />
        <Route path={RUTE.kelompok} element={<KelompokSiswaScreen />} />
        <Route path={RUTE.dataSiswa} element={<DataSiswaScreen />} />
        <Route path={RUTE.penilaian} element={<PenilaianScreen />} />
        <Route path={RUTE.rekap} element={<RekapCpTpScreen />} />
        <Route path={`${RUTE.kelas}/:tingkat/mapel`} element={<PilihMapelScreen />} />
        <Route path={`${RUTE.kelas}/:tingkat/mapel/:mapelKode`} element={<CpTpScreen />} />
        <Route path={RUTE.materi} element={<MateriScreen />} />
        <Route path={RUTE.papan} element={<PapanInteraktifScreen />} />
        <Route path={RUTE.media} element={<MediaScreen />} />
        <Route path={RUTE.pencarian} element={<PencarianScreen />} />
        <Route path={RUTE.profil} element={<ProfilScreen />} />
        <Route path={RUTE.profilGuru} element={<RuteTerlindungi peranDiizinkan={['guru']}><GantiProfilScreen /></RuteTerlindungi>} />
        <Route path={RUTE.gantiPassword} element={<RuteTerlindungi peranDiizinkan={['guru']}><GantiPasswordScreen /></RuteTerlindungi>} />
        <Route path={RUTE.profilSekolah} element={<RuteTerlindungi peranDiizinkan={['admin']}><ProfilSekolahScreen /></RuteTerlindungi>} />
        <Route path={RUTE.profilAdmin} element={<RuteTerlindungi peranDiizinkan={['admin']}><GantiProfilScreen admin /></RuteTerlindungi>} />
        <Route
          path={RUTE.kelolaAkun}
          element={
            <RuteTerlindungi peranDiizinkan={['admin']}>
              <KelolaAkunScreen />
            </RuteTerlindungi>
          }
        />
        <Route path={RUTE.dataGuru} element={<RuteTerlindungi peranDiizinkan={['admin']}><KelolaAkunScreen /></RuteTerlindungi>} />
        <Route path={RUTE.resetPasswordGuru} element={<RuteTerlindungi peranDiizinkan={['admin']}><KelolaAkunScreen /></RuteTerlindungi>} />
        <Route path={RUTE.konfigurasiAi} element={<RuteTerlindungi peranDiizinkan={['admin']}><KonfigurasiAiScreen /></RuteTerlindungi>} />
        <Route path={RUTE.backup} element={<BackupScreen />} />
        <Route path={RUTE.offline} element={<OfflineScreen />} />
        <Route path={RUTE.tentang} element={<TentangAplikasiScreen />} />
        <Route path={RUTE.basisData} element={<BasisDataScreen />} />
        <Route path={RUTE.kelolaTp} element={<KelolaTpSekolahScreen />} />
        <Route path={RUTE.muatCp} element={<MuatCpScreen />} />
        <Route path={RUTE.referensi} element={<ReferensiScreen />} />
        <Route path={RUTE.perpustakaan} element={<ReferensiScreen />} />
        <Route path={RUTE.pemetaanReferensi} element={<PemetaanReferensiScreen />} />
        <Route path={RUTE.lainnya} element={<MenuLainnyaScreen />} />
        <Route path={RUTE.game} element={<KatalogGameScreen />} />
        <Route path={RUTE.ipas5} element={<IpasKelas5Screen />} />
        <Route path="/pembelajaran/:jenis" element={<FiturPembelajaranScreen />} />
        <Route path="/fitur/pembuat-lkpd" element={<AiStudioScreen />} />
        <Route path={RUTE.generateLkpd} element={<RuteTerlindungi peranDiizinkan={['guru']}><AiStudioScreen /></RuteTerlindungi>} />
        <Route path={RUTE.bankSoal} element={<RuteTerlindungi peranDiizinkan={['guru']}><AiStudioScreen /></RuteTerlindungi>} />
        <Route path="/fitur/pembuat-soal" element={<AiStudioScreen />} />
        <Route path="/fitur/pembuat-materi" element={<AiStudioScreen />} />
        <Route path="/fitur/game-generator" element={<AiStudioScreen />} />
        <Route path="/fitur/studio-ai" element={<AiStudioScreen />} />
        <Route path="/fitur/:fitur" element={<FiturMenyusulScreen />} />
      </Route>

      <Route
        path={`${RUTE.game}/:gameId/main`}
        element={
          <RuteTerlindungi>
            <KurikulumProvider><GameRunnerScreen /></KurikulumProvider>
          </RuteTerlindungi>
        }
      />

      <Route
        path={RUTE.modeSiswa}
        element={
          <RuteTerlindungi>
            <KurikulumProvider><ModeSiswaScreen /></KurikulumProvider>
          </RuteTerlindungi>
        }
      />
      <Route
        path={`${RUTE.ipas5}/vlab/:vlabId`}
        element={
          <RuteTerlindungi>
            <KurikulumProvider><VirtualLabScreen /></KurikulumProvider>
          </RuteTerlindungi>
        }
      />
      <Route
        path={RUTE.modeKelas}
        element={
          <RuteTerlindungi>
            <KurikulumProvider><ModeKelasScreen /></KurikulumProvider>
          </RuteTerlindungi>
        }
      />

      <Route path="*" element={<LayarTidakDitemukan />} />
    </Routes>
  );
}
