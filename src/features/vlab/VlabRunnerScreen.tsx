import { Link, useParams } from 'react-router-dom';
import { profilVlab } from '../../lib/vlab/katalogVlab';
import { RUTE } from '../../routes/paths';
import { LightRayLabScreen } from './labs/LightRayLabScreen';
import { MirrorLabScreen } from './labs/MirrorLabScreen';
import { MaterialLabScreen } from './labs/MaterialLabScreen';
import { ShadowLabScreen } from './labs/ShadowLabScreen';
import { RefractionLabScreen } from './labs/RefractionLabScreen';
import { ColorLightLabScreen } from './labs/ColorLightLabScreen';
import { SoundLabScreen } from './labs/SoundLabScreen';
import { FoodChainLabScreen } from './labs/FoodChainLabScreen';
import { MagnetLabScreen } from './labs/MagnetLabScreen';
import { CircuitLabScreen } from './labs/CircuitLabScreen';
import { ErosionLabScreen } from './labs/ErosionLabScreen';
import { BreathingLabScreen } from './labs/BreathingLabScreen';
import { EnvironmentLabScreen } from './labs/EnvironmentLabScreen';
import './vlab.css';

/**
 * Pemilih layar VLAB.
 *
 * Setiap kode lab menunjuk komponen tersendiri; tidak ada satu komponen
 * generik yang dipakai ulang dengan judul berbeda.
 */
const LAYAR_VLAB = {
  'light-ray': LightRayLabScreen,
  mirror: MirrorLabScreen,
  material: MaterialLabScreen,
  shadow: ShadowLabScreen,
  refraction: RefractionLabScreen,
  'color-light': ColorLightLabScreen,
  sound: SoundLabScreen,
  'food-chain': FoodChainLabScreen,
  magnet: MagnetLabScreen,
  circuit: CircuitLabScreen,
  erosion: ErosionLabScreen,
  breathing: BreathingLabScreen,
  environment: EnvironmentLabScreen,
} as const;

export function VlabRunnerScreen() {
  const { vlabKode = '' } = useParams();
  const profil = profilVlab(vlabKode);
  const Layar = profil ? LAYAR_VLAB[profil.kode] : undefined;

  if (!profil || !Layar) {
    return (
      <main className="halaman-vlab">
        <h1>Laboratorium virtual tidak ditemukan</h1>
        <p>Kode lab “{vlabKode}” belum terdaftar pada katalog VLAB.</p>
        <Link className="vlab-tombol vlab-tombol--utama" to={RUTE.vlab}>
          Kembali ke daftar VLAB
        </Link>
      </main>
    );
  }

  return <Layar profil={profil} />;
}
