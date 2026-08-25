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
import { StrukturMapelScreen } from '../features/kurikulum/StrukturMapelScreen';
import { FiturPembelajaranScreen } from '../features/pembelajaran/FiturPembelajaranScreen';
import { Kelas5IpasHubScreen } from '../features/pembelajaran/Kelas5IpasHubScreen';
import { Kelas5Bab1ContentScreen } from '../features/pembelajaran/Kelas5Bab1ContentScreen';
import { Kelas5Bab2ContentScreen } from '../features/pembelajaran/Kelas5Bab2ContentScreen';
import { Kelas5Bab3ContentScreen } from '../features/pembelajaran/Kelas5Bab3ContentScreen';
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
import { StrukturKurikulumScreen } from '../features/kurikulum/StrukturKurikulumScreen';
import { BukuReferensiScreen } from '../features/kurikulum/BukuReferensiScreen';
import { MenuLainnyaScreen } from '../features/guru/MenuLainnyaScreen';
import { KatalogGameScreen } from '../features/game/KatalogGameScreen';
import { GameKelas5Bab1Screen } from '../features/game/GameKelas5Bab1Screen';
import { GameKelas5Bab3Screen } from '../features/game/GameKelas5Bab3Screen';
import { GameKelas5RunnerScreen } from '../features/game/GameKelas5RunnerScreen';
import { KatalogVlabScreen } from '../features/vlab/KatalogVlabScreen';
import { VlabRunnerScreen } from '../features/vlab/VlabRunnerScreen';
import { VlabKelas5Bab2Screen } from '../features/vlab/VlabKelas5Bab2Screen';
import { VlabKelas5Bab3Screen } from '../features/vlab/VlabKelas5Bab3Screen';
import { KelolaAkunScreen } from '../features/auth/KelolaAkunScreen';
import { TentangAplikasiScreen } from '../features/pelengkap/TentangAplikasiScreen';
import { AiStudioScreen } from '../features/ai/AiStudioScreen';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={RUTE.akar} element={<GerbangAwal />} />
      <Route path={RUTE.pembuka} element={<OpeningScreen />} />
      <Route path={RUTE.setupAdmin} element={<RuteLapisanMasuk hanyaBelumSetup><SetupAdminScreen /></RuteLapisanMasuk>} />
      <Route path={RUTE.masuk} element={<RuteLapisanMasuk butuhAdmin><LoginScreen /></RuteLapisanMasuk>} />
      <Route path={RUTE.lupaPassword} element={<RuteLapisanMasuk butuhAdmin><LupaPasswordScreen /></RuteLapisanMasuk>} />

      <Route element={<RuteTerlindungi><KurikulumProvider><KerangkaGuru /></KurikulumProvider></RuteTerlindungi>}>
        <Route path={RUTE.dasbor} element={<BerandaTerlindungi />} />
        <Route path={RUTE.kelas} element={<PilihKelasScreen />} />
        <Route path={RUTE.kelompok} element={<KelompokSiswaScreen />} />
        <Route path={RUTE.rekap} element={<RekapCpTpScreen />} />
        <Route path={`${RUTE.kelas}/:tingkat/mapel`} element={<PilihMapelScreen />} />
        <Route path={`${RUTE.kelas}/:tingkat/mapel/:mapelKode`} element={<StrukturMapelScreen />} />
        <Route path={RUTE.materi} element={<MateriScreen />} />
        <Route path={RUTE.papan} element={<PapanInteraktifScreen />} />
        <Route path={RUTE.media} element={<MediaScreen />} />
        <Route path={RUTE.pencarian} element={<PencarianScreen />} />
        <Route path={RUTE.profil} element={<ProfilScreen />} />
        <Route path={RUTE.kelolaAkun} element={<RuteTerlindungi peranDiizinkan={['admin']}><KelolaAkunScreen /></RuteTerlindungi>} />
        <Route path={RUTE.backup} element={<BackupScreen />} />
        <Route path={RUTE.offline} element={<OfflineScreen />} />
        <Route path={RUTE.tentang} element={<TentangAplikasiScreen />} />
        <Route path={RUTE.strukturKurikulum} element={<StrukturKurikulumScreen />} />
        <Route path={RUTE.bukuReferensi} element={<BukuReferensiScreen />} />
        <Route path={RUTE.lainnya} element={<MenuLainnyaScreen />} />
        <Route path={RUTE.game} element={<KatalogGameScreen />} />
        <Route path={`${RUTE.game}/kelas5-bab1/:gameKode`} element={<GameKelas5Bab1Screen />} />
        <Route path={`${RUTE.game}/kelas5-bab3/:gameKode`} element={<GameKelas5Bab3Screen />} />
        <Route path={`${RUTE.game}/:gameKode`} element={<GameKelas5RunnerScreen />} />
        <Route path={RUTE.vlab} element={<KatalogVlabScreen />} />
        <Route path={`${RUTE.vlab}/kelas5-bab2/:labKode`} element={<VlabKelas5Bab2Screen />} />
        <Route path={`${RUTE.vlab}/kelas5-bab3/:labKode`} element={<VlabKelas5Bab3Screen />} />
        <Route path="/pembelajaran/kuis" element={<Kelas5IpasHubScreen />} />
        <Route path="/pembelajaran/lkpd" element={<Kelas5IpasHubScreen />} />
        <Route path="/pembelajaran/bank-soal" element={<Kelas5IpasHubScreen />} />
        <Route path="/pembelajaran/kuis/kelas5-ipas-bab1" element={<Kelas5Bab1ContentScreen />} />
        <Route path="/pembelajaran/lkpd/kelas5-ipas-bab1" element={<Kelas5Bab1ContentScreen />} />
        <Route path="/pembelajaran/bank-soal/kelas5-ipas-bab1" element={<Kelas5Bab1ContentScreen />} />
        <Route path="/pembelajaran/kuis/kelas5-ipas-bab2" element={<Kelas5Bab2ContentScreen />} />
        <Route path="/pembelajaran/lkpd/kelas5-ipas-bab2" element={<Kelas5Bab2ContentScreen />} />
        <Route path="/pembelajaran/bank-soal/kelas5-ipas-bab2" element={<Kelas5Bab2ContentScreen />} />
        <Route path="/pembelajaran/kuis/kelas5-ipas-bab3" element={<Kelas5Bab3ContentScreen />} />
        <Route path="/pembelajaran/lkpd/kelas5-ipas-bab3" element={<Kelas5Bab3ContentScreen />} />
        <Route path="/pembelajaran/bank-soal/kelas5-ipas-bab3" element={<Kelas5Bab3ContentScreen />} />
        <Route path="/pembelajaran/:jenis" element={<FiturPembelajaranScreen />} />
        <Route path="/fitur/pembuat-lkpd" element={<AiStudioScreen />} />
        <Route path="/fitur/pembuat-soal" element={<AiStudioScreen />} />
        <Route path="/fitur/pembuat-materi" element={<AiStudioScreen />} />
        <Route path="/fitur/studio-ai" element={<AiStudioScreen />} />
        <Route path="/fitur/:fitur" element={<FiturMenyusulScreen />} />
      </Route>

      <Route path={`${RUTE.vlab}/:vlabKode`} element={<RuteTerlindungi><VlabRunnerScreen /></RuteTerlindungi>} />
      <Route path={RUTE.modeSiswa} element={<RuteTerlindungi><KurikulumProvider><ModeSiswaScreen /></KurikulumProvider></RuteTerlindungi>} />
      <Route path={RUTE.modeKelas} element={<RuteTerlindungi><KurikulumProvider><ModeKelasScreen /></KurikulumProvider></RuteTerlindungi>} />
      <Route path="*" element={<LayarTidakDitemukan />} />
    </Routes>
  );
}
