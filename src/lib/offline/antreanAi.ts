import type { AntreanAi } from '../types';
import { TOKO, jalankanTransaksi, kueri } from '../storage/db';

export type PemrosesAntreanAi = (antrean: AntreanAi) => Promise<void>;

let pemrosesAktif: PemrosesAntreanAi | null = null;
let sedangBerjalan: Promise<number> | null = null;

export async function antrekanPermintaanAi(promptAiId: string): Promise<AntreanAi> {
  const prompt = promptAiId.trim();
  if (!prompt) throw new Error('prompt_ai_id wajib diisi sebelum masuk antrean.');
  return jalankanTransaksi(TOKO.antreanAi, 'readwrite', async (toko) => {
    const semua = await kueri.semua<AntreanAi>(toko(TOKO.antreanAi));
    const sudahAda = semua.find(
      (baris) => baris.prompt_ai_id === prompt && ['menunggu', 'jalan'].includes(baris.status),
    );
    if (sudahAda) return sudahAda;
    const antrean: AntreanAi = {
      id: `ANTREAN-AI-${crypto.randomUUID()}`,
      prompt_ai_id: prompt,
      status: 'menunggu',
      waktu_dibuat: new Date().toISOString(),
      percobaan: 0,
    };
    await kueri.simpan(toko(TOKO.antreanAi), antrean);
    return antrean;
  });
}

async function ubahStatus(antrean: AntreanAi): Promise<void> {
  await jalankanTransaksi(TOKO.antreanAi, 'readwrite', (toko) =>
    kueri.simpan(toko(TOKO.antreanAi), antrean),
  );
}

async function prosesMenunggu(pemroses: PemrosesAntreanAi): Promise<number> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 0;
  const daftar = await jalankanTransaksi(TOKO.antreanAi, 'readonly', (toko) =>
    kueri.semuaLewatIndeks<AntreanAi>(toko(TOKO.antreanAi), 'status', 'menunggu'),
  );
  let selesai = 0;
  for (const antrean of daftar.sort((a, b) => a.waktu_dibuat.localeCompare(b.waktu_dibuat))) {
    const berjalan: AntreanAi = {
      ...antrean,
      status: 'jalan',
      percobaan: antrean.percobaan + 1,
    };
    await ubahStatus(berjalan);
    try {
      await pemroses(berjalan);
      await ubahStatus({ ...berjalan, status: 'selesai' });
      selesai += 1;
    } catch {
      await ubahStatus({ ...berjalan, status: 'gagal' });
    }
  }
  return selesai;
}

/** Menjalankan satu batch; panggilan serentak berbagi Promise yang sama. */
export async function jalankanAntreanAiTertunda(): Promise<number> {
  if (!pemrosesAktif) return 0;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 0;
  if (!sedangBerjalan) {
    sedangBerjalan = prosesMenunggu(pemrosesAktif).finally(() => {
      sedangBerjalan = null;
    });
  }
  return sedangBerjalan;
}

/**
 * Studio AI memasang pemroses nyata lewat fungsi ini. Antrean tidak pernah
 * dianggap selesai sebelum pemroses mengembalikan hasil tanpa galat.
 */
export function pasangPemrosesAntreanAi(pemroses: PemrosesAntreanAi | null): void {
  pemrosesAktif = pemroses;
  if (pemroses && (typeof navigator === 'undefined' || navigator.onLine)) {
    void jalankanAntreanAiTertunda();
  }
}

/** Memicu batch otomatis pada startup dan setiap jaringan tersambung kembali. */
export function mulaiSinkronisasiAntreanAi(): () => void {
  const saatOnline = () => void jalankanAntreanAiTertunda();
  const target = typeof window === 'undefined' ? globalThis : window;
  target.addEventListener?.('online', saatOnline);
  if (typeof navigator === 'undefined' || navigator.onLine) saatOnline();
  return () => target.removeEventListener?.('online', saatOnline);
}
