import type { ReactElement, ReactNode } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../state/AuthProvider';
import { NAMA_BASIS_DATA, TOKO, jalankanTransaksi, kueri, tutupBasisData } from '../lib/storage/db';
import { lepaskanPenandaSeedKurikulum, pastikanKurikulumTersedia } from '../lib/storage/kurikulumRepo';
import { KUNCI_TOKEN } from '../lib/auth/authService';
import { KUNCI_OPENING } from '../lib/opening/pemutaranOpening';

/** Mengosongkan seluruh penyimpanan lokal agar tiap uji mulai dari nol. */
export async function resetPenyimpanan(): Promise<void> {
  // Tunggu seed yang mungkin masih berjalan dari uji sebelumnya. Tanpa ini,
  // penanda versi seed dapat ditulis ke basis data baru setelah penghapusan,
  // sehingga uji berikutnya melihat penanda ada tetapi tabelnya kosong.
  await pastikanKurikulumTersedia().catch(() => undefined);
  await tutupBasisData();
  await new Promise<void>((selesai) => {
    const permintaan = globalThis.indexedDB.deleteDatabase(NAMA_BASIS_DATA);
    permintaan.onsuccess = () => selesai();
    permintaan.onerror = () => selesai();
    permintaan.onblocked = () => selesai();
  });
  // Operasi tertunda dari uji sebelumnya dapat membuka ulang basis data tepat
  // sebelum penghapusan selesai. Tutup sekali lagi agar koneksi hantu itu tidak
  // ikut terbawa ke uji berikutnya.
  await tutupBasisData();
  lepaskanPenandaSeedKurikulum();
  globalThis.localStorage?.removeItem(KUNCI_TOKEN);
  globalThis.sessionStorage?.removeItem(KUNCI_OPENING);
}

interface OpsiRender {
  rute?: string;
}

export function renderDenganProvider(ui: ReactElement, opsi: OpsiRender = {}): RenderResult {
  const { rute = '/' } = opsi;
  return render(
    <MemoryRouter initialEntries={[rute]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

export function BungkusRute({ children, rute = '/' }: { children: ReactNode; rute?: string }) {
  return (
    <MemoryRouter initialEntries={[rute]}>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

/**
 * Menyemai satu rantai CP → elemen → TP langsung ke basis data.
 *
 * Seed bawaan tidak lagi memuat CP/TP; rantai ini hanya dipakai pengujian
 * modul yang tetap bekerja dengan TP (Studio AI, materi, pencarian) supaya
 * bentuknya menyerupai data yang kelak datang dari Buku Referensi.
 */
export async function semaiRantaiTpUji(): Promise<{
  cpId: string;
  elemenId: string;
  tpId: string;
}> {
  await pastikanKurikulumTersedia();
  const cpId = 'CP-UJI-MAT-A';
  const elemenId = 'ELM-UJI-MAT-A-01';
  const tpId = 'TP-UJI-MAT-1-1';

  await jalankanTransaksi([TOKO.cp, TOKO.elemen, TOKO.tp], 'readwrite', async (toko) => {
    await kueri.simpan(toko(TOKO.cp), {
      id: cpId,
      mapel_kode: 'MAT',
      fase_kode: 'A',
      cabang_kode: null,
      agama_kode: null,
      teks_capaian: 'Peserta didik mengenal bilangan cacah sampai 20 dan pecahan sederhana.',
      dokumen_kode: 'BUKU-UJI',
      halaman_lampiran: null,
      versi: 'uji',
      terverifikasi: true,
    });
    await kueri.simpan(toko(TOKO.elemen), {
      id: elemenId,
      cp_id: cpId,
      nama: 'Bilangan',
      teks_elemen: 'Mengenal lambang bilangan dan pecahan sederhana.',
      urutan: 1,
      kelompok: null,
      status: 'aktif',
    });
    await kueri.simpan(toko(TOKO.tp), {
      id: tpId,
      elemen_id: elemenId,
      tingkat_kelas: 1,
      kode_tampil: 'TP-UJI-1.1',
      teks_tujuan: 'Peserta didik menyebutkan bilangan cacah sampai 20 dan pecahan setengah.',
      sumber: 'sekolah',
      dibuat_oleh: null,
      semester: 1,
      status: 'aktif',
      halaman_lampiran: null,
    });
  });

  return { cpId, elemenId, tpId };
}
