import type { PromptAi } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';

export async function simpanPromptAi(prompt: PromptAi): Promise<void> {
  if (!prompt.teks_guru_utuh.trim()) throw new Error('Prompt guru wajib diisi.');
  await jalankanTransaksi(TOKO.promptAi, 'readwrite', (toko) => kueri.simpan(toko(TOKO.promptAi), prompt));
}

export async function bacaPromptAi(id: string): Promise<PromptAi | undefined> {
  return jalankanTransaksi(TOKO.promptAi, 'readonly', (toko) => kueri.ambil<PromptAi>(toko(TOKO.promptAi), id));
}

export async function daftarPromptAi(): Promise<PromptAi[]> {
  return jalankanTransaksi(TOKO.promptAi, 'readonly', async (toko) => {
    const semua = await kueri.semua<PromptAi>(toko(TOKO.promptAi));
    return semua.sort((a, b) => b.waktu.localeCompare(a.waktu));
  });
}
