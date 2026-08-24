interface ResponsVercel {
  status: (kode: number) => ResponsVercel;
  setHeader: (nama: string, nilai: string) => void;
  json: (nilai: unknown) => void;
}

interface PermintaanVercel { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }

const riwayat = new Map<string, number[]>();

function kirim(respons: ResponsVercel, status: number, nilai: unknown): void {
  respons.status(status).json(nilai);
}

function ambilJson(teks: string): unknown {
  const bersih = teks.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const awal = bersih.indexOf('{');
  const akhir = bersih.lastIndexOf('}');
  if (awal < 0 || akhir <= awal) throw new Error('Provider tidak mengembalikan JSON.');
  return JSON.parse(bersih.slice(awal, akhir + 1));
}

async function panggilOpenAi(url: string, kunci: string, model: string, body: Record<string, unknown>): Promise<unknown> {
  let galatTerakhir: unknown;
  for (let percobaan = 0; percobaan < 2; percobaan += 1) {
    const pengendali = new AbortController();
    const batas = setTimeout(() => pengendali.abort(), 25_000);
    try {
      const respons = await fetch(url, {
        method: 'POST', headers: { Authorization: `Bearer ${kunci}`, 'Content-Type': 'application/json' },
        signal: pengendali.signal,
        body: JSON.stringify({
          model, temperature: 0.35, response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Anda membantu guru SD Indonesia. Gunakan hanya CP, TP, materi, dan metadata referensi yang diberikan. Jangan mengarang kutipan kurikulum. Kembalikan JSON: {"judul":string,"ringkasan":string,"butir":[{"pertanyaan":string,"jawaban":string,"pilihan":string[],"pembahasan":string,"rubrik":string}]}.' },
            { role: 'user', content: JSON.stringify(body) },
          ],
        }),
      });
      if (!respons.ok) {
        const teks = await respons.text();
        if (respons.status < 500 && respons.status !== 429) throw new Error(`Provider menolak permintaan (${respons.status}): ${teks.slice(0, 180)}`);
        throw new Error(`Provider sementara bermasalah (${respons.status}).`);
      }
      const data = await respons.json() as { choices?: Array<{ message?: { content?: string } }> };
      return ambilJson(data.choices?.[0]?.message?.content ?? '');
    } catch (galat) {
      galatTerakhir = galat;
      if (percobaan === 0) await new Promise((selesai) => setTimeout(selesai, 500));
    } finally { clearTimeout(batas); }
  }
  throw galatTerakhir;
}

async function panggilGemini(kunci: string, model: string, body: Record<string, unknown>): Promise<unknown> {
  let galatTerakhir: unknown;
  const instruksi = 'Anda membantu guru SD Indonesia. Gunakan hanya CP, TP, materi, dan metadata referensi yang diberikan. Jangan mengarang kutipan kurikulum. Kembalikan JSON: {"judul":string,"ringkasan":string,"butir":[{"pertanyaan":string,"jawaban":string,"pilihan":string[],"pembahasan":string,"rubrik":string}]}.\n\nDATA GURU:\n';
  for (let percobaan = 0; percobaan < 2; percobaan += 1) {
    const pengendali = new AbortController();
    const batas = setTimeout(() => pengendali.abort(), 25_000);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(kunci)}`;
      const respons = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: pengendali.signal,
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${instruksi}${JSON.stringify(body)}` }] }], generationConfig: { temperature: 0.35, responseMimeType: 'application/json' } }) });
      if (!respons.ok) {
        const teks = await respons.text();
        if (respons.status < 500 && respons.status !== 429) throw new Error(`Gemini menolak permintaan (${respons.status}): ${teks.slice(0, 180)}`);
        throw new Error(`Gemini sementara bermasalah (${respons.status}).`);
      }
      const data = await respons.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      return ambilJson(data.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
    } catch (galat) {
      galatTerakhir = galat;
      if (percobaan === 0) await new Promise((selesai) => setTimeout(selesai, 500));
    } finally { clearTimeout(batas); }
  }
  throw galatTerakhir;
}

export default async function handler(permintaan: PermintaanVercel, respons: ResponsVercel): Promise<void> {
  const asal = typeof permintaan.headers.origin === 'string' ? permintaan.headers.origin : '';
  const diizinkan = /^https:\/\/(localhost|papan-interaktif-sd(?:-[a-z0-9-]+)?\.vercel\.app)$/.test(asal);
  if (diizinkan) respons.setHeader('Access-Control-Allow-Origin', asal);
  respons.setHeader('Vary', 'Origin');
  respons.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  respons.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (permintaan.method === 'OPTIONS') return kirim(respons, 204, null);
  if (permintaan.method !== 'POST') return kirim(respons, 405, { ok: false, kode: 'AI_SERVICE_ERROR', pesan: 'Metode tidak diizinkan.' });

  const ip = (typeof permintaan.headers['x-forwarded-for'] === 'string' ? permintaan.headers['x-forwarded-for'].split(',')[0] : permintaan.socket?.remoteAddress) ?? 'lokal';
  const sekarang = Date.now();
  const aktif = (riwayat.get(ip) ?? []).filter((waktu) => sekarang - waktu < 60_000);
  if (aktif.length >= 10) return kirim(respons, 429, { ok: false, kode: 'AI_RATE_LIMIT', pesan: 'Batas permintaan AI tercapai. Tunggu satu menit lalu coba lagi.' });
  riwayat.set(ip, [...aktif, sekarang]);

  const body = permintaan.body as { prompt?: unknown; jenis?: unknown; jumlah?: unknown; provider?: unknown; konteks?: { cp?: unknown; tp?: unknown; terverifikasi?: unknown } } | null;
  if (!body || typeof body.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 12_000 || typeof body.jenis !== 'string') {
    return kirim(respons, 400, { ok: false, kode: 'AI_SERVICE_ERROR', pesan: 'Permintaan AI tidak valid.' });
  }
  if (!body.konteks || body.konteks.terverifikasi !== true || typeof body.konteks.cp !== 'string' || typeof body.konteks.tp !== 'string') {
    return kirim(respons, 400, { ok: false, kode: 'AI_SERVICE_ERROR', pesan: 'CP/TP terverifikasi wajib tersedia.' });
  }

  const provider = body.provider === 'gemini' ? 'gemini' : body.provider === 'openai' ? 'openai' : process.env.AI_PROVIDER === 'gemini' ? 'gemini' : 'openai';
  const konfigurasi = provider === 'gemini'
    ? { kunci: process.env.GEMINI_API_KEY?.trim(), model: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash' }
    : { kunci: process.env.OPENAI_API_KEY?.trim() || process.env.AI_API_KEY?.trim(), model: process.env.OPENAI_MODEL?.trim() || process.env.AI_MODEL?.trim() || 'gpt-4.1-mini', url: process.env.OPENAI_API_URL?.trim() || process.env.AI_API_URL?.trim() || 'https://api.openai.com/v1/chat/completions' };
  if (!konfigurasi.kunci) return kirim(respons, 503, { ok: false, kode: 'AI_NOT_CONFIGURED', pesan: 'Layanan AI belum dikonfigurasi oleh administrator.' });

  try {
    const hasil = provider === 'gemini'
      ? await panggilGemini(konfigurasi.kunci, konfigurasi.model, body as unknown as Record<string, unknown>)
      : await panggilOpenAi(konfigurasi.url!, konfigurasi.kunci, konfigurasi.model, body as unknown as Record<string, unknown>);
    kirim(respons, 200, { ok: true, hasil });
  } catch (galat) {
    const timeout = galat instanceof Error && galat.name === 'AbortError';
    kirim(respons, timeout ? 504 : 502, { ok: false, kode: timeout ? 'AI_TIMEOUT' : 'AI_SERVICE_ERROR', pesan: timeout ? 'Provider AI melewati batas waktu.' : 'Provider AI sedang tidak dapat digunakan.' });
  }
}
