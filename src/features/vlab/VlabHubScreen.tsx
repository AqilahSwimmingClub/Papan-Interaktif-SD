import { Link } from 'react-router-dom';
import { useKurikulum } from '../../state/useKurikulum';
import { RUTE } from '../../routes/paths';
import './vlab-hub.css';

export function VlabHubScreen() {
  const { konteks } = useKurikulum();
  const ipasKelasLima = konteks.tingkat_kelas === 5 && konteks.mapel_kode === 'IPAS';
  return <main className="vlab-hub" data-testid="vlab-hub"><header><div><p>Game Edukasi & VLAB</p><h1>VLAB/Simulasi</h1><span>Engine simulasi membaca Buku → Bab → Topik → TP tanpa menyalin isi buku.</span></div><button type="button" onClick={() => void document.documentElement.requestFullscreen?.()}>⛶ Layar penuh</button></header><nav aria-label="Konteks VLAB"><span>Kelas {konteks.tingkat_kelas ?? '—'}</span><span>{konteks.mapel_kode ?? 'Mapel belum dipilih'}</span><span>{konteks.tp_id ?? 'TP belum dipilih'}</span><span>{konteks.referensi_bab_id ?? 'Bab belum dipilih'}</span></nav>
    {ipasKelasLima ? <section className="vlab-hub__siap"><div><span>⚗</span><h2>Laboratorium IPAS Kelas V</h2><p>Simulasi lokal yang sudah tersedia tetap dipertahankan dan memakai engine interaksi nyata.</p><Link to={RUTE.ipas5}>Buka laboratorium</Link></div></section> : <section className="vlab-hub__kosong"><span>🔬</span><h2>{konteks.tp_id ? 'Topik referensi belum tersedia untuk TP ini' : 'Pilih kelas, mapel, dan TP lebih dulu'}</h2><p>Struktur VLAB siap menerima skenario final dari referensi buku. Aplikasi tidak membuat eksperimen atau fakta baru tanpa sumber.</p><Link to={RUTE.kelas}>Pilih konteks pembelajaran</Link></section>}
    <section className="vlab-hub__kontrak"><h2>Kontrak engine VLAB</h2><div><article><b>1</b><strong>Sumber</strong><span>ReferenceBook, Bab, Topik, dan TP aktif</span></article><article><b>2</b><strong>Interaksi</strong><span>Variabel, objek, observasi, reset, dan multi-touch</span></article><article><b>3</b><strong>Hasil</strong><span>Catatan observasi dan skor disimpan lokal per Guru</span></article></div></section></main>;
}
