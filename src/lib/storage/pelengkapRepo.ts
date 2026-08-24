import { AppError } from '../errors/AppError';
import type {
  Akun,
  AntreanAi,
  Cadangan,
  CapaianPembelajaran,
  ElemenKurikulum,
  Guru,
  IndeksPencarian,
  MataPelajaran,
  Materi,
  MediaPembelajaran,
  Sekolah,
  Siswa,
  TujuanPembelajaran,
} from '../types';
import { ID_SEKOLAH_TUNGGAL, sekolahKosong } from './sekolahRepo';
import { TOKO, jalankanTransaksi, kueri, type NamaToko } from './db';
import { pastikanKurikulumTersedia } from './kurikulumRepo';

export async function simpanProfilSekolahGuru(sekolah: Sekolah, guru: Guru): Promise<void> {
  const nama = sekolah.nama.trim();
  if (!nama) throw new AppError('VALIDASI', 'Nama sekolah wajib diisi.');
  if (!guru.nama.trim()) throw new AppError('VALIDASI', 'Nama guru wajib diisi.');
  await jalankanTransaksi([TOKO.sekolah, TOKO.guru], 'readwrite', async (toko) => {
    await kueri.simpan(toko(TOKO.sekolah), { ...sekolah, id: ID_SEKOLAH_TUNGGAL, nama });
    await kueri.simpan(toko(TOKO.guru), { ...guru, sekolah_id: ID_SEKOLAH_TUNGGAL, nama: guru.nama.trim() });
  });
}

export async function bacaGuru(id: string, akun?: Akun): Promise<Guru | undefined> {
  return jalankanTransaksi(TOKO.guru, akun ? 'readwrite' : 'readonly', async (toko) => {
    const tersimpan = await kueri.ambil<Guru>(toko(TOKO.guru), id);
    if (tersimpan || !akun) return tersimpan;
    const guru: Guru = {
      id,
      sekolah_id: ID_SEKOLAH_TUNGGAL,
      nama: akun.nama,
      peran: akun.peran === 'admin' ? 'operator' : 'guru',
      kelas_diampu: [],
      mapel_diampu: [],
    };
    await kueri.simpan(toko(TOKO.guru), guru);
    return guru;
  });
}

export async function simpanMedia(
  masukan: Omit<MediaPembelajaran, 'id'> & { id?: string },
): Promise<MediaPembelajaran> {
  if (!masukan.nama_berkas.trim()) throw new AppError('VALIDASI', 'Nama media wajib diisi.');
  const media: MediaPembelajaran = {
    ...masukan,
    id: masukan.id ?? `MEDIA-${crypto.randomUUID()}`,
    nama_berkas: masukan.nama_berkas.trim(),
  };
  await jalankanTransaksi([TOKO.media, TOKO.indeksPencarian], 'readwrite', async (toko) => {
    await kueri.simpan(toko(TOKO.media), media);
    const indeks: IndeksPencarian = {
      jenis_isi: 'media',
      isi_id: media.id,
      teks_terindeks: media.nama_berkas.toLowerCase(),
      tp_id: media.tp_id,
      kelas: null,
      diperbarui: new Date().toISOString(),
    };
    await kueri.simpan(toko(TOKO.indeksPencarian), indeks);
  });
  return media;
}

export async function daftarMedia(): Promise<MediaPembelajaran[]> {
  return jalankanTransaksi(TOKO.media, 'readonly', async (toko) => {
    const semua = await kueri.semua<MediaPembelajaran>(toko(TOKO.media));
    return semua.sort((a, b) => a.nama_berkas.localeCompare(b.nama_berkas, 'id'));
  });
}

export async function hapusMedia(id: string): Promise<void> {
  await jalankanTransaksi([TOKO.media, TOKO.indeksPencarian], 'readwrite', async (toko) => {
    await kueri.hapus(toko(TOKO.media), id);
    await kueri.hapus(toko(TOKO.indeksPencarian), ['media', id]);
  });
}

export interface HasilPencarian {
  jenis: 'kurikulum' | 'materi' | 'media' | 'siswa';
  id: string;
  judul: string;
  keterangan: string;
  tujuan: string;
}

export async function cariGlobal(kataMentah: string): Promise<HasilPencarian[]> {
  const kata = kataMentah.trim().toLocaleLowerCase('id');
  if (kata.length < 2) return [];
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [TOKO.cp, TOKO.elemen, TOKO.tp, TOKO.mataPelajaran, TOKO.materi, TOKO.media, TOKO.siswa],
    'readonly',
    async (toko) => {
      const [cp, elemen, tp, mapel, materi, media, siswa] = await Promise.all([
        kueri.semua<CapaianPembelajaran>(toko(TOKO.cp)),
        kueri.semua<ElemenKurikulum>(toko(TOKO.elemen)),
        kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)),
        kueri.semua<MataPelajaran>(toko(TOKO.mataPelajaran)),
        kueri.semua<Materi>(toko(TOKO.materi)),
        kueri.semua<MediaPembelajaran>(toko(TOKO.media)),
        kueri.semua<Siswa>(toko(TOKO.siswa)),
      ]);
      const petaElemen = new Map(elemen.map((baris) => [baris.id, baris]));
      const petaCp = new Map(cp.map((baris) => [baris.id, baris]));
      const petaMapel = new Map(mapel.map((baris) => [baris.kode, baris]));
      const hasil: HasilPencarian[] = [];

      for (const tujuan of tp) {
        if (!`${tujuan.kode_tampil} ${tujuan.teks_tujuan}`.toLocaleLowerCase('id').includes(kata)) continue;
        const capaian = petaCp.get(petaElemen.get(tujuan.elemen_id)?.cp_id ?? '');
        hasil.push({
          jenis: 'kurikulum',
          id: tujuan.id,
          judul: `${tujuan.kode_tampil} · ${tujuan.teks_tujuan}`,
          keterangan: `${petaMapel.get(capaian?.mapel_kode ?? '')?.nama ?? 'Kurikulum'} · Kelas ${tujuan.tingkat_kelas}`,
          tujuan: capaian ? `/kelas/${tujuan.tingkat_kelas}/mapel/${encodeURIComponent(capaian.mapel_kode)}` : '/kelas',
        });
      }
      for (const baris of materi) {
        const teks = `${baris.judul} ${baris.blok.map((blok) => blok.isi).join(' ')}`.toLocaleLowerCase('id');
        if (teks.includes(kata)) hasil.push({ jenis: 'materi', id: baris.id, judul: baris.judul, keterangan: baris.tp_id, tujuan: '/pembelajaran/materi' });
      }
      for (const baris of media) {
        if (baris.nama_berkas.toLocaleLowerCase('id').includes(kata)) hasil.push({ jenis: 'media', id: baris.id, judul: baris.nama_berkas, keterangan: `${baris.jenis} · ${baris.tersedia_offline ? 'offline' : 'belum diunduh'}`, tujuan: '/perpustakaan/media' });
      }
      for (const baris of siswa) {
        if (baris.nama.toLocaleLowerCase('id').includes(kata)) hasil.push({ jenis: 'siswa', id: baris.id, judul: baris.nama, keterangan: `Nomor absen ${baris.nomor_absen}`, tujuan: '/kelas/kelompok' });
      }
      const urutan = { kurikulum: 0, materi: 1, media: 2, siswa: 3 } as const;
      return hasil.sort((a, b) => urutan[a.jenis] - urutan[b.jenis] || a.judul.localeCompare(b.judul, 'id')).slice(0, 80);
    },
  );
}

export async function bacaStatusOffline(): Promise<{
  antreanAi: number;
  mediaByte: number;
  materi: number;
  game: number;
  lembarDanSoal: number;
  hasil: number;
  indeks: number;
}> {
  return jalankanTransaksi(
    [
      TOKO.antreanAi,
      TOKO.media,
      TOKO.materi,
      TOKO.game,
      TOKO.lkpd,
      TOKO.soal,
      TOKO.asesmen,
      TOKO.hasil,
      TOKO.indeksPencarian,
    ],
    'readonly',
    async (toko) => {
      const [antrean, media, materi, game, lkpd, soal, asesmen, hasil, indeks] = await Promise.all([
        kueri.semua<AntreanAi>(toko(TOKO.antreanAi)),
        kueri.semua<MediaPembelajaran>(toko(TOKO.media)),
        kueri.jumlah(toko(TOKO.materi)),
        kueri.jumlah(toko(TOKO.game)),
        kueri.jumlah(toko(TOKO.lkpd)),
        kueri.jumlah(toko(TOKO.soal)),
        kueri.jumlah(toko(TOKO.asesmen)),
        kueri.jumlah(toko(TOKO.hasil)),
        kueri.jumlah(toko(TOKO.indeksPencarian)),
      ]);
      return {
        antreanAi: antrean.filter((baris) => baris.status === 'menunggu').length,
        mediaByte: media.reduce((jumlah, baris) => jumlah + baris.ukuran_byte, 0),
        materi,
        game,
        lembarDanSoal: lkpd + soal + asesmen,
        hasil,
        indeks,
      };
    },
  );
}

const TOKO_CADANGAN: NamaToko[] = [
  TOKO.akun,
  TOKO.sekolah,
  TOKO.guru,
  TOKO.konfigurasiKurikulumSekolah,
  TOKO.tahunAjaran,
  TOKO.tp,
  TOKO.materi,
  TOKO.media,
  TOKO.lkpd,
  TOKO.soal,
  TOKO.asesmen,
  TOKO.game,
  TOKO.tautanTp,
  TOKO.promptAi,
  TOKO.kelas,
  TOKO.siswa,
  TOKO.kelompok,
  TOKO.kehadiran,
  TOKO.sesi,
  TOKO.hasil,
  TOKO.poinBadge,
  TOKO.antreanAi,
  TOKO.indeksPencarian,
  TOKO.referensiSekolah,
];

export interface PaketCadangan {
  format: 'papan-interaktif-sd-backup';
  versi: 1;
  waktu: string;
  nama_sekolah: string;
  data: Record<string, unknown[]>;
}

async function blobKeDataUrl(blob: Blob): Promise<string> {
  return new Promise((selesai, tolak) => {
    const pembaca = new FileReader();
    pembaca.onload = () => selesai(String(pembaca.result));
    pembaca.onerror = () => tolak(pembaca.error);
    pembaca.readAsDataURL(blob);
  });
}

async function dataCadangan(): Promise<{ namaSekolah: string; data: Record<string, unknown[]> }> {
  const data = await jalankanTransaksi(TOKO_CADANGAN, 'readonly', async (toko) => {
    const data: Record<string, unknown[]> = {};
    for (const nama of TOKO_CADANGAN) {
      let baris = await kueri.semua<Record<string, unknown>>(toko(nama));
      if (nama === TOKO.tp) baris = baris.filter((nilai) => nilai.sumber === 'sekolah');
      data[nama] = baris;
    }
    return data;
  });
  data[TOKO.media] = await Promise.all(
    (data[TOKO.media] ?? []).map(async (nilaiMentah) => {
      const nilai = nilaiMentah as Record<string, unknown>;
      return {
        ...nilai,
        data_berkas:
          nilai.data_berkas instanceof Blob ? await blobKeDataUrl(nilai.data_berkas) : null,
      };
    }),
  );
  const sekolah = (data[TOKO.sekolah]?.[0] as Sekolah | undefined) ?? sekolahKosong();
  return { namaSekolah: sekolah.nama, data };
}

export async function buatCadangan(otomatis = false): Promise<PaketCadangan> {
  const { namaSekolah, data } = await dataCadangan();
  const paket: PaketCadangan = {
    format: 'papan-interaktif-sd-backup',
    versi: 1,
    waktu: new Date().toISOString(),
    nama_sekolah: namaSekolah,
    data,
  };
  const ukuran = new Blob([JSON.stringify(paket)]).size;
  const meta: Cadangan = {
    id: `CADANGAN-${crypto.randomUUID()}`,
    waktu: paket.waktu,
    ukuran_byte: ukuran,
    tujuan: 'berkas',
    cakupan: Object.keys(data),
    otomatis,
  };
  await jalankanTransaksi(TOKO.cadangan, 'readwrite', (toko) =>
    kueri.simpan(toko(TOKO.cadangan), otomatis ? { ...meta, paket } : meta),
  );
  return paket;
}

export const JEDA_CADANGAN_HARIAN_MS = 24 * 60 * 60 * 1000;
let cadanganHarianBerjalan: Promise<boolean> | null = null;

/**
 * Membuat cadangan lokal paling banyak sekali dalam 24 jam. Paket lengkapnya
 * disimpan di IndexedDB; cadangan manual tetap diunduh sebagai berkas.
 */
async function jalankanCadanganHarian(sekarang: number): Promise<boolean> {
  const riwayat = await daftarCadangan();
  const terakhir = riwayat.find((baris) => baris.otomatis && baris.paket);
  if (terakhir && sekarang - new Date(terakhir.waktu).getTime() < JEDA_CADANGAN_HARIAN_MS) {
    return false;
  }
  await buatCadangan(true);
  return true;
}

export function pastikanCadanganHarian(sekarang = Date.now()): Promise<boolean> {
  if (!cadanganHarianBerjalan) {
    cadanganHarianBerjalan = jalankanCadanganHarian(sekarang).finally(() => {
      cadanganHarianBerjalan = null;
    });
  }
  return cadanganHarianBerjalan;
}

function dataUrlKeBlob(dataUrl: string): Blob {
  const [header, isi = ''] = dataUrl.split(',');
  const tipe = /data:([^;]+)/.exec(header ?? '')?.[1] ?? 'application/octet-stream';
  const biner = atob(isi);
  const byte = Uint8Array.from(biner, (karakter) => karakter.charCodeAt(0));
  return new Blob([byte], { type: tipe });
}

export async function pulihkanCadangan(
  paket: PaketCadangan,
  konfirmasiNamaSekolah: string,
): Promise<void> {
  if (paket.format !== 'papan-interaktif-sd-backup' || paket.versi !== 1) {
    throw new AppError('VALIDASI', 'Format berkas cadangan tidak dikenali.');
  }
  if (!paket.nama_sekolah || paket.nama_sekolah !== konfirmasiNamaSekolah.trim()) {
    throw new AppError('VALIDASI', 'Nama sekolah tidak sama dengan isi cadangan.');
  }
  const sebelum = await dataCadangan();
  const metadataSebelum: Cadangan = {
    id: `CADANGAN-PRA-RESTORE-${crypto.randomUUID()}`,
    waktu: new Date().toISOString(),
    ukuran_byte: new Blob([JSON.stringify(sebelum)]).size,
    tujuan: 'berkas',
    cakupan: Object.keys(sebelum.data),
    otomatis: true,
  };

  await jalankanTransaksi([...TOKO_CADANGAN, TOKO.cadangan], 'readwrite', async (toko) => {
    for (const nama of TOKO_CADANGAN) {
      const tpRekomendasi =
        nama === TOKO.tp
          ? (await kueri.semua<TujuanPembelajaran>(toko(TOKO.tp))).filter(
              (baris) => baris.sumber === 'rekomendasi',
            )
          : [];
      await kueri.kosongkan(toko(nama));
      for (const tujuan of tpRekomendasi) await kueri.simpan(toko(TOKO.tp), tujuan);
      const baris = paket.data[nama] ?? [];
      for (const nilaiMentah of baris) {
        let nilai = nilaiMentah as Record<string, unknown>;
        if (nama === TOKO.media && typeof nilai.data_berkas === 'string') {
          nilai = { ...nilai, data_berkas: dataUrlKeBlob(nilai.data_berkas) };
        }
        await kueri.simpan(toko(nama), nilai);
      }
    }
    await kueri.simpan(toko(TOKO.cadangan), {
      ...metadataSebelum,
      paket: {
        format: 'papan-interaktif-sd-backup',
        versi: 1,
        waktu: metadataSebelum.waktu,
        nama_sekolah: sebelum.namaSekolah,
        data: sebelum.data,
      },
    });
  });
}

export async function daftarCadangan(): Promise<Cadangan[]> {
  return jalankanTransaksi(TOKO.cadangan, 'readonly', async (toko) => {
    const semua = await kueri.semua<Cadangan>(toko(TOKO.cadangan));
    return semua.sort((a, b) => b.waktu.localeCompare(a.waktu));
  });
}
