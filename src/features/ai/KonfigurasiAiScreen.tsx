import { useCallback, useEffect, useState } from 'react';
import { bacaProviderAi, bacaStatusKonfigurasiAi, simpanProviderAi, type ProviderAi, type StatusKonfigurasiAi } from '../../lib/ai/aiService';
import './ai-studio.css';

export function KonfigurasiAiScreen() {
  const [provider, setProvider] = useState<ProviderAi>(() => bacaProviderAi());
  const [status, setStatus] = useState<StatusKonfigurasiAi | null>(null);
  const [pesan, setPesan] = useState('');
  const [memuat, setMemuat] = useState(false);

  const periksa = useCallback(async (providerAktif = provider) => {
    setMemuat(true); setPesan('');
    try { setStatus(await bacaStatusKonfigurasiAi(providerAktif)); }
    catch (galat) { setStatus(null); setPesan(galat instanceof Error ? galat.message : 'Status AI gagal dibaca.'); }
    finally { setMemuat(false); }
  }, [provider]);

  useEffect(() => { void periksa(); }, [periksa]);

  function simpan() {
    simpanProviderAi(provider);
    setPesan(`Provider ${provider === 'openai' ? 'OpenAI' : 'Gemini'} tersimpan untuk perangkat ini.`);
    void periksa(provider);
  }

  const aktif = status?.provider[provider];
  return <main className="halaman-ai halaman-konfigurasi-ai" data-testid="konfigurasi-ai">
    <header className="ai-kop"><div><p className="label-data">Hanya Admin · secret server-side</p><h1>Konfigurasi AI</h1><p>Pilih provider yang dipakai seluruh generator. API key tidak pernah disimpan di browser, IndexedDB, backup, atau APK.</p></div><span className={`ai-status ${aktif?.tersedia ? 'siap' : 'belum'}`}>{memuat ? 'Memeriksa…' : aktif?.tersedia ? 'Siap digunakan' : 'Belum dikonfigurasi'}</span></header>
    <section className="ai-konfigurasi-panel">
      <label>Provider AI<select value={provider} onChange={(e) => setProvider(e.target.value as ProviderAi)}><option value="openai">OpenAI</option><option value="gemini">Google Gemini</option></select></label>
      <div className="ai-provider-status"><article><strong>OpenAI</strong><span>{status?.provider.openai.tersedia ? '✓ API key terdeteksi' : '× OPENAI_API_KEY belum tersedia'}</span><small>{status?.provider.openai.model ?? 'Model dibaca dari server'}</small></article><article><strong>Gemini</strong><span>{status?.provider.gemini.tersedia ? '✓ API key terdeteksi' : '× GEMINI_API_KEY belum tersedia'}</span><small>{status?.provider.gemini.model ?? 'Model dibaca dari server'}</small></article></div>
      <div className="ai-konfigurasi-aksi"><button type="button" className="ai-buat" onClick={simpan}>Simpan konfigurasi provider</button><button type="button" onClick={() => void periksa()}>Periksa ulang status server</button></div>
      <p className="ai-catatan-secret">Secret dipasang sebagai Environment Variable di Vercel. Android memakai endpoint backend yang sama dan hanya menerima status serta hasil—bukan API key.</p>
      {status ? <code>{status.endpoint}</code> : null}{pesan ? <p className="ai-pesan" role="status">{pesan}</p> : null}
    </section>
  </main>;
}
