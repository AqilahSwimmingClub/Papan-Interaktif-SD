import { AppError } from './errors/AppError';
import type {
  BlokMateri,
  CapaianPembelajaran,
  DokumenKurikulum,
  ElemenKurikulum,
  KodeFase,
  Materi,
  MataPelajaran,
  PemetaanBabTp,
  ReferensiBab,
  ReferensiPembelajaran,
  TujuanPembelajaran,
} from './types';
import { TOKO, jalankanTransaksi, kueri, type NamaToko } from './storage/db';
import { pastikanKurikulumTersedia } from './storage/kurikulumRepo';

export type BagianImpor =
  | 'dokumen' | 'mata_pelajaran' | 'cp' | 'elemen' | 'tp_rekomendasi'
  | 'referensi' | 'referensi_bab' | 'materi' | 'pemetaan_bab_tp';

export interface BerkasImporTeks { nama: string; isi: string }
export interface BarisPratinjauImpor {
  id: string;
  bagian: BagianImpor;
  nomor: number;
  kunci: string;
  status: 'diterima' | 'ditolak';
  masalah: string[];
  peringatan: string[];
  terverifikasi: boolean;
  data: Record<string, unknown>;
}
export interface PratinjauImpor {
  versi: string;
  baris: BarisPratinjauImpor[];
  jumlahDiterima: number;
  jumlahDitolak: number;
  sumber: string[];
}
export interface HasilImpor {
  jumlahTersimpan: number;
  jumlahDitolak: number;
  versiBaru: string;
}

const BAGIAN: readonly BagianImpor[] = [
  'dokumen', 'mata_pelajaran', 'cp', 'elemen', 'tp_rekomendasi',
  'referensi', 'referensi_bab', 'materi', 'pemetaan_bab_tp',
];

const KUNCI_BAGIAN: Record<BagianImpor, string[]> = {
  dokumen: ['kode'], mata_pelajaran: ['kode'], cp: ['id'], elemen: ['id'],
  tp_rekomendasi: ['kode_tampil'], referensi: ['id'], referensi_bab: ['id'],
  materi: ['id'], pemetaan_bab_tp: ['referensi_bab_id', 'tp_kode'],
};

function nilaiTeks(nilai: unknown): string { return typeof nilai === 'string' ? nilai.trim() : nilai == null ? '' : String(nilai).trim(); }
function nilaiNomor(nilai: unknown): number | null { const hasil = Number(nilai); return Number.isFinite(hasil) ? hasil : null; }
function fase(nilai: unknown): KodeFase[] {
  if (Array.isArray(nilai)) return nilai.filter((x): x is KodeFase => x === 'A' || x === 'B' || x === 'C');
  const teks = nilaiTeks(nilai).toUpperCase();
  if (teks === 'A-C') return ['A', 'B', 'C']; if (teks === 'B-C') return ['B', 'C'];
  return teks.split(/[;,|\s]+/).filter((x): x is KodeFase => x === 'A' || x === 'B' || x === 'C');
}
function kelas(nilai: unknown): number[] {
  if (Array.isArray(nilai)) return nilai.map(Number).filter((x) => Number.isInteger(x) && x >= 1 && x <= 6);
  const teks = nilaiTeks(nilai); const rentang = /^(\d)\s*-\s*(\d)$/.exec(teks);
  if (rentang) return Array.from({ length: Number(rentang[2]) - Number(rentang[1]) + 1 }, (_, i) => Number(rentang[1]) + i);
  return teks.split(/[;,|\s]+/).map(Number).filter((x) => Number.isInteger(x) && x >= 1 && x <= 6);
}

/** Parser CSV RFC-4180 yang mempertahankan koma, kutip ganda, dan baris baru dalam sel. */
export function parseCsv(teks: string): Record<string, string>[] {
  const baris: string[][] = []; let sel = ''; let larik: string[] = []; let kutip = false;
  const sumber = teks.replace(/^\uFEFF/, '');
  for (let i = 0; i < sumber.length; i += 1) {
    const karakter = sumber[i]!;
    if (karakter === '"') {
      if (kutip && sumber[i + 1] === '"') { sel += '"'; i += 1; } else kutip = !kutip;
    } else if (karakter === ',' && !kutip) { larik.push(sel); sel = ''; }
    else if ((karakter === '\n' || karakter === '\r') && !kutip) {
      if (karakter === '\r' && sumber[i + 1] === '\n') i += 1;
      larik.push(sel); if (larik.some((x) => x.length)) baris.push(larik); larik = []; sel = '';
    } else sel += karakter;
  }
  larik.push(sel); if (larik.some((x) => x.length)) baris.push(larik);
  const kepala = baris.shift()?.map((x) => x.trim()) ?? [];
  return baris.map((nilai) => Object.fromEntries(kepala.map((kolom, indeks) => [kolom, nilai[indeks] ?? ''])));
}

function tebakBagian(nama: string, data: Record<string, unknown>[]): BagianImpor | null {
  const kecil = nama.toLowerCase();
  const lewatNama: Array<[RegExp, BagianImpor]> = [
    [/01.*dokumen|dokumen/, 'dokumen'], [/02.*mata|mata[_ -]?pelajaran|mapel/, 'mata_pelajaran'],
    [/03.*cp|capaian/, 'cp'], [/04.*elemen|elemen/, 'elemen'], [/05.*tp|tp[_ -]?rekomendasi/, 'tp_rekomendasi'],
    [/06.*referensi(?!.*bab)|referensi\.csv/, 'referensi'], [/07.*bab|referensi[_ -]?bab/, 'referensi_bab'],
    [/08.*materi|materi/, 'materi'], [/09.*pemetaan|pemetaan/, 'pemetaan_bab_tp'],
  ];
  for (const [pola, bagian] of lewatNama) if (pola.test(kecil)) return bagian;
  const kunci = new Set(Object.keys(data[0] ?? {}));
  if (kunci.has('teks_capaian')) return 'cp'; if (kunci.has('teks_elemen')) return 'elemen';
  if (kunci.has('teks_tujuan')) return 'tp_rekomendasi'; if (kunci.has('blok_isi')) return 'materi';
  if (kunci.has('referensi_bab_id') && kunci.has('tp_kode')) return 'pemetaan_bab_tp';
  if (kunci.has('referensi_id') && kunci.has('judul_bab')) return 'referensi_bab';
  if (kunci.has('lingkup_izin')) return 'referensi'; if (kunci.has('status_verifikasi')) return 'dokumen';
  if (kunci.has('fase') && kunci.has('kelas')) return 'mata_pelajaran';
  return null;
}

function bacaBerkas(berkas: BerkasImporTeks): { versi: string; bagian: Partial<Record<BagianImpor, Record<string, unknown>[]>> } {
  if (berkas.nama.toLowerCase().endsWith('.json')) {
    let nilai: unknown;
    try { nilai = JSON.parse(berkas.isi); } catch { throw new AppError('VALIDASI', `${berkas.nama}: JSON tidak valid.`); }
    if (Array.isArray(nilai)) {
      const daftar = nilai as Record<string, unknown>[]; const jenis = tebakBagian(berkas.nama, daftar);
      if (!jenis) throw new AppError('VALIDASI', `${berkas.nama}: jenis tabel tidak dapat dikenali.`);
      return { versi: '1.0', bagian: { [jenis]: daftar } };
    }
    if (!nilai || typeof nilai !== 'object') throw new AppError('VALIDASI', `${berkas.nama}: akar JSON harus objek atau array.`);
    const objek = nilai as Record<string, unknown>; const bagian: Partial<Record<BagianImpor, Record<string, unknown>[]>> = {};
    for (const jenis of BAGIAN) if (Array.isArray(objek[jenis])) bagian[jenis] = objek[jenis] as Record<string, unknown>[];
    return { versi: nilaiTeks(objek.versi_impor) || '1.0', bagian };
  }
  const daftar = parseCsv(berkas.isi); const jenis = tebakBagian(berkas.nama, daftar);
  if (!jenis) throw new AppError('VALIDASI', `${berkas.nama}: header CSV tidak sesuai kontrak.`);
  return { versi: '1.0', bagian: { [jenis]: daftar } };
}

interface DataAda {
  mapel: Set<string>; dokumen: Set<string>; cp: Set<string>; elemen: Set<string>;
  tpId: Set<string>; tpKode: Map<string, string>; referensi: Set<string>; bab: Set<string>;
}

async function dataAda(): Promise<DataAda> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [TOKO.mataPelajaran, TOKO.dokumenKurikulum, TOKO.cp, TOKO.elemen, TOKO.tp, TOKO.referensi, TOKO.referensiBab],
    'readonly', async (toko) => {
      const [mapel, dokumen, cp, elemen, tp, referensi, bab] = await Promise.all([
        kueri.semua<MataPelajaran>(toko(TOKO.mataPelajaran)), kueri.semua<DokumenKurikulum>(toko(TOKO.dokumenKurikulum)),
        kueri.semua<CapaianPembelajaran>(toko(TOKO.cp)), kueri.semua<ElemenKurikulum>(toko(TOKO.elemen)),
        kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)), kueri.semua<ReferensiPembelajaran>(toko(TOKO.referensi)),
        kueri.semua<ReferensiBab>(toko(TOKO.referensiBab)),
      ]);
      return {
        mapel: new Set(mapel.map((x) => x.kode)), dokumen: new Set(dokumen.map((x) => x.kode)), cp: new Set(cp.map((x) => x.id)),
        elemen: new Set(elemen.map((x) => x.id)), tpId: new Set(tp.map((x) => x.id)), tpKode: new Map(tp.map((x) => [x.kode_tampil, x.id])),
        referensi: new Set(referensi.map((x) => x.id)), bab: new Set(bab.map((x) => x.id)),
      };
    },
  );
}

function kunciBaris(bagian: BagianImpor, data: Record<string, unknown>): string {
  return KUNCI_BAGIAN[bagian].map((kunci) => nilaiTeks(data[kunci])).join('|');
}

export async function buatPratinjauImpor(berkas: BerkasImporTeks[]): Promise<PratinjauImpor> {
  if (!berkas.length) throw new AppError('VALIDASI', 'Pilih sedikitnya satu berkas JSON atau CSV.');
  const gabungan: Partial<Record<BagianImpor, Record<string, unknown>[]>> = {}; let versi = '1.0';
  for (const item of berkas) {
    const dibaca = bacaBerkas(item); versi = dibaca.versi || versi;
    for (const bagian of BAGIAN) gabungan[bagian] = [...(gabungan[bagian] ?? []), ...(dibaca.bagian[bagian] ?? [])];
  }
  const ada = await dataAda();
  // Hanya baris yang lolos lebih dulu boleh menjadi induk bagi tabel sesudahnya.
  // Dengan demikian, baris anak tidak dapat lolos hanya karena induk yang rusak
  // kebetulan tercantum pada paket yang sama.
  const masuk = {
    mapel: new Set<string>(), dokumen: new Set<string>(), cp: new Set<string>(),
    elemen: new Set<string>(), tp: new Set<string>(), referensi: new Set<string>(), bab: new Set<string>(),
  };
  const baris: BarisPratinjauImpor[] = [];
  for (const bagian of BAGIAN) {
    const terlihat = new Set<string>();
    for (const [indeks, dataAwal] of (gabungan[bagian] ?? []).entries()) {
      const data = { ...dataAwal }; const masalah: string[] = []; const peringatan: string[] = [];
      const kunci = kunciBaris(bagian, data);
      if (!kunci || kunci.split('|').some((x) => !x)) masalah.push('Kunci utama wajib diisi.');
      if (terlihat.has(kunci)) masalah.push('Duplikat dalam berkas; hanya baris pertama diterima.'); else terlihat.add(kunci);
      if (bagian === 'cp') {
        const mapel = nilaiTeks(data.mapel_kode); const faseKode = nilaiTeks(data.fase_kode); const dokumen = nilaiTeks(data.dokumen_kode);
        if (!dokumen) masalah.push('CP tanpa dokumen_kode ditolak.');
        else if (!ada.dokumen.has(dokumen) && !masuk.dokumen.has(dokumen)) masalah.push('dokumen_kode tidak ditemukan.');
        if (!nilaiTeks(data.teks_capaian)) masalah.push('teks_capaian kosong.');
        if (!ada.mapel.has(mapel) && !masuk.mapel.has(mapel)) masalah.push('mapel_kode tidak dikenal.');
        if (mapel === 'KKA' && faseKode !== 'C') masalah.push('KKA hanya tersedia pada Fase C.');
        if (mapel === 'IPAS' && faseKode === 'A') masalah.push('IPAS tidak tersedia pada Fase A.');
        if (!['A', 'B', 'C'].includes(faseKode)) masalah.push('fase_kode harus A, B, atau C.');
        if (ada.cp.has(kunci)) peringatan.push('ID CP sudah ada; impor membuat ID versi baru dan tidak menimpa versi lama.');
      }
      if (bagian === 'elemen') {
        const cpId = nilaiTeks(data.cp_id); if (!ada.cp.has(cpId) && !masuk.cp.has(cpId)) masalah.push('cp_id tidak ditemukan.');
        if (!nilaiTeks(data.nama)) masalah.push('Nama elemen wajib diisi.');
      }
      if (bagian === 'tp_rekomendasi') {
        const elemenId = nilaiTeks(data.elemen_id); const kode = nilaiTeks(data.kode_tampil);
        if (!ada.elemen.has(elemenId) && !masuk.elemen.has(elemenId)) masalah.push('elemen_id tidak ditemukan.');
        if (/^S-/i.test(kode)) masalah.push('TP Rekomendasi tidak boleh memakai kode S-.');
        if (!nilaiTeks(data.teks_tujuan)) masalah.push('teks_tujuan kosong.');
        const tingkat = nilaiNomor(data.tingkat_kelas); if (!tingkat || tingkat < 1 || tingkat > 6) masalah.push('tingkat_kelas harus 1–6.');
      }
      if (bagian === 'referensi') {
        const mapel = nilaiTeks(data.mapel_kode); if (mapel && !ada.mapel.has(mapel) && !masuk.mapel.has(mapel)) masalah.push('mapel referensi tidak ditemukan.');
      }
      if (bagian === 'referensi_bab') {
        const ref = nilaiTeks(data.referensi_id); if (!ada.referensi.has(ref) && !masuk.referensi.has(ref)) masalah.push('referensi_id tidak ditemukan.');
        if ('isi_penuh' in data && nilaiTeks(data.isi_penuh)) { delete data.isi_penuh; peringatan.push('Isi penuh buku dibuang; hanya metadata bab dipertahankan.'); }
      }
      if (bagian === 'materi') {
        const tpKode = nilaiTeks(data.tp_kode); if (!ada.tpKode.has(tpKode) && !masuk.tp.has(tpKode)) masalah.push('tp_kode tidak ditemukan.');
      }
      if (bagian === 'pemetaan_bab_tp') {
        const babId = nilaiTeks(data.referensi_bab_id); const tpKode = nilaiTeks(data.tp_kode);
        if (!ada.bab.has(babId) && !masuk.bab.has(babId)) masalah.push('referensi_bab_id tidak ditemukan.');
        if (!ada.tpKode.has(tpKode) && !masuk.tp.has(tpKode)) masalah.push('TP tidak dikenal; hanya baris pemetaan ini ditolak.');
      }
      if (bagian === 'dokumen' && ada.dokumen.has(kunci)) peringatan.push('Dokumen sudah ada; impor membuat versi baru dan mengarsipkan versi lama.');
      const status = masalah.length ? 'ditolak' : 'diterima';
      if (status === 'diterima') {
        if (bagian === 'mata_pelajaran') masuk.mapel.add(kunci);
        else if (bagian === 'dokumen') masuk.dokumen.add(kunci);
        else if (bagian === 'cp') masuk.cp.add(kunci);
        else if (bagian === 'elemen') masuk.elemen.add(kunci);
        else if (bagian === 'tp_rekomendasi') masuk.tp.add(kunci);
        else if (bagian === 'referensi') masuk.referensi.add(kunci);
        else if (bagian === 'referensi_bab') masuk.bab.add(kunci);
      }
      baris.push({ id: `${bagian}:${indeks + 1}`, bagian, nomor: indeks + 1, kunci, status, masalah, peringatan, terverifikasi: false, data });
    }
  }
  return { versi, baris, jumlahDiterima: baris.filter((x) => x.status === 'diterima').length, jumlahDitolak: baris.filter((x) => x.status === 'ditolak').length, sumber: berkas.map((x) => x.nama) };
}

function blokMateri(nilai: unknown, id: string): BlokMateri[] {
  if (Array.isArray(nilai)) return nilai as BlokMateri[];
  const teks = nilaiTeks(nilai); if (!teks) return [];
  try { const parsed = JSON.parse(teks) as unknown; if (Array.isArray(parsed)) return parsed as BlokMateri[]; } catch { /* teks biasa tetap sah */ }
  return [{ id: `BLOK-${id}-1`, jenis: 'teks', isi: teks, urutan: 1 }];
}

/** Semua penulisan berlangsung dalam satu transaksi; kegagalan satu put membatalkan semuanya. */
export async function imporPratinjauKurikulum(pratinjau: PratinjauImpor): Promise<HasilImpor> {
  const diterima = pratinjau.baris.filter((x) => x.status === 'diterima');
  if (!diterima.length) throw new AppError('VALIDASI', 'Tidak ada baris valid untuk diimpor.');
  const tokoImpor: NamaToko[] = [TOKO.dokumenKurikulum, TOKO.mataPelajaran, TOKO.cp, TOKO.elemen, TOKO.tp, TOKO.referensi, TOKO.referensiBab, TOKO.materi, TOKO.pemetaanBabTp, TOKO.tautanTp];
  const versiBaru = `${pratinjau.versi}-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`;
  await jalankanTransaksi(tokoImpor, 'readwrite', async (toko) => {
    const petaDok = new Map<string, string>(); const petaCp = new Map<string, string>(); const petaElemen = new Map<string, string>();
    const petaTp = new Map<string, string>(); const petaRef = new Map<string, string>(); const petaBab = new Map<string, string>();
    for (const item of diterima.filter((x) => x.bagian === 'dokumen')) {
      const d = item.data; const asli = nilaiTeks(d.kode); const lama = await kueri.ambil<DokumenKurikulum>(toko(TOKO.dokumenKurikulum), asli);
      const kode = lama ? `${asli}@${versiBaru}` : asli; petaDok.set(asli, kode);
      if (lama) await kueri.simpan(toko(TOKO.dokumenKurikulum), { ...lama, status_verifikasi: `${lama.status_verifikasi}|arsip` });
      await kueri.simpan(toko(TOKO.dokumenKurikulum), { kode, judul: nilaiTeks(d.judul), tanggal: nilaiTeks(d.tanggal) || null, versi: nilaiTeks(d.versi) || versiBaru, url_sumber: nilaiTeks(d.url_sumber), jumlah_halaman: nilaiNomor(d.jumlah_halaman), status_verifikasi: item.terverifikasi ? 'diverifikasi-operator' : 'belum-diverifikasi' } satisfies DokumenKurikulum);
    }
    for (const item of diterima.filter((x) => x.bagian === 'mata_pelajaran')) {
      const d = item.data; const kode = nilaiTeks(d.kode); const lama = await kueri.ambil<MataPelajaran>(toko(TOKO.mataPelajaran), kode);
      await kueri.simpan(toko(TOKO.mataPelajaran), lama ?? { kode, nama: nilaiTeks(d.nama), fase_tersedia: fase(d.fase), kelas_tersedia: kelas(d.kelas), status: nilaiTeks(d.status) as MataPelajaran['status'], punya_cabang: d.bercabang === true || nilaiTeks(d.bercabang) === 'true', agama_kode: nilaiTeks(d.agama_kode) || null, dasar_hukum: nilaiTeks(d.dasar_hukum) });
    }
    for (const item of diterima.filter((x) => x.bagian === 'cp')) {
      const d = item.data; const asli = nilaiTeks(d.id); const ada = await kueri.ambil<CapaianPembelajaran>(toko(TOKO.cp), asli); const id = ada ? `${asli}@${versiBaru}` : asli; petaCp.set(asli, id);
      await kueri.simpan(toko(TOKO.cp), { id, mapel_kode: nilaiTeks(d.mapel_kode), fase_kode: nilaiTeks(d.fase_kode) as KodeFase, cabang_kode: nilaiTeks(d.cabang_kode) || null, agama_kode: nilaiTeks(d.agama_kode) || null, teks_capaian: nilaiTeks(d.teks_capaian), dokumen_kode: petaDok.get(nilaiTeks(d.dokumen_kode)) ?? nilaiTeks(d.dokumen_kode), halaman_lampiran: nilaiNomor(d.halaman_lampiran), versi: versiBaru, terverifikasi: item.terverifikasi } satisfies CapaianPembelajaran);
    }
    for (const item of diterima.filter((x) => x.bagian === 'elemen')) {
      const d = item.data; const asli = nilaiTeks(d.id); const ada = await kueri.ambil<ElemenKurikulum>(toko(TOKO.elemen), asli); const id = ada ? `${asli}@${versiBaru}` : asli; petaElemen.set(asli, id);
      await kueri.simpan(toko(TOKO.elemen), { id, cp_id: petaCp.get(nilaiTeks(d.cp_id)) ?? nilaiTeks(d.cp_id), nama: nilaiTeks(d.nama), teks_elemen: nilaiTeks(d.teks_elemen), urutan: nilaiNomor(d.urutan) ?? 0, kelompok: nilaiTeks(d.kelompok) || null, status: 'aktif' } satisfies ElemenKurikulum);
    }
    for (const item of diterima.filter((x) => x.bagian === 'tp_rekomendasi')) {
      const d = item.data; const kode = nilaiTeks(d.kode_tampil); const ada = await kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), kode); const id = ada ? `${kode}@${versiBaru}` : kode; petaTp.set(kode, id);
      await kueri.simpan(toko(TOKO.tp), { id, elemen_id: petaElemen.get(nilaiTeks(d.elemen_id)) ?? nilaiTeks(d.elemen_id), tingkat_kelas: nilaiNomor(d.tingkat_kelas)!, kode_tampil: kode, teks_tujuan: nilaiTeks(d.teks_tujuan), sumber: 'rekomendasi', dibuat_oleh: null, semester: (nilaiNomor(d.semester) ?? 'keduanya') as TujuanPembelajaran['semester'], status: 'aktif', halaman_lampiran: nilaiNomor(d.halaman_lampiran) } satisfies TujuanPembelajaran);
    }
    for (const item of diterima.filter((x) => x.bagian === 'referensi')) {
      const d = item.data; const asli = nilaiTeks(d.id); const ada = await kueri.ambil<ReferensiPembelajaran>(toko(TOKO.referensi), asli); const id = ada ? `${asli}@${versiBaru}` : asli; petaRef.set(asli, id);
      await kueri.simpan(toko(TOKO.referensi), { id, jenis: nilaiTeks(d.jenis) as ReferensiPembelajaran['jenis'], judul: nilaiTeks(d.judul), mapel_kode: nilaiTeks(d.mapel_kode) || null, fase_kode: fase(d.fase)[0] ?? null, kelas_relevan: kelas(d.kelas), penerbit: nilaiTeks(d.penerbit), tahun: nilaiTeks(d.tahun), versi: nilaiTeks(d.versi), url_sumber: nilaiTeks(d.url ?? d.url_sumber), isbn: nilaiTeks(d.isbn), status: 'aktif', tanggal_diperbarui: new Date().toISOString(), lingkup_izin: nilaiTeks(d.lingkup_izin) === 'isi_boleh_disimpan' ? 'isi_boleh_disimpan' : 'metadata_saja', ditambahkan_oleh: null } satisfies ReferensiPembelajaran);
    }
    for (const item of diterima.filter((x) => x.bagian === 'referensi_bab')) {
      const d = item.data; const asli = nilaiTeks(d.id); const ada = await kueri.ambil<ReferensiBab>(toko(TOKO.referensiBab), asli); const id = ada ? `${asli}@${versiBaru}` : asli; petaBab.set(asli, id);
      await kueri.simpan(toko(TOKO.referensiBab), { id, referensi_id: petaRef.get(nilaiTeks(d.referensi_id)) ?? nilaiTeks(d.referensi_id), nomor_tampil: nilaiTeks(d.nomor_tampil), judul_bab: nilaiTeks(d.judul_bab), halaman_awal: nilaiNomor(d.halaman_awal), urutan: nilaiNomor(d.urutan) ?? 0, ruang_lingkup: nilaiTeks(d.ringkasan_ruang_lingkup ?? d.ruang_lingkup).slice(0, 500) } satisfies ReferensiBab);
    }
    for (const item of diterima.filter((x) => x.bagian === 'materi')) {
      const d = item.data; const id = nilaiTeks(d.id); const tpId = petaTp.get(nilaiTeks(d.tp_kode)) ?? nilaiTeks(d.tp_kode); const blok = blokMateri(d.blok_isi, id);
      await kueri.simpan(toko(TOKO.materi), { id, tp_id: tpId, judul: nilaiTeks(d.judul), blok, perkiraan_menit: nilaiNomor(d.perkiraan_menit) ?? 0, sumber: nilaiTeks(d.sumber) === 'guru' || nilaiTeks(d.sumber) === 'ai' ? nilaiTeks(d.sumber) as 'guru' | 'ai' : 'bawaan', diperbarui: new Date().toISOString(), referensi_bab_id: null } satisfies Materi);
      await kueri.simpan(toko(TOKO.tautanTp), { tp_id: tpId, jenis_isi: 'materi', isi_id: id, peran: 'utama', dibuat_oleh_ai: nilaiTeks(d.sumber) === 'ai' });
    }
    for (const item of diterima.filter((x) => x.bagian === 'pemetaan_bab_tp')) {
      const d = item.data; const tpId = petaTp.get(nilaiTeks(d.tp_kode)) ?? nilaiTeks(d.tp_kode);
      await kueri.simpan(toko(TOKO.pemetaanBabTp), { referensi_bab_id: petaBab.get(nilaiTeks(d.referensi_bab_id)) ?? nilaiTeks(d.referensi_bab_id), tp_id: tpId, kesesuaian: (nilaiTeks(d.kesesuaian) || 'sebagian') as PemetaanBabTp['kesesuaian'], dipetakan_oleh: 'impor', catatan: nilaiTeks(d.catatan) } satisfies PemetaanBabTp);
    }
  });
  return { jumlahTersimpan: diterima.length, jumlahDitolak: pratinjau.jumlahDitolak, versiBaru };
}

export function ubahVerifikasiBaris(pratinjau: PratinjauImpor, id: string, terverifikasi: boolean): PratinjauImpor {
  return { ...pratinjau, baris: pratinjau.baris.map((x) => x.id === id && x.status === 'diterima' ? { ...x, terverifikasi } : x) };
}
