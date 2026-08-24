import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { TopikIpas, VlabIpas } from '../../lib/ipasKelas5';

type Nilai = string | number | boolean;
export type VariabelVlab = Record<string, Nilai>;
type Ubah = (kunci: string, nilai: Nilai) => void;
interface Properti { topik: TopikIpas; vlab: VlabIpas; onChange?: (variabel: VariabelVlab) => void }
interface SceneProps { nilai: VariabelVlab; ubah: Ubah }

function nilaiAwal(vlab: VlabIpas): VariabelVlab {
  switch (vlab.jenis) {
    case 'optik': return { sudut_cermin: 25, jarak: 45, posisi_sumber: 20, material: 'transparan', warna: 'biru' };
    case 'bunyi': return { frekuensi: 440, amplitudo: 45, medium: 'udara' };
    case 'anatomi': return { bagian_aktif: 'sumber', terang: 65, tahap: 0 };
    case 'rantai_makanan': return { tahap: 0, energi: 100, rantai_lengkap: false };
    case 'ekosistem': return { produsen: 60, herbivor: 35, predator: 18, keseimbangan: 73 };
    case 'magnet': return { kutub_a: 'U', kutub_b: 'U', jarak: 35, gaya: 'tolak' };
    case 'rangkaian': return { baterai: false, kabel: false, lampu: false, saklar: false, lampu_menyala: false };
    case 'solusi': return { masalah: 'air', solusi: 'pompa hemat energi', manfaat: 70, dampak: 25 };
    case 'peta': return { zoom: 1, hotspot: 'belum dipilih', lapisan: 'bentang alam' };
    case 'erosi': return { air: 45, kemiringan: 35, vegetasi: 50, intensitas: 35, perubahan: 0 };
    case 'pernapasan': return { fase: 'istirahat', volume_paru: 50, oksigen: 70 };
    case 'pencernaan': return { tahap: 0, bagian: 'mulut', gizi: 50 };
    case 'pertumbuhan': return { tidur: 8, aktivitas: 60, gizi: 70, indikator: 72 };
    case 'ekonomi': return { tahap: 0, peran: 'belum dimulai', transaksi_selesai: false, potensi: 40 };
    case 'kota_hijau': return { sampah: 45, kualitas_air: 60, ruang_hijau: 45, kualitas_lingkungan: 53 };
    default: return {};
  }
}

const batas = (nilai: number) => Math.max(0, Math.min(100, Math.round(nilai)));

export function VirtualLabEngine({ topik, vlab, onChange }: Properti) {
  const awal = useMemo(() => nilaiAwal(vlab), [vlab]);
  const [variabel, setVariabel] = useState<VariabelVlab>(awal);
  const [berjalan, setBerjalan] = useState(false);
  const [jeda, setJeda] = useState(false);
  const [waktu, setWaktu] = useState(0);
  const [alatAktif, setAlatAktif] = useState<string[]>([]);
  const [observasi, setObservasi] = useState('Rakit dua alat digital, ubah variabel, lalu jalankan percobaan.');
  const alat = useMemo(() => {
    if (vlab.jenis === 'rangkaian') return ['🔋 Baterai', '〰️ Kabel', '💡 Indikator'];
    if (vlab.jenis === 'optik') return ['🔦 Sumber', '🪞 Pemantul', '📟 Sensor'];
    if (vlab.jenis === 'magnet') return ['🧲 Magnet A', '🧲 Magnet B', '📏 Pengukur'];
    return ['🧪 Wadah', '🧰 Bahan', '📟 Sensor'];
  }, [vlab.jenis]);
  useEffect(() => { setVariabel(awal); setBerjalan(false); setJeda(false); setWaktu(0); setAlatAktif([]); setObservasi('Rakit dua alat digital, ubah variabel, lalu jalankan percobaan.'); }, [awal]);
  useEffect(() => { onChange?.(variabel); }, [onChange, variabel]);
  useEffect(() => {
    if (!berjalan || jeda) return;
    const id = window.setInterval(() => setWaktu((lama) => Math.min(100, lama + 2)), 120);
    return () => window.clearInterval(id);
  }, [berjalan, jeda]);
  useEffect(() => {
    if (!berjalan || jeda) return;
    setVariabel((lama) => ({ ...lama, simulasi_waktu: waktu }));
    setObservasi(waktu < 100 ? `Proses berlangsung: ${waktu}% · keluaran visual mengikuti variabel aktif.` : 'Percobaan selesai. Bandingkan hasil visual dengan kondisi awal.');
    if (waktu >= 100) setBerjalan(false);
  }, [berjalan, jeda, waktu]);
  const ubah: Ubah = (kunci, nilai) => setVariabel((lama) => ({ ...lama, [kunci]: nilai }));
  const reset = () => { setVariabel(awal); setBerjalan(false); setJeda(false); setWaktu(0); setAlatAktif([]); setObservasi('Rakit dua alat digital, ubah variabel, lalu jalankan percobaan.'); };
  const pasangAlat = (nama: string) => setAlatAktif((lama) => nama && !lama.includes(nama) ? [...lama, nama] : lama);

  return <section className="vlab-engine" data-testid="virtual-lab-engine" data-jenis={vlab.jenis}>
    <header className="vlab-engine__status"><div><span>🔬 VirtualLabEngine V2</span><strong>{vlab.nama}</strong><small>{topik.nama}</small></div><div className="vlab-engine__kontrol">
      <button type="button" disabled={alatAktif.length < 2} className={berjalan && !jeda ? 'aktif' : ''} onClick={() => { setBerjalan(true); setJeda(false); setObservasi('Percobaan dimulai. Amati perubahan pada scene.'); }}>▶ Start</button>
      <button type="button" disabled={!berjalan} onClick={() => setJeda((nilai) => !nilai)}>{jeda ? '▶ Lanjut' : '⏸ Pause'}</button>
      <button type="button" onClick={reset}>↺ Reset</button>
    </div></header>
    <div className="vlab-engine__progres" aria-label="Waktu simulasi"><span style={{ width: `${waktu}%` }}/></div>
    <div className="vlab-engine__prosedur"><div><b>1</b><span>Rakit alat</span></div><div className={alatAktif.length >= 2 ? 'aktif' : ''}><b>2</b><span>Atur variabel</span></div><div className={berjalan || waktu > 0 ? 'aktif' : ''}><b>3</b><span>Jalankan & amati</span></div></div>
    <div className="vlab-engine__alat"><div>{alat.map((item) => <button draggable type="button" className={alatAktif.includes(item) ? 'aktif' : ''} key={item} onClick={() => pasangAlat(item)} onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}>{item}</button>)}</div><button type="button" aria-label="Meja perakitan" onDragOver={(e) => e.preventDefault()} onDrop={(e) => pasangAlat(e.dataTransfer.getData('text/plain'))}><span>Meja perakitan</span><b>{alatAktif.length}/3 alat terpasang</b></button></div>
    <div className="vlab-engine__arena" data-running={String(berjalan && !jeda)}>
      {vlab.jenis === 'optik' ? <Optik vlab={vlab} nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'bunyi' ? <Bunyi nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'anatomi' ? <Anatomi vlab={vlab} nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'rantai_makanan' ? <RantaiMakanan nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'ekosistem' ? <Ekosistem nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'magnet' ? <Magnet nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'rangkaian' ? <Rangkaian nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'solusi' ? <Solusi nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'peta' ? <Peta nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'erosi' ? <Erosi vlab={vlab} nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'pernapasan' ? <Pernapasan nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'pencernaan' ? <Pencernaan vlab={vlab} nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'pertumbuhan' ? <Pertumbuhan nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'ekonomi' ? <Ekonomi vlab={vlab} nilai={variabel} ubah={ubah}/> : null}
      {vlab.jenis === 'kota_hijau' ? <KotaHijau nilai={variabel} ubah={ubah}/> : null}
    </div>
    <footer className="vlab-engine__observasi"><span>👁 Observasi real-time</span><strong>{observasi}</strong><small>Tantangan: ubah satu variabel, jalankan ulang, lalu bandingkan hasilnya.</small></footer>
  </section>;
}

function Optik({ vlab, nilai, ubah }: SceneProps & { vlab: VlabIpas }) {
  const sudut = Number(nilai.sudut_cermin); const jarak = Number(nilai.jarak);
  const pantulY = 82 - Math.sin(sudut * Math.PI / 180) * 58; const bayangan = batas(120 - jarak);
  return <div className="vlab-scene"><div className="vlab-visual vlab-optik" data-testid="visual-cahaya" data-ray-angle={sudut} data-shadow-size={bayangan}>
    <button type="button" aria-label="Geser sumber cahaya" className="vlab-senter" draggable style={{ left: `${Number(nilai.posisi_sumber)}%` }} onClick={() => ubah('posisi_sumber', (Number(nilai.posisi_sumber) + 15) % 90)} onDragEnd={(e) => ubah('posisi_sumber', Math.max(5, Math.min(85, Math.round((e.clientX / Math.max(1, window.innerWidth)) * 100))))}>🔦</button>
    <svg viewBox="0 0 500 190" role="img" aria-label="Jalur cahaya real-time"><line x1="70" y1="145" x2="255" y2="95"/><line x1="255" y1="95" x2="455" y2={pantulY}/><circle cx="455" cy={pantulY} r="10"/></svg>
    {vlab.nama.includes('Shadow') ? <span className="vlab-bayangan" style={{ width: `${bayangan}px`, height: `${bayangan * .7}px` }}>bayangan</span> : null}<span className="vlab-cermin" style={{ transform: `rotate(${sudut}deg)` }}>🪞</span>
  </div><div className="vlab-panel"><label>Sudut cermin <b>{sudut}°</b><input aria-label="Sudut cermin" type="range" min="0" max="80" value={sudut} onChange={(e) => ubah('sudut_cermin', Number(e.target.value))}/></label><label>Jarak benda <b>{jarak}</b><input aria-label="Jarak benda" type="range" min="10" max="90" value={jarak} onChange={(e) => ubah('jarak', Number(e.target.value))}/></label><label>Material<select aria-label="Material cahaya" value={String(nilai.material)} onChange={(e) => ubah('material', e.target.value)}><option>transparan</option><option>translusen</option><option>opak</option></select></label><p>Cahaya melalui: <b>{nilai.material === 'transparan' ? 'hampir seluruhnya' : nilai.material === 'translusen' ? 'sebagian' : 'terhalang'}</b></p></div></div>;
}

function Bunyi({ nilai, ubah }: SceneProps) {
  const f = Number(nilai.frekuensi); const a = Number(nilai.amplitudo); const titik = Array.from({ length: 30 }, (_, i) => `${i * 17},${80 + Math.sin(i * f / 900) * a * .75}`).join(' '); const pitch = f < 350 ? 'rendah' : f < 650 ? 'sedang' : 'tinggi';
  return <div className="vlab-scene"><div className="vlab-visual vlab-bunyi" data-testid="visual-bunyi" data-frequency={f} data-pitch={pitch}><span>🔊</span><svg viewBox="0 0 500 160"><polyline points={titik}/></svg><b>Nada {pitch}</b></div><div className="vlab-panel"><label>Frekuensi <b>{f} Hz</b><input aria-label="Frekuensi bunyi" type="range" min="150" max="900" value={f} onChange={(e) => ubah('frekuensi', Number(e.target.value))}/></label><label>Amplitudo <b>{a}</b><input aria-label="Amplitudo bunyi" type="range" min="10" max="85" value={a} onChange={(e) => ubah('amplitudo', Number(e.target.value))}/></label><label>Medium<select aria-label="Medium bunyi" value={String(nilai.medium)} onChange={(e) => ubah('medium', e.target.value)}><option>udara</option><option>air</option><option>padat</option></select></label></div></div>;
}

function Anatomi({ vlab, nilai, ubah }: SceneProps & { vlab: VlabIpas }) {
  const telinga = vlab.nama.includes('Ear'); const bagian = telinga ? ['sumber bunyi', 'gelombang', 'gendang telinga', 'saraf', 'otak'] : ['objek', 'cahaya', 'pupil', 'retina', 'otak']; const tahap = Number(nilai.tahap);
  return <div className="vlab-scene"><div className="vlab-visual vlab-anatomi" data-testid="jalur-anatomi" data-stage={tahap}><span>{telinga ? '👂' : '👁️'}</span><div>{bagian.map((item, i) => <button type="button" key={item} className={i <= tahap ? 'aktif' : ''} onClick={() => { ubah('tahap', i); ubah('bagian_aktif', item); }}><b>{i + 1}</b><small>{item}</small></button>)}</div></div><div className="vlab-panel"><label>{telinga ? 'Kekuatan bunyi' : 'Terang/gelap'}<input aria-label={telinga ? 'Kekuatan bunyi' : 'Terang gelap'} type="range" min="5" max="100" value={Number(nilai.terang)} onChange={(e) => ubah('terang', Number(e.target.value))}/></label><p>Bagian aktif: <b>{String(nilai.bagian_aktif)}</b></p></div></div>;
}

function RantaiMakanan({ nilai, ubah }: SceneProps) {
  const urutan = ['☀️ Matahari', '🌱 Rumput', '🦗 Belalang', '🐸 Katak', '🍄 Pengurai']; const tahap = Number(nilai.tahap);
  return <div className="vlab-scene"><div className="vlab-visual vlab-rantai" data-testid="rantai-makanan" data-complete={String(tahap === urutan.length)}>{urutan.map((item, i) => <button draggable type="button" key={item} className={i < tahap ? 'aktif' : ''} onClick={() => { if (i === tahap) { ubah('tahap', tahap + 1); ubah('rantai_lengkap', tahap + 1 === urutan.length); ubah('energi', Math.max(10, 100 - i * 20)); } }}><span>{item}</span>{i < urutan.length - 1 ? <i>→</i> : null}</button>)}</div><div className="vlab-panel"><p>Susun dari sumber energi. Energi tersisa: <b>{String(nilai.energi)}%</b></p></div></div>;
}

function Ekosistem({ nilai, ubah }: SceneProps) {
  const hitung = (p: number, h: number, r: number) => batas(100 - Math.abs(p * .55 - h) - Math.abs(h * .45 - r) * 1.4);
  const setPop = (k: 'produsen' | 'herbivor' | 'predator', angka: number) => { const baru = batas(angka); const p = k === 'produsen' ? baru : Number(nilai.produsen); const h = k === 'herbivor' ? baru : Number(nilai.herbivor); const r = k === 'predator' ? baru : Number(nilai.predator); ubah(k, baru); ubah('keseimbangan', hitung(p, h, r)); };
  return <div className="vlab-scene"><div className="vlab-visual vlab-ekosistem" data-testid="indikator-ekosistem" data-balance={nilai.keseimbangan}><div>🌿<b>{nilai.produsen}</b></div><div>🐇<b>{nilai.herbivor}</b></div><div>🦊<b>{nilai.predator}</b></div><meter min="0" max="100" value={Number(nilai.keseimbangan)}/><strong>Keseimbangan {nilai.keseimbangan}%</strong></div><div className="vlab-panel">{(['produsen', 'herbivor', 'predator'] as const).map((k) => <div className="vlab-stepper" key={k}><span>{k}</span><button aria-label={`Kurangi ${k}`} type="button" onClick={() => setPop(k, Number(nilai[k]) - 10)}>−</button><b>{nilai[k]}</b><button aria-label={`Tambah ${k}`} type="button" onClick={() => setPop(k, Number(nilai[k]) + 10)}>+</button></div>)}</div></div>;
}

function Magnet({ nilai, ubah }: SceneProps) {
  const gaya = nilai.kutub_a === nilai.kutub_b ? 'tolak' : 'tarik'; const jarak = Number(nilai.jarak);
  return <div className="vlab-scene"><div className="vlab-visual vlab-magnet" data-testid="gaya-magnet" data-force={gaya}><span style={{ transform: `translateX(${-jarak / 4}px)` }}>🧲 {nilai.kutub_a}</span><i>{gaya === 'tolak' ? '↔' : '→←'}</i><span style={{ transform: `translateX(${jarak / 4}px) rotate(180deg)` }}>🧲 {nilai.kutub_b}</span><strong>{gaya.toUpperCase()}</strong></div><div className="vlab-panel"><label>Kutub A<select aria-label="Kutub magnet A" value={String(nilai.kutub_a)} onChange={(e) => { ubah('kutub_a', e.target.value); ubah('gaya', e.target.value === nilai.kutub_b ? 'tolak' : 'tarik'); }}><option>U</option><option>S</option></select></label><label>Kutub B<select aria-label="Kutub magnet B" value={String(nilai.kutub_b)} onChange={(e) => { ubah('kutub_b', e.target.value); ubah('gaya', nilai.kutub_a === e.target.value ? 'tolak' : 'tarik'); }}><option>U</option><option>S</option></select></label><label>Jarak<input aria-label="Jarak magnet" type="range" min="5" max="80" value={jarak} onChange={(e) => ubah('jarak', Number(e.target.value))}/></label></div></div>;
}

function Rangkaian({ nilai, ubah }: SceneProps) {
  const komponen = ['baterai', 'kabel', 'lampu', 'saklar'] as const;
  const sambung = (kunci: typeof komponen[number]) => { const next = !nilai[kunci]; const semua = komponen.every((item) => item === kunci ? next : Boolean(nilai[item])); ubah(kunci, next); ubah('lampu_menyala', semua); };
  return <div className="vlab-scene"><div className="vlab-visual vlab-rangkaian" data-testid="lampu-rangkaian" data-lamp-on={String(Boolean(nilai.lampu_menyala))}><span className={nilai.lampu_menyala ? 'menyala' : ''}>💡</span><svg viewBox="0 0 400 150"><path className={komponen.every((k) => Boolean(nilai[k])) ? 'aktif' : ''} d="M60 75 H340 V130 H60 Z"/></svg><b>{nilai.lampu_menyala ? 'LAMPU ON' : 'Rangkaian terputus'}</b></div><div className="vlab-panel vlab-komponen">{komponen.map((k) => <button draggable type="button" className={nilai[k] ? 'aktif' : ''} aria-label={`Hubungkan ${k}`} key={k} onClick={() => sambung(k)}>{k === 'baterai' ? '🔋' : k === 'kabel' ? '〰️' : k === 'lampu' ? '💡' : '🎚️'}<span>{k}</span></button>)}</div></div>;
}

function Solusi({ nilai, ubah }: SceneProps) {
  return <div className="vlab-scene"><div className="vlab-visual vlab-solusi"><span>🏘️</span><i>＋</i><span>⚙️</span><strong>Manfaat {nilai.manfaat}% · Dampak {nilai.dampak}%</strong></div><div className="vlab-panel"><label>Masalah<select aria-label="Masalah teknologi" value={String(nilai.masalah)} onChange={(e) => ubah('masalah', e.target.value)}><option value="air">Air sulit dipindahkan</option><option value="cahaya">Ruang gelap</option><option value="jarak">Jarak jauh</option></select></label><button type="button" onClick={() => { ubah('solusi', 'teknologi hemat energi'); ubah('manfaat', 85); ubah('dampak', 15); }}>Uji solusi hemat energi</button></div></div>;
}

function Peta({ nilai, ubah }: SceneProps) {
  const titik = ['gunung', 'sungai', 'laut', 'pulau', 'habitat', 'sumber daya', 'budaya'];
  return <div className="vlab-scene"><div className="vlab-visual vlab-peta" data-testid="peta-interaktif" style={{ '--zoom': nilai.zoom } as CSSProperties}><div>{titik.map((item, i) => <button type="button" key={item} style={{ left: `${12 + (i * 13) % 75}%`, top: `${18 + (i * 21) % 62}%` }} onClick={() => ubah('hotspot', item)} aria-label={`Hotspot ${item}`}>●</button>)}</div><strong>📍 {nilai.hotspot}</strong></div><div className="vlab-panel"><label>Zoom peta<input aria-label="Zoom peta" type="range" min="1" max="3" step=".1" value={Number(nilai.zoom)} onChange={(e) => ubah('zoom', Number(e.target.value))}/></label><p>Sentuh hotspot untuk membuka ciri wilayah tanpa menyalin ilustrasi buku.</p></div></div>;
}

function Erosi({ vlab, nilai, ubah }: SceneProps & { vlab: VlabIpas }) {
  const peristiwa = vlab.nama.includes('Earth Event'); const jalankan = () => { const perubahan = peristiwa ? Number(nilai.intensitas) * .9 : Number(nilai.air) * .45 + Number(nilai.kemiringan) * .4 - Number(nilai.vegetasi) * .35; ubah('perubahan', batas(perubahan)); };
  return <div className="vlab-scene"><div className={`vlab-visual vlab-erosi ${peristiwa ? 'vlab-gempa' : ''}`} data-testid="hasil-erosi" data-change={nilai.perubahan}><span style={{ transform: peristiwa ? `translateX(${Number(nilai.perubahan) / 8}px) rotate(${Number(nilai.perubahan) / 20}deg)` : `skewX(${-Number(nilai.kemiringan) / 8}deg)` }}>{peristiwa ? '🏢' : '⛰️'}</span><div style={{ height: `${Number(nilai.perubahan)}%` }}/><strong>{peristiwa ? 'Dampak guncangan' : 'Perubahan tanah'} {nilai.perubahan}%</strong></div><div className="vlab-panel">{peristiwa ? <label>Intensitas gerakan<input aria-label="Intensitas gempa" type="range" min="0" max="100" value={Number(nilai.intensitas)} onChange={(e) => ubah('intensitas', Number(e.target.value))}/></label> : <><label>Aliran air<input aria-label="Aliran air" type="range" min="0" max="100" value={Number(nilai.air)} onChange={(e) => ubah('air', Number(e.target.value))}/></label><label>Kemiringan<input aria-label="Kemiringan tanah" type="range" min="0" max="100" value={Number(nilai.kemiringan)} onChange={(e) => ubah('kemiringan', Number(e.target.value))}/></label><label>Vegetasi<input aria-label="Vegetasi" type="range" min="0" max="100" value={Number(nilai.vegetasi)} onChange={(e) => ubah('vegetasi', Number(e.target.value))}/></label></>}<button type="button" onClick={jalankan}>Jalankan percobaan</button></div></div>;
}

function Pernapasan({ nilai, ubah }: SceneProps) {
  return <div className="vlab-scene"><div className="vlab-visual vlab-paru" data-testid="paru-paru" data-phase={nilai.fase}><span style={{ transform: `scale(${Number(nilai.volume_paru) / 80})` }}>🫁</span><div>Udara → hidung → saluran → paru-paru</div><b>{nilai.fase}</b></div><div className="vlab-panel"><button type="button" onClick={() => { ubah('fase', 'inhale'); ubah('volume_paru', 80); ubah('oksigen', 90); }}>Tarik napas</button><button type="button" onClick={() => { ubah('fase', 'exhale'); ubah('volume_paru', 42); ubah('oksigen', 65); }}>Embuskan napas</button></div></div>;
}

function Pencernaan({ vlab, nilai, ubah }: SceneProps & { vlab: VlabIpas }) {
  const bagian = ['mulut', 'kerongkongan', 'lambung', 'usus']; const tahap = Number(nilai.tahap); const nutrisi = vlab.nama.includes('Nutrition');
  return <div className="vlab-scene"><div className="vlab-visual vlab-pencernaan" data-testid="jalur-pencernaan" data-stage={tahap}><span>{nutrisi ? '🥗' : '🍎'}</span>{bagian.map((item, i) => <button type="button" key={item} className={i <= tahap ? 'aktif' : ''} onClick={() => { if (i === Math.min(tahap + 1, bagian.length - 1)) { ubah('tahap', i); ubah('bagian', item); } }}>{item}</button>)}</div><div className="vlab-panel"><p>Bagian aktif: <b>{nilai.bagian}</b></p><label>Keseimbangan gizi<input aria-label="Keseimbangan gizi" type="range" min="0" max="100" value={Number(nilai.gizi)} onChange={(e) => ubah('gizi', Number(e.target.value))}/></label></div></div>;
}

function Pertumbuhan({ nilai, ubah }: SceneProps) {
  const hitung = (tidur: number, aktivitas: number, gizi: number) => batas(tidur * 5 + aktivitas * .3 + gizi * .3); const update = (k: 'tidur' | 'aktivitas' | 'gizi', n: number) => { const t = k === 'tidur' ? n : Number(nilai.tidur); const a = k === 'aktivitas' ? n : Number(nilai.aktivitas); const g = k === 'gizi' ? n : Number(nilai.gizi); ubah(k, n); ubah('indikator', hitung(t, a, g)); };
  return <div className="vlab-scene"><div className="vlab-visual vlab-tumbuh"><div>👶 → 🧒 → 🧑 → 🧔</div><meter min="0" max="100" value={Number(nilai.indikator)}/><b>Indikator kebiasaan sehat {nilai.indikator}%</b></div><div className="vlab-panel"><label>Tidur <b>{nilai.tidur} jam</b><input aria-label="Jam tidur" type="range" min="4" max="10" value={Number(nilai.tidur)} onChange={(e) => update('tidur', Number(e.target.value))}/></label><label>Aktivitas<input aria-label="Aktivitas sehat" type="range" min="0" max="100" value={Number(nilai.aktivitas)} onChange={(e) => update('aktivitas', Number(e.target.value))}/></label><label>Gizi<input aria-label="Gizi seimbang" type="range" min="0" max="100" value={Number(nilai.gizi)} onChange={(e) => update('gizi', Number(e.target.value))}/></label></div></div>;
}

function Ekonomi({ vlab, nilai, ubah }: SceneProps & { vlab: VlabIpas }) {
  const peran = ['produsen', 'distributor', 'konsumen']; const tahap = Number(nilai.tahap); const region = vlab.nama.includes('Region');
  return <div className="vlab-scene"><div className="vlab-visual vlab-ekonomi" data-testid="alur-ekonomi" data-complete={String(Boolean(nilai.transaksi_selesai))}>{peran.map((item, i) => <button type="button" key={item} className={i < tahap ? 'aktif' : ''} onClick={() => { if (i === tahap) { ubah('tahap', tahap + 1); ubah('peran', item); ubah('transaksi_selesai', tahap + 1 === peran.length); } }}>{i === 0 ? '🌾' : i === 1 ? '🚚' : '🛒'}<span>{item}</span></button>)}</div><div className="vlab-panel"><p>{region ? 'Gabungkan sumber daya, manusia, budaya, dan produk.' : 'Jalankan alur barang sesuai perannya.'}</p><strong>{nilai.transaksi_selesai ? '✓ Transaksi selesai' : `Lanjutkan dari ${nilai.peran}`}</strong></div></div>;
}

function KotaHijau({ nilai, ubah }: SceneProps) {
  const hitung = (s: number, a: number, h: number) => batas((100 - s) * .4 + a * .3 + h * .3); const update = (k: 'sampah' | 'kualitas_air' | 'ruang_hijau', n: number) => { const s = k === 'sampah' ? n : Number(nilai.sampah); const a = k === 'kualitas_air' ? n : Number(nilai.kualitas_air); const h = k === 'ruang_hijau' ? n : Number(nilai.ruang_hijau); ubah(k, n); ubah('kualitas_lingkungan', hitung(s, a, h)); };
  return <div className="vlab-scene"><div className="vlab-visual vlab-kota" data-testid="indikator-kota" data-quality={nilai.kualitas_lingkungan}><span>🏙️</span><div style={{ width: `${nilai.ruang_hijau}%` }}>🌳🌳🌳</div><meter min="0" max="100" value={Number(nilai.kualitas_lingkungan)}/><b>Kualitas lingkungan {nilai.kualitas_lingkungan}%</b></div><div className="vlab-panel"><label>Sampah<input aria-label="Jumlah sampah" type="range" min="0" max="100" value={Number(nilai.sampah)} onChange={(e) => update('sampah', Number(e.target.value))}/></label><label>Kualitas air<input aria-label="Kualitas air" type="range" min="0" max="100" value={Number(nilai.kualitas_air)} onChange={(e) => update('kualitas_air', Number(e.target.value))}/></label><label>Ruang hijau<input aria-label="Ruang hijau" type="range" min="0" max="100" value={Number(nilai.ruang_hijau)} onChange={(e) => update('ruang_hijau', Number(e.target.value))}/></label></div></div>;
}
