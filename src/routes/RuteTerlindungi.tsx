import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/useAuth';
import { sudahMasuk } from '../lib/auth/keadaanSesi';
import type { Peran } from '../lib/types';
import { LayarMemuat } from '../components/LayarMemuat';
import { LayarGalat } from '../components/LayarGalat';
import { RUTE } from './paths';

interface Props {
  children: ReactNode;
  /** Bila diisi, hanya peran ini yang boleh membuka rute. */
  peranDiizinkan?: readonly Peran[];
}

/**
 * Penjagaan sesi (IMPLEMENTATION HANDOFF §4).
 * Setiap rute selain Opening, Setup Admin, Login, dan Lupa Password menolak
 * akses tanpa sesi sah — ditolak di lapisan rute, bukan disembunyikan dari
 * menu. Peran menentukan hak, bukan keberadaan fitur.
 */
export function RuteTerlindungi({ children, peranDiizinkan }: Props) {
  const { memuat, keadaan, peran, galat, segarkan } = useAuth();
  const lokasi = useLocation();

  if (memuat) return <LayarMemuat />;

  if (galat) {
    return (
      <LayarGalat
        kode={galat.kode}
        judul="Penyimpanan lokal tidak dapat dibaca"
        pesan={galat.message}
        aksi={
          <button type="button" className="layar-status__tombol" onClick={() => void segarkan()}>
            Coba lagi
          </button>
        }
      />
    );
  }

  if (keadaan === 'belum_setup') {
    return <Navigate to={RUTE.setupAdmin} replace />;
  }

  if (!sudahMasuk(keadaan)) {
    return <Navigate to={RUTE.masuk} replace state={{ dari: lokasi.pathname }} />;
  }

  if (peranDiizinkan && peran && !peranDiizinkan.includes(peran)) {
    return (
      <LayarGalat
        kode="HAK_AKSES"
        judul={peranDiizinkan.includes('admin') ? 'Halaman ini hanya untuk Admin perangkat' : 'Halaman ini hanya untuk Guru'}
        pesan={peranDiizinkan.includes('admin') ? 'Halaman ini mengatur perangkat, jadi hanya Admin yang dapat membukanya.' : 'Ruang kerja pembelajaran terpisah dari dashboard Admin.'}
        aksi={
          <a className="layar-status__tombol" href={RUTE.dasbor}>
            Kembali ke Dasbor
          </a>
        }
      />
    );
  }

  return <>{children}</>;
}
