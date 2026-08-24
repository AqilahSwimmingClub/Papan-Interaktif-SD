import { Capacitor } from '@capacitor/core';

export type JenisKeluaranAi = 'game' | 'lkpd' | 'soal' | 'materi';

export interface ButirHasilAi {
  pertanyaan: string;
  jawaban: string;
  pilihan: string[];
  pembahasan: string;
  rubrik: string;
}

export interface HasilGenerasiAi {
  judul: string;
  ringkasan: string;
  butir: ButirHasilAi[];
}

export interface PermintaanGenerasiAi {
  jenis: JenisKeluaranAi;
  prompt: string;
  jumlah: number;
  engineKode?: string;
  kendali: Record<string, string | number | boolean>;
  konteks: {
    tingkatKelas: number;
    faseKode: string;
    mapelKode: string;
    cpId: string;
    tpId: string;
    cp: string;
    tp: string;
    referensi: Array<{ judul: string; bab: string; topik: string; materiSumber: string; lingkupIzin: string }>;
    terverifikasi: true;
  };
  provider?: ProviderAi;
}

export type ProviderAi = 'openai' | 'gemini';
export const KUNCI_PROVIDER_AI = 'papan-interaktif-sd:provider-ai';

export function bacaProviderAi(): ProviderAi {
  return localStorage.getItem(KUNCI_PROVIDER_AI) === 'gemini' ? 'gemini' : 'openai';
}

export function simpanProviderAi(provider: ProviderAi): void {
  localStorage.setItem(KUNCI_PROVIDER_AI, provider);
}

export type KodeGalatAi = 'AI_OFFLINE' | 'AI_NOT_CONFIGURED' | 'AI_TIMEOUT' | 'AI_RATE_LIMIT' | 'AI_INVALID_RESPONSE' | 'AI_SERVICE_ERROR';
export type StatusOperasionalAi = 'SIAP' | 'API KEY BELUM TERSEDIA' | 'SERVER TIDAK DAPAT DIJANGKAU' | 'RATE LIMIT' | 'TIMEOUT' | 'OFFLINE' | 'ERROR PROVIDER';

export class GalatAi extends Error {
  readonly kode: KodeGalatAi;
  constructor(kode: KodeGalatAi, pesan: string) {
    super(pesan);
    this.name = 'GalatAi';
    this.kode = kode;
  }
}

export function endpointAi(): string {
  const konfigurasi = import.meta.env.VITE_AI_ENDPOINT?.trim();
  if (konfigurasi) {
    if (Capacitor.isNativePlatform() && konfigurasi.startsWith('/')) return `https://papan-interaktif-sd.vercel.app${konfigurasi}`;
    return konfigurasi;
  }
  return Capacitor.isNativePlatform()
    ? 'https://papan-interaktif-sd.vercel.app/api/ai/generate'
    : '/api/ai/generate';
}

export function statusOperasionalAi(galat: unknown): StatusOperasionalAi {
  if (!(galat instanceof GalatAi)) return 'ERROR PROVIDER';
  if (galat.kode === 'AI_NOT_CONFIGURED') return 'API KEY BELUM TERSEDIA';
  if (galat.kode === 'AI_TIMEOUT') return 'TIMEOUT';
  if (galat.kode === 'AI_RATE_LIMIT') return 'RATE LIMIT';
  if (galat.kode === 'AI_OFFLINE') return 'OFFLINE';
  if (galat.kode === 'AI_SERVICE_ERROR') return 'SERVER TIDAK DAPAT DIJANGKAU';
  return 'ERROR PROVIDER';
}

export interface StatusKonfigurasiAi {
  providerAktif: ProviderAi;
  provider: Record<ProviderAi, { tersedia: boolean; model: string }>;
  endpoint: string;
}

export async function bacaStatusKonfigurasiAi(provider: ProviderAi = bacaProviderAi()): Promise<StatusKonfigurasiAi> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new GalatAi('AI_OFFLINE', 'Status AI tidak dapat diperiksa saat perangkat offline.');
  }
  const pengendali = new AbortController();
  const batas = window.setTimeout(() => pengendali.abort(), 10_000);
  try {
    const respons = await fetch(`${endpointAi()}?provider=${provider}`, { method: 'GET', signal: pengendali.signal });
    const data = await respons.json().catch(() => null) as { ok?: boolean; status?: StatusKonfigurasiAi } | null;
    if (!respons.ok || !data?.ok || !data.status) {
      if (respons.status === 429) throw new GalatAi('AI_RATE_LIMIT', 'Status AI terkena rate limit.');
      if (respons.status === 504) throw new GalatAi('AI_TIMEOUT', 'Pemeriksaan status AI melewati batas waktu.');
      throw new GalatAi('AI_SERVICE_ERROR', 'Status konfigurasi AI tidak dapat dibaca dari server.');
    }
    return data.status;
  } catch (galat) {
    if (galat instanceof GalatAi) throw galat;
    if (galat instanceof DOMException && galat.name === 'AbortError') throw new GalatAi('AI_TIMEOUT', 'Pemeriksaan status AI melewati batas waktu.');
    throw new GalatAi('AI_SERVICE_ERROR', 'Endpoint AI tidak dapat dijangkau.');
  } finally { window.clearTimeout(batas); }
}

function validasiHasil(nilai: unknown): HasilGenerasiAi {
  if (!nilai || typeof nilai !== 'object') throw new GalatAi('AI_INVALID_RESPONSE', 'Respons AI tidak berbentuk objek yang dapat dipakai.');
  const calon = nilai as Partial<HasilGenerasiAi>;
  if (!calon.judul?.trim() || !calon.ringkasan?.trim() || !Array.isArray(calon.butir) || !calon.butir.length) {
    throw new GalatAi('AI_INVALID_RESPONSE', 'Respons AI tidak lengkap. Coba lagi atau perjelas prompt.');
  }
  const butir = calon.butir.map((item) => {
    if (!item || typeof item !== 'object') throw new GalatAi('AI_INVALID_RESPONSE', 'Salah satu butir AI tidak valid.');
    const baris = item as Partial<ButirHasilAi>;
    if (!baris.pertanyaan?.trim() || !baris.jawaban?.trim()) throw new GalatAi('AI_INVALID_RESPONSE', 'Butir AI tidak memiliki pertanyaan atau jawaban.');
    return {
      pertanyaan: baris.pertanyaan.trim(), jawaban: baris.jawaban.trim(),
      pilihan: Array.isArray(baris.pilihan) ? baris.pilihan.filter((x): x is string => typeof x === 'string' && Boolean(x.trim())).map((x) => x.trim()) : [],
      pembahasan: baris.pembahasan?.trim() ?? '', rubrik: baris.rubrik?.trim() ?? '',
    };
  });
  return { judul: calon.judul.trim(), ringkasan: calon.ringkasan.trim(), butir };
}

async function sekali(permintaan: PermintaanGenerasiAi, batasMs: number): Promise<HasilGenerasiAi> {
  const pengendali = new AbortController();
  const batas = window.setTimeout(() => pengendali.abort(), batasMs);
  try {
    const respons = await fetch(endpointAi(), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...permintaan, provider: permintaan.provider ?? bacaProviderAi() }), signal: pengendali.signal,
    });
    const data = await respons.json().catch(() => null) as { ok?: boolean; hasil?: unknown; kode?: KodeGalatAi; pesan?: string } | null;
    if (!respons.ok || !data?.ok) {
      const kode = data?.kode ?? (respons.status === 429
        ? 'AI_RATE_LIMIT'
        : respons.status === 404 || (respons.ok && !data)
          ? 'AI_NOT_CONFIGURED'
          : 'AI_SERVICE_ERROR');
      const pesanBawaan = kode === 'AI_NOT_CONFIGURED'
        ? 'Layanan AI belum dikonfigurasi oleh administrator.'
        : 'Layanan AI sedang tidak dapat digunakan.';
      throw new GalatAi(kode, data?.pesan ?? pesanBawaan);
    }
    const hasil = validasiHasil(data.hasil);
    if (permintaan.kendali.paket_bank_soal && hasil.butir.length !== 25) {
      throw new GalatAi('AI_INVALID_RESPONSE', 'Bank Soal harus berisi tepat 25 soal. Silakan regenerate.');
    }
    return hasil;
  } catch (galat) {
    if (galat instanceof GalatAi) throw galat;
    if (galat instanceof DOMException && galat.name === 'AbortError') throw new GalatAi('AI_TIMEOUT', 'Layanan AI melewati batas waktu. Coba lagi.');
    throw new GalatAi('AI_SERVICE_ERROR', 'Tidak dapat terhubung ke layanan AI. Prompt tetap tersimpan di perangkat.');
  } finally {
    window.clearTimeout(batas);
  }
}

/** Satu retry aman untuk timeout/galat sementara; validasi dan rate limit tidak diulang. */
export async function mintaGenerasiAi(permintaan: PermintaanGenerasiAi): Promise<HasilGenerasiAi> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) throw new GalatAi('AI_OFFLINE', 'Perangkat sedang offline. Permintaan dimasukkan ke antrean lokal.');
  try {
    return await sekali(permintaan, 30_000);
  } catch (galat) {
    if (galat instanceof GalatAi && !['AI_TIMEOUT', 'AI_SERVICE_ERROR'].includes(galat.kode)) throw galat;
    await new Promise((selesai) => window.setTimeout(selesai, 650));
    return sekali(permintaan, 30_000);
  }
}
