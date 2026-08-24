import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { cariVlabIpas5 } from '../../lib/ipasKelas5';
import { keAppError } from '../../lib/errors/AppError';
import { daftarKelompokKelas, daftarSiswaKelas, pastikanKelasKerja } from '../../lib/storage/kelasRepo';
import { simpanHasilVlab } from '../../lib/storage/ipasRepo';
import type { Kelompok, Siswa } from '../../lib/types';
import { RUTE } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import { VirtualLabEngine, type VariabelVlab } from './VirtualLabEngine';
import './ipas.css';

type KelompokAnggota = Kelompok & { anggota: Siswa[] };

export function VirtualLabScreen() {
  const { vlabId = '' } = useParams(); const [parameter] = useSearchParams(); const data = cariVlabIpas5(vlabId);
  const { akun } = useAuth(); const { konteks } = useKurikulum();
  const [kelasId, setKelasId] = useState(''); const [siswa, setSiswa] = useState<Siswa[]>([]); const [kelompok, setKelompok] = useState<KelompokAnggota[]>([]);
  const [mode, setMode] = useState<'individu' | 'kelompok'>(parameter.get('kelompok') ? 'kelompok' : 'individu');
  const [sasaran, setSasaran] = useState(parameter.get('siswa') ?? parameter.get('kelompok')?.split(',')[0] ?? '');
  const [variabel, setVariabel] = useState<VariabelVlab>({}); const [observasi, setObservasi] = useState(''); const [kesimpulan, setKesimpulan] = useState(''); const [pesan, setPesan] = useState('');
  useEffect(() => { if (!akun) return; void pastikanKelasKerja(5, akun.id).then(async (kelas) => { setKelasId(kelas.id); const [anak, grup] = await Promise.all([daftarSiswaKelas(kelas.id), daftarKelompokKelas(kelas.id)]); setSiswa(anak); setKelompok(grup); }).catch((galat: unknown) => setPesan(keAppError(galat).message)); }, [akun]);
  if (!data) return <main className="vlab-layar vlab-layar--status"><h1>VLAB tidak ditemukan</h1><Link to={RUTE.ipas5}>Kembali ke katalog IPAS</Link></main>;
  const sesuai = konteks.tingkat_kelas === 5 && konteks.mapel_kode === 'IPAS' && data.topik.tpIds.includes(konteks.tp_id ?? '');
  async function selesai() { if (!data || !akun || !konteks.tp_id || !konteks.cp_id) return; try { await simpanHasilVlab({ tpId: konteks.tp_id, cpId: konteks.cp_id, kelasId, siswaId: mode === 'individu' ? sasaran : undefined, kelompokId: mode === 'kelompok' ? sasaran : undefined, sesiId: parameter.get('sesi') ?? `SESI-VLAB-${Date.now()}`, dinilaiOleh: akun.id, topik: data.topik, vlab: data.vlab, variabel, observasi, kesimpulan }); setPesan('✓ VLAB selesai. Variabel, observasi, dan kesimpulan tersimpan lokal untuk setiap peserta.'); } catch (galat) { setPesan(keAppError(galat).message); } }
  if (!sesuai) return <main className="vlab-layar vlab-layar--status"><h1>TP aktif tidak sesuai dengan VLAB ini</h1><p>Kembali ke katalog dan pilih topik yang berlabel sesuai TP aktif.</p><Link to={RUTE.ipas5}>Kembali ke katalog IPAS</Link></main>;
  return <main className="vlab-layar" data-testid="layar-vlab"><header className="vlab-layar__kop"><Link to={RUTE.ipas5}>← Kembali</Link><div><p>{data.topik.kode} · {konteks.tp_id}</p><h1>{data.vlab.nama}</h1><span>{data.topik.nama}</span></div><button type="button" onClick={() => void document.documentElement.requestFullscreen?.()}>⛶ Fullscreen</button></header><section className="vlab-info"><article><b>🎯 Tujuan Percobaan</b><p>{data.vlab.tujuan}</p></article><article><b>🧭 Petunjuk</b><p>{data.vlab.petunjuk}</p></article></section><VirtualLabEngine topik={data.topik} vlab={data.vlab} onChange={setVariabel}/><section className="vlab-catatan"><header><div><h2>Catatan hasil & kesimpulan</h2><p>VLAB disimpan sebagai aktivitas selesai tanpa memaksa nilai angka.</p></div><div className="vlab-target"><select aria-label="Mode peserta VLAB" value={mode} onChange={(e) => { setMode(e.target.value as typeof mode); setSasaran(''); }}><option value="individu">Individu</option><option value="kelompok">Kelompok</option></select><select aria-label="Peserta VLAB" value={sasaran} onChange={(e) => setSasaran(e.target.value)}><option value="">Pilih peserta</option>{(mode === 'individu' ? siswa : kelompok).map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></div></header><label>Observasi<textarea value={observasi} onChange={(e) => setObservasi(e.target.value)} placeholder="Apa yang berubah saat variabel diubah?"/></label><label>Kesimpulan<textarea value={kesimpulan} onChange={(e) => setKesimpulan(e.target.value)} placeholder="Tuliskan kesimpulan berdasarkan hasil percobaan."/></label><button className="vlab-selesai" type="button" disabled={!sasaran || !observasi.trim() || !kesimpulan.trim()} onClick={() => void selesai()}>✓ Selesai & Simpan Hasil</button>{pesan ? <p role="status" className="vlab-pesan">{pesan}</p> : null}</section></main>;
}
