import { useNavigate } from 'react-router-dom';
import { LayarGalat } from '../components/LayarGalat';
import { RUTE } from './paths';

export function LayarTidakDitemukan() {
  const navigate = useNavigate();
  return (
    <LayarGalat
      kode="404"
      judul="Halaman tidak ditemukan"
      pesan="Alamat yang dibuka tidak ada di aplikasi ini. Kembali ke halaman awal untuk melanjutkan."
      aksi={
        <button
          type="button"
          className="layar-status__tombol"
          onClick={() => navigate(RUTE.akar, { replace: true })}
        >
          Kembali ke halaman awal
        </button>
      }
    />
  );
}
