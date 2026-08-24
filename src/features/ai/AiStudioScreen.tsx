import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { alasanEngineGame } from '../../lib/gameContent';
import { GAME_ENGINE_FINAL, PROFIL_FASE_GAME, saringEngineGame } from '../../lib/gameEngines';
import { GalatAi, mintaGenerasiAi, type HasilGenerasiAi, type JenisKeluaranAi } from '../../lib/ai/aiService';
import { antrekanPermintaanAi } from '../../lib/offline/antreanAi';
import { simpanPromptAi } from '../../lib/storage/aiRepo';
import { simpanGame } from '../../lib/storage/gameRepo';
import { bacaKonteksAiTerpercaya, bacaRantaiTpAktif, simpanLkpdTertaut, simpanSoalTertaut, type KonteksAiTerpercaya, type RantaiTpAktif } from '../../lib/storage/isiRepo';
import { simpanMateri } from '../../lib/storage/kurikulumAdminRepo';
import type { ButirGame, GamePembelajaran, Lkpd, Materi, PromptAi, Soal } from '../../lib/types';
import { RUTE, ruteMainGame } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './ai-studio.css';

const LABEL: Record<JenisKeluaranAi, string> = { game: 'Game Generator', lkpd: 'Pembuat LKPD', soal: 'Pembuat Soal', materi: 'Pembuat Materi' };
const CONTOH: Record<JenisKeluaranAi, string> = {
  game: 'Buat game yang cocok untuk TP ini dengan bahasa ramah anak dan umpan balik singkat.',
  lkpd: 'Buat LKPD kontekstual untuk satu pertemuan, lengkap dengan petunjuk dan refleksi.',
  soal: 'Buat soal formatif bervariasi beserta kunci dan pembahasan singkat.',
  materi: 'Buat materi ringkas, contoh dekat dengan kehidupan siswa, dan aktivitas penutup.',
};

function jenisDariFitur(fitur: string): JenisKeluaranAi {
  if (fitur === 'game-generator') return 'game';
  if (fitur === 'pembuat-lkpd') return 'lkpd';
  if (fitur === 'pembuat-soal') return 'soal';
  return 'materi';
}

function pilihanGame(pilihan: string[], jawaban: string, maksimum: number): string[] {
  const unik = [jawaban, ...pilihan].filter((item, posisi, semua) => item.trim() && semua.indexOf(item) === posisi);
  return unik.slice(0, maksimum);
}

export function AiStudioScreen() {
  const { pathname } = useLocation();
  const fitur = pathname.split('/').filter(Boolean).at(-1) ?? 'studio-ai';
  const { akun } = useAuth();
  const { konteks } = useKurikulum();
  const [jenis, setJenis] = useState<JenisKeluaranAi>(() => jenisDariFitur(fitur));
  const [rantai, setRantai] = useState<RantaiTpAktif | null>(null);
  const [konteksAi, setKonteksAi] = useState<KonteksAiTerpercaya | null>(null);
  const [prompt, setPrompt] = useState('');
  const [jumlah, setJumlah] = useState(8);
  const [format, setFormat] = useState('pilihan ganda');
  const [engineKode, setEngineKode] = useState('');
  const [hasil, setHasil] = useState<HasilGenerasiAi | null>(null);
  const [promptAktifId, setPromptAktifId] = useState('');
  const [memuat, setMemuat] = useState(false);
  const [pesan, setPesan] = useState('');
  const [sudahUji, setSudahUji] = useState(false);
  const [gameTersimpanId, setGameTersimpanId] = useState('');

  useEffect(() => { setJenis(jenisDariFitur(fitur)); setHasil(null); setPesan(''); }, [fitur]);
  useEffect(() => {
    if (!konteks.tp_id) { setRantai(null); setKonteksAi(null); return; }
    let hidup = true;
    Promise.all([bacaRantaiTpAktif(konteks.tp_id), bacaKonteksAiTerpercaya(konteks.tp_id)])
      .then(([rantaiAktif, terpercaya]) => {
        if (!hidup) return;
        setRantai(rantaiAktif); setKonteksAi(terpercaya); setPesan('');
      })
      .catch((galat: unknown) => hidup && setPesan(galat instanceof Error ? galat.message : 'Konteks AI gagal dibaca.'));
    return () => { hidup = false; };
  }, [konteks.tp_id]);

  const rekomendasi = useMemo(() => rantai ? saringEngineGame({
    fase_kode: rantai.cp.fase_kode, mapel_kode: rantai.cp.mapel_kode, teks_tp: rantai.tp.teks_tujuan,
  }).slice(0, 6) : [], [rantai]);

  useEffect(() => {
    if (jenis === 'game' && rekomendasi.length && !rekomendasi.some((item) => item.kode === engineKode)) setEngineKode(rekomendasi[0]!.kode);
  }, [engineKode, jenis, rekomendasi]);

  async function generasikan() {
    if (!akun || !rantai || !konteksAi) return;
    const teksPrompt = prompt.trim() || CONTOH[jenis];
    const promptAi: PromptAi = {
      id: `PROMPT-AI-${crypto.randomUUID()}`, teks_guru_utuh: teksPrompt,
      konteks_json: konteksAi.kurikulum, jenis_keluaran: jenis,
      kendali_json: { jumlah, format, engine_kode: engineKode }, riwayat_revisi: [],
      dibuat_oleh: akun.id, waktu: new Date().toISOString(),
    };
    setMemuat(true); setPesan(''); setHasil(null); setSudahUji(false); setGameTersimpanId('');
    await simpanPromptAi(promptAi); setPromptAktifId(promptAi.id);
    if (!navigator.onLine) {
      await antrekanPermintaanAi(promptAi.id);
      setPesan('Perangkat offline. Prompt tersimpan utuh dan masuk antrean lokal untuk dicoba saat online.');
      setMemuat(false); return;
    }
    try {
      const keluaran = await mintaGenerasiAi({
        jenis, prompt: teksPrompt, jumlah, engineKode: jenis === 'game' ? engineKode : undefined,
        kendali: { format, wajib_kunci: true, wajib_pembahasan: true },
        konteks: {
          tingkatKelas: rantai.tp.tingkat_kelas, faseKode: rantai.cp.fase_kode,
          mapelKode: rantai.cp.mapel_kode, cpId: rantai.cp.id, tpId: rantai.tp.id,
          cp: konteksAi.cp, tp: konteksAi.tp, terverifikasi: true,
          referensi: konteksAi.referensi.map((item) => ({ judul: item.judul, bab: item.bab, lingkupIzin: item.lingkup_izin })),
        },
      });
      setHasil(keluaran);
      setPesan('Draf AI siap. Tinjau dan edit setiap butir sebelum disetujui.');
    } catch (galat) {
      setPesan(galat instanceof GalatAi ? galat.message : 'Layanan AI sedang tidak dapat digunakan.');
    } finally { setMemuat(false); }
  }

  async function setujuiDanSimpan() {
    if (!akun || !rantai || !hasil || !promptAktifId) return;
    if (jenis === 'game' && !sudahUji) { setPesan('Uji sedikitnya satu butir game sebelum menyimpannya ke katalog.'); return; }
    setMemuat(true); setPesan('');
    try {
      if (jenis === 'game') {
        const engine = GAME_ENGINE_FINAL.find((item) => item.kode === engineKode);
        if (!engine) throw new Error('Engine game belum dipilih.');
        const profil = PROFIL_FASE_GAME[rantai.cp.fase_kode];
        const butir: ButirGame[] = hasil.butir.map((item, indeks) => {
          const pilihan = pilihanGame(item.pilihan, item.jawaban, profil.jumlah_pilihan);
          if (pilihan.length < 2) throw new Error(`Butir ${indeks + 1} belum memiliki sedikitnya dua pilihan.`);
          return { id: `BUTIR-AI-${crypto.randomUUID()}`, pertanyaan: item.pertanyaan, pilihan, jawaban: item.jawaban, penjelasan: item.pembahasan, sumber: 'tp' };
        });
        const game: GamePembelajaran = {
          id: `GAME-AI-${crypto.randomUUID()}`, tp_id: rantai.tp.id,
          tingkat_kelas: rantai.tp.tingkat_kelas, fase_kode: rantai.cp.fase_kode,
          mapel_kode: rantai.cp.mapel_kode, cp_id: rantai.cp.id,
          materi_id: rantai.materi[0]?.id ?? null, engine_kode: engine.kode,
          judul: hasil.judul, tingkat_kesulitan: rantai.cp.fase_kode === 'A' ? 'mudah' : 'sedang',
          mode_permainan: engine.mode_didukung[0] ?? 'seluruh_kelas',
          durasi_menit: Math.max(5, Math.ceil(butir.length * ((profil.detik_per_butir ?? 30) / 60))),
          jumlah_butir: butir.length, detik_per_butir: profil.detik_per_butir, butir,
          prompt_ai_id: promptAktifId, status_persetujuan: 'disetujui', jumlah_dimainkan: 0,
          referensi_bab_id: konteksAi?.kurikulum.referensi_bab_id ?? null,
        };
        await simpanGame(game); setGameTersimpanId(game.id);
      } else if (jenis === 'materi') {
        const materi: Materi = {
          id: `MATERI-AI-${crypto.randomUUID()}`, tp_id: rantai.tp.id, judul: hasil.judul,
          blok: [{ id: crypto.randomUUID(), jenis: 'teks', isi: hasil.ringkasan, urutan: 1 }, ...hasil.butir.map((item, indeks) => ({ id: crypto.randomUUID(), jenis: 'aktivitas' as const, isi: `${item.pertanyaan}\n${item.jawaban}`, urutan: indeks + 2 }))],
          sumber: 'ai', perkiraan_menit: 35, diperbarui: new Date().toISOString(),
          referensi_bab_id: konteksAi?.kurikulum.referensi_bab_id ?? null,
        };
        await simpanMateri(materi);
      } else if (jenis === 'lkpd') {
        const lkpd: Lkpd = {
          id: `LKPD-AI-${crypto.randomUUID()}`, tp_id: rantai.tp.id, judul: hasil.judul,
          blok: hasil.butir.map((item, indeks) => ({ id: crypto.randomUUID(), jenis: 'aktivitas', isi: item.pertanyaan, urutan: indeks + 1 })),
          jumlah_halaman: Math.max(1, Math.ceil(hasil.butir.length / 5)), kertas: 'A4', mode_cetak: 'hemat_tinta',
          prompt_ai_id: promptAktifId, status_persetujuan: 'disetujui',
          versi_siswa: hasil.butir.map((item, i) => `${i + 1}. ${item.pertanyaan}`).join('\n'),
          versi_kunci: hasil.butir.map((item, i) => `${i + 1}. ${item.jawaban}\n${item.pembahasan}`).join('\n'),
          referensi_bab_id: konteksAi?.kurikulum.referensi_bab_id ?? null,
        };
        await simpanLkpdTertaut(lkpd);
      } else {
        for (const [indeks, item] of hasil.butir.entries()) {
          const soal: Soal = {
            id: `SOAL-AI-${crypto.randomUUID()}`, tp_id: rantai.tp.id, bentuk: format,
            level_kognitif: indeks % 3 === 2 ? 'HOTS' : indeks % 3 === 1 ? 'MOTS' : 'LOTS',
            teks: item.pertanyaan, pilihan: item.pilihan, kunci: item.jawaban,
            pembahasan: item.pembahasan, rubrik: item.rubrik, prompt_ai_id: promptAktifId,
            status_persetujuan: 'disetujui', referensi_bab_id: konteksAi?.kurikulum.referensi_bab_id ?? null,
          };
          await simpanSoalTertaut(soal);
        }
      }
      setPesan(`${LABEL[jenis]} sudah disetujui dan tersimpan pada perangkat.`);
    } catch (galat) { setPesan(galat instanceof Error ? galat.message : 'Hasil tidak dapat disimpan.'); }
    finally { setMemuat(false); }
  }

  if (!konteks.tp_id || !konteks.tingkat_kelas) return <main className="halaman-ai"><p className="label-data">Studio AI</p><h1>{LABEL[jenis]}</h1><section className="ai-kosong"><h2>Pilih CP dan TP lebih dulu</h2><p>AI hanya bekerja dengan konteks kurikulum terverifikasi dan tidak mengubah data CP/TP.</p><Link to={RUTE.kelas}>Pilih Kelas</Link></section></main>;

  return <main className="halaman-ai" data-testid="studio-ai">
    <header className="ai-kop"><div><p className="label-data">Konteks terkunci · hasil wajib ditinjau</p><h1>{LABEL[jenis]}</h1><p>{rantai?.tp.teks_tujuan ?? 'Memuat konteks TP…'}</p></div><span className="ai-lencana">✦ AI</span></header>
    <nav className="ai-konteks" aria-label="Konteks AI"><span>Kelas {konteks.tingkat_kelas}</span><span>Fase {konteks.fase_kode}</span><span>{rantai?.mapel.nama ?? konteks.mapel_kode}</span><span>{rantai?.tp.kode_tampil ?? konteks.tp_id}</span><b>CP/TP read-only</b></nav>
    <div className="ai-tata">
      <section className="ai-panel">
        {fitur === 'studio-ai' ? <label>Jenis keluaran<select value={jenis} onChange={(e) => { setJenis(e.target.value as JenisKeluaranAi); setHasil(null); }}><option value="materi">Materi</option><option value="lkpd">LKPD</option><option value="soal">Soal</option><option value="game">Game</option></select></label> : null}
        {jenis === 'game' ? <fieldset><legend>Rekomendasi engine</legend><div className="ai-engine">{rekomendasi.map((engine) => <button type="button" className={engineKode === engine.kode ? 'aktif' : ''} key={engine.kode} onClick={() => setEngineKode(engine.kode)}><strong>{engine.nama}</strong><small>{rantai ? alasanEngineGame(engine, rantai.tp.teks_tujuan) : engine.yang_diukur}</small></button>)}</div></fieldset> : null}
        <div className="ai-kendali"><label>Jumlah butir<input type="number" min="1" max="20" value={jumlah} onChange={(e) => setJumlah(Math.max(1, Math.min(20, Number(e.target.value))))}/></label>{jenis === 'soal' ? <label>Bentuk<select value={format} onChange={(e) => setFormat(e.target.value)}><option>pilihan ganda</option><option>benar/salah</option><option>isian singkat</option><option>uraian</option><option>soal cerita</option></select></label> : null}</div>
        <label>Instruksi guru<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={CONTOH[jenis]} rows={7}/><small>Prompt disimpan utuh. Jangan masukkan data pribadi siswa.</small></label>
        <button className="ai-buat" type="button" disabled={memuat || !konteksAi || (jenis === 'game' && !engineKode)} onClick={() => void generasikan()}>{memuat ? 'Menyiapkan draf…' : `Buat ${LABEL[jenis]}`}</button>
        {pesan ? <p className="ai-pesan" role="status">{pesan}</p> : null}
      </section>
      <section className="ai-hasil" aria-live="polite">
        <header><div><span>Pratinjau guru</span><h2>{hasil?.judul ?? 'Hasil akan muncul di sini'}</h2></div>{hasil ? <em>Belum dibagikan</em> : null}</header>
        {!hasil ? <div className="ai-hasil-kosong"><span>✦</span><p>{memuat ? 'AI sedang menyusun hasil terstruktur. Guru dapat membatalkan dengan berpindah halaman.' : 'Pilih kendali, tulis instruksi, lalu buat draf. Jika layanan belum dikonfigurasi, aplikasi akan memberi status yang jelas.'}</p></div> : <>
          <label>Judul<input value={hasil.judul} onChange={(e) => setHasil({ ...hasil, judul: e.target.value })}/></label>
          <label>Ringkasan<textarea rows={3} value={hasil.ringkasan} onChange={(e) => setHasil({ ...hasil, ringkasan: e.target.value })}/></label>
          <div className="ai-butir">{hasil.butir.map((item, indeks) => <article key={indeks}><span>{indeks + 1}</span><label>Pertanyaan<textarea rows={3} value={item.pertanyaan} onChange={(e) => setHasil({ ...hasil, butir: hasil.butir.map((baris, posisi) => posisi === indeks ? { ...baris, pertanyaan: e.target.value } : baris) })}/></label><label>Jawaban<input value={item.jawaban} onChange={(e) => setHasil({ ...hasil, butir: hasil.butir.map((baris, posisi) => posisi === indeks ? { ...baris, jawaban: e.target.value } : baris) })}/></label><small>{item.pembahasan || 'Tambahkan pembahasan bila diperlukan.'}</small></article>)}</div>
          {jenis === 'game' ? <button className="ai-uji" type="button" onClick={() => { setSudahUji(true); setPesan(`Uji butir pertama: ${hasil.butir[0]?.pertanyaan ?? ''}`); }}>Uji butir pertama {sudahUji ? '✓' : ''}</button> : null}
          <button className="ai-setujui" type="button" disabled={memuat || (jenis === 'game' && !sudahUji)} onClick={() => void setujuiDanSimpan()}>Setujui & simpan lokal</button>
          {gameTersimpanId ? <Link className="ai-main" to={ruteMainGame(gameTersimpanId)}>Mainkan game tersimpan</Link> : null}
        </>}
      </section>
    </div>
  </main>;
}
