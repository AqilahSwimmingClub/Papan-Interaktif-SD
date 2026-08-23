import { AppError } from '../errors/AppError';
import type {
  HalamanPapan,
  HasilBelajar,
  Kelas,
  Kelompok,
  SesiPembelajaran,
  Siswa,
  TahunAjaran,
  TujuanPembelajaran,
} from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';

function faseUntukTingkat(tingkat: number): 'A' | 'B' | 'C' {
  if (tingkat <= 2) return 'A';
  if (tingkat <= 4) return 'B';
  return 'C';
}

function tahunAjaranSekarang(): TahunAjaran {
  const sekarang = new Date();
  const tahunAwal = sekarang.getMonth() >= 6 ? sekarang.getFullYear() : sekarang.getFullYear() - 1;
  return {
    id: `TA-${tahunAwal}-${tahunAwal + 1}`,
    label: `${tahunAwal}/${tahunAwal + 1}`,
    semester_aktif: sekarang.getMonth() >= 6 ? 1 : 2,
    tanggal_mulai: `${tahunAwal}-07-01`,
    tanggal_selesai: `${tahunAwal + 1}-06-30`,
    aktif: true,
  };
}

export async function pastikanKelasKerja(tingkat: number, guruId: string): Promise<Kelas> {
  if (!Number.isInteger(tingkat) || tingkat < 1 || tingkat > 6) {
    throw new AppError('VALIDASI', 'Tingkat kelas harus berada pada rentang 1–6.');
  }
  const tahun = tahunAjaranSekarang();
  const id = `KELAS-${tingkat}-A-${tahun.id}`;
  return jalankanTransaksi([TOKO.tahunAjaran, TOKO.kelas], 'readwrite', async (toko) => {
    const tersimpan = await kueri.ambil<Kelas>(toko(TOKO.kelas), id);
    if (tersimpan) return tersimpan;
    await kueri.simpan(toko(TOKO.tahunAjaran), tahun);
    const kelas: Kelas = {
      id,
      tingkat,
      fase_kode: faseUntukTingkat(tingkat),
      tahun_ajaran_id: tahun.id,
      rombel: 'A',
      wali_guru_id: guruId,
      jumlah_siswa: 0,
    };
    await kueri.simpan(toko(TOKO.kelas), kelas);
    return kelas;
  });
}

export async function daftarSiswaKelas(kelasId: string): Promise<Siswa[]> {
  return jalankanTransaksi(TOKO.siswa, 'readonly', async (toko) => {
    const siswa = await kueri.semuaLewatIndeks<Siswa>(toko(TOKO.siswa), 'kelas_id', kelasId);
    return siswa.sort((a, b) => a.nomor_absen - b.nomor_absen);
  });
}

export async function tambahSiswa(kelasId: string, namaMentah: string): Promise<Siswa> {
  const nama = namaMentah.trim();
  if (nama.length < 2 || nama.length > 80) {
    throw new AppError('VALIDASI', 'Nama siswa wajib 2–80 karakter.');
  }
  return jalankanTransaksi([TOKO.kelas, TOKO.siswa, TOKO.indeksPencarian], 'readwrite', async (toko) => {
    const kelas = await kueri.ambil<Kelas>(toko(TOKO.kelas), kelasId);
    if (!kelas) throw new AppError('VALIDASI', 'Kelas kerja tidak ditemukan.');
    const semua = await kueri.semuaLewatIndeks<Siswa>(toko(TOKO.siswa), 'kelas_id', kelasId);
    if (semua.some((baris) => baris.nama.localeCompare(nama, 'id', { sensitivity: 'base' }) === 0)) {
      throw new AppError('VALIDASI', 'Nama siswa sudah ada pada kelas ini.');
    }
    const siswa: Siswa = {
      id: `SISWA-${crypto.randomUUID()}`,
      kelas_id: kelasId,
      nama,
      nomor_absen: Math.max(0, ...semua.map((baris) => baris.nomor_absen)) + 1,
      kelompok_id: null,
      catatan_guru: '',
      perlu_pendampingan: false,
    };
    await kueri.simpan(toko(TOKO.siswa), siswa);
    await kueri.simpan(toko(TOKO.kelas), { ...kelas, jumlah_siswa: semua.length + 1 });
    await kueri.simpan(toko(TOKO.indeksPencarian), {
      jenis_isi: 'siswa',
      isi_id: siswa.id,
      teks_terindeks: nama.toLowerCase(),
      tp_id: null,
      kelas: kelas.tingkat,
      diperbarui: new Date().toISOString(),
    });
    return siswa;
  });
}

const NAMA_KELOMPOK = ['Melati', 'Kenanga', 'Anggrek', 'Mawar', 'Cempaka', 'Dahlia', 'Teratai'];

export async function buatKelompokOtomatis(
  kelasId: string,
  ukuran: number,
  semester: 1 | 2 = 1,
): Promise<Kelompok[]> {
  if (!Number.isInteger(ukuran) || ukuran < 2 || ukuran > 8) {
    throw new AppError('VALIDASI', 'Ukuran kelompok harus 2–8 siswa.');
  }
  return jalankanTransaksi([TOKO.siswa, TOKO.kelompok], 'readwrite', async (toko) => {
    const siswa = (
      await kueri.semuaLewatIndeks<Siswa>(toko(TOKO.siswa), 'kelas_id', kelasId)
    ).sort((a, b) => a.nomor_absen - b.nomor_absen);
    if (!siswa.length) throw new AppError('VALIDASI', 'Tambahkan siswa sebelum membuat kelompok.');
    const lama = await kueri.semuaLewatIndeks<Kelompok>(toko(TOKO.kelompok), 'kelas_id', kelasId);
    await Promise.all(lama.map((baris) => kueri.hapus(toko(TOKO.kelompok), baris.id)));

    const jumlah = Math.ceil(siswa.length / ukuran);
    const kelompok = Array.from({ length: jumlah }, (_, indeks): Kelompok => ({
      id: `KELOMPOK-${kelasId}-${indeks + 1}`,
      kelas_id: kelasId,
      nama: NAMA_KELOMPOK[indeks] ?? `Kelompok ${indeks + 1}`,
      semester,
      poin_total: lama.find((baris) => baris.id === `KELOMPOK-${kelasId}-${indeks + 1}`)?.poin_total ?? 0,
    }));
    await Promise.all(kelompok.map((baris) => kueri.simpan(toko(TOKO.kelompok), baris)));
    await Promise.all(
      siswa.map((baris, indeks) =>
        kueri.simpan(toko(TOKO.siswa), {
          ...baris,
          kelompok_id: kelompok[indeks % jumlah]?.id ?? null,
        }),
      ),
    );
    return kelompok;
  });
}

export async function daftarKelompokKelas(
  kelasId: string,
): Promise<Array<Kelompok & { anggota: Siswa[] }>> {
  return jalankanTransaksi([TOKO.kelompok, TOKO.siswa], 'readonly', async (toko) => {
    const [kelompok, siswa] = await Promise.all([
      kueri.semuaLewatIndeks<Kelompok>(toko(TOKO.kelompok), 'kelas_id', kelasId),
      kueri.semuaLewatIndeks<Siswa>(toko(TOKO.siswa), 'kelas_id', kelasId),
    ]);
    return kelompok
      .sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
      .map((baris) => ({
        ...baris,
        anggota: siswa
          .filter((anak) => anak.kelompok_id === baris.id)
          .sort((a, b) => a.nomor_absen - b.nomor_absen),
      }));
  });
}

export interface BarisRekap {
  siswa: Siswa;
  statusPerTp: Record<string, HasilBelajar['ketuntasan'] | 'belum_ada_data'>;
  jumlahTuntas: number;
}

export async function bacaRekapKelas(
  kelasId: string,
  tingkat: number,
  tpTerpilih: string[] = [],
): Promise<{ tp: TujuanPembelajaran[]; baris: BarisRekap[] }> {
  return jalankanTransaksi([TOKO.siswa, TOKO.tp, TOKO.hasil], 'readonly', async (toko) => {
    const [siswa, semuaTp, hasil] = await Promise.all([
      kueri.semuaLewatIndeks<Siswa>(toko(TOKO.siswa), 'kelas_id', kelasId),
      kueri.semuaLewatIndeks<TujuanPembelajaran>(toko(TOKO.tp), 'tingkat_kelas', tingkat),
      kueri.semua<HasilBelajar>(toko(TOKO.hasil)),
    ]);
    const pilihan = semuaTp
      .filter((baris) => baris.status === 'aktif' && (!tpTerpilih.length || tpTerpilih.includes(baris.id)))
      .sort((a, b) => a.kode_tampil.localeCompare(b.kode_tampil, 'id', { numeric: true }))
      .slice(0, 6);
    return {
      tp: pilihan,
      baris: siswa.map((anak) => {
        const statusPerTp: BarisRekap['statusPerTp'] = {};
        for (const tujuan of pilihan) {
          const nilai = hasil
            .filter((baris) => baris.siswa_id === anak.id && baris.tp_id === tujuan.id)
            .sort((a, b) => b.waktu.localeCompare(a.waktu))[0];
          statusPerTp[tujuan.id] = nilai?.ketuntasan ?? 'belum_ada_data';
        }
        return {
          siswa: anak,
          statusPerTp,
          jumlahTuntas: Object.values(statusPerTp).filter((status) => status === 'tuntas').length,
        };
      }),
    };
  });
}

export interface MasukanSesiPapan {
  id?: string;
  tp_id: string;
  kelas_id: string;
  guru_id: string;
  kode_gabung?: string;
  waktu_mulai?: string;
  halaman_papan: HalamanPapan[];
  skor_kelompok: Array<{ kelompok_id: string; skor: number }>;
}

export async function simpanSesiPapan(masukan: MasukanSesiPapan): Promise<SesiPembelajaran> {
  if (!masukan.tp_id) throw new AppError('VALIDASI', 'Pilih TP sebelum menyimpan sesi papan.');
  return jalankanTransaksi([TOKO.sesi, TOKO.tp, TOKO.kelas], 'readwrite', async (toko) => {
    const [tp, kelas] = await Promise.all([
      kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), masukan.tp_id),
      kueri.ambil<Kelas>(toko(TOKO.kelas), masukan.kelas_id),
    ]);
    if (!tp || !kelas) throw new AppError('VALIDASI', 'TP atau kelas sesi tidak ditemukan.');
    if (tp.tingkat_kelas !== kelas.tingkat) {
      throw new AppError('VALIDASI', 'TP dan kelas sesi harus berada pada tingkat yang sama.');
    }
    let kodeGabung = masukan.kode_gabung?.trim();
    if (kodeGabung && !/^\d{4}$/.test(kodeGabung)) {
      throw new AppError('VALIDASI', 'Kode gabung sesi wajib terdiri dari empat angka.');
    }
    for (let percobaan = 0; !kodeGabung && percobaan < 30; percobaan += 1) {
      const kandidat = String(Math.floor(1000 + Math.random() * 9000));
      const terpakai = await kueri.ambilLewatIndeks<SesiPembelajaran>(
        toko(TOKO.sesi),
        'kode_gabung',
        kandidat,
      );
      if (!terpakai || terpakai.id === masukan.id) kodeGabung = kandidat;
    }
    if (!kodeGabung) throw new AppError('PENYIMPANAN_GAGAL', 'Kode gabung unik tidak dapat dibuat.');
    const pemilikKode = await kueri.ambilLewatIndeks<SesiPembelajaran>(
      toko(TOKO.sesi),
      'kode_gabung',
      kodeGabung,
    );
    if (pemilikKode && pemilikKode.id !== masukan.id) {
      throw new AppError('VALIDASI', 'Kode gabung sesi sudah digunakan.');
    }
    const sesi: SesiPembelajaran = {
      id: masukan.id ?? `SESI-${crypto.randomUUID()}`,
      tp_id: masukan.tp_id,
      kelas_id: masukan.kelas_id,
      guru_id: masukan.guru_id,
      kode_gabung: kodeGabung,
      waktu_mulai: masukan.waktu_mulai ?? new Date().toISOString(),
      waktu_selesai: null,
      halaman_papan: masukan.halaman_papan,
      skor_kelompok: masukan.skor_kelompok,
    };
    await kueri.simpan(toko(TOKO.sesi), sesi);
    return sesi;
  });
}

export async function sesiLewatKode(kode: string): Promise<SesiPembelajaran | undefined> {
  return jalankanTransaksi(TOKO.sesi, 'readonly', (toko) =>
    kueri.ambilLewatIndeks<SesiPembelajaran>(toko(TOKO.sesi), 'kode_gabung', kode),
  );
}
