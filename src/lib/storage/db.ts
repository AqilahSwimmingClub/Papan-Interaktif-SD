import { AppError } from '../errors/AppError';

/**
 * Lapisan penyimpanan lokal offline-first.
 *
 * Migrasi Tahap 1 membuka Zona 6 (akun, sesi_login), satu baris `sekolah`
 * dari Zona 2, dan penanda tingkat perangkat. Tahap 2 menambahkan referensi
 * kurikulum sebagai migrasi baru tanpa membongkar penyimpanan autentikasi.
 */
export const NAMA_BASIS_DATA = 'papan-interaktif-sd';
export const VERSI_BASIS_DATA = 4;

export const TOKO = {
  akun: 'akun',
  sesiLogin: 'sesi_login',
  sekolah: 'sekolah',
  perangkat: 'perangkat',
  fase: 'fase',
  jenjangKelas: 'jenjang_kelas',
  mataPelajaran: 'mata_pelajaran',
  agama: 'agama',
  cabangSeni: 'cabang_seni',
  dokumenKurikulum: 'dokumen_kurikulum',
  cp: 'cp',
  elemen: 'elemen',
  tp: 'tp',
  konfigurasiKurikulumSekolah: 'konfigurasi_kurikulum_sekolah',
  guru: 'guru',
  tahunAjaran: 'tahun_ajaran',
  materi: 'materi',
  media: 'media',
  lkpd: 'lkpd',
  soal: 'soal',
  asesmen: 'asesmen',
  game: 'game',
  gameEngine: 'game_engine',
  tautanTp: 'tautan_tp',
  promptAi: 'prompt_ai',
  kelas: 'kelas',
  siswa: 'siswa',
  kelompok: 'kelompok',
  kehadiran: 'kehadiran',
  sesi: 'sesi',
  hasil: 'hasil',
  poinBadge: 'poin_badge',
  antreanAi: 'antrean_ai',
  cadangan: 'cadangan',
  indeksPencarian: 'indeks_pencarian',
  referensi: 'referensi',
  referensiBab: 'referensi_bab',
  pemetaanBabTp: 'pemetaan_bab_tp',
  referensiSekolah: 'referensi_sekolah',
} as const;

export type NamaToko = (typeof TOKO)[keyof typeof TOKO];

/** 38 tabel domain yang dikunci MASTER SPECIFICATION FINAL §4. */
export const TOKO_PER_ZONA = {
  kurikulumResmi: [
    TOKO.fase, TOKO.jenjangKelas, TOKO.mataPelajaran, TOKO.cabangSeni,
    TOKO.agama, TOKO.cp, TOKO.elemen, TOKO.dokumenKurikulum,
  ],
  konfigurasiSekolah: [
    TOKO.sekolah, TOKO.guru, TOKO.konfigurasiKurikulumSekolah, TOKO.tahunAjaran,
  ],
  isiPembelajaran: [
    TOKO.tp, TOKO.materi, TOKO.media, TOKO.lkpd, TOKO.soal, TOKO.asesmen,
    TOKO.game, TOKO.gameEngine, TOKO.tautanTp, TOKO.promptAi,
  ],
  kelasDanHasil: [
    TOKO.kelas, TOKO.siswa, TOKO.kelompok, TOKO.kehadiran, TOKO.sesi,
    TOKO.hasil, TOKO.poinBadge, TOKO.antreanAi, TOKO.cadangan, TOKO.indeksPencarian,
  ],
  referensiPembelajaran: [
    TOKO.referensi, TOKO.referensiBab, TOKO.pemetaanBabTp, TOKO.referensiSekolah,
  ],
  akunDanSesi: [TOKO.akun, TOKO.sesiLogin],
} as const satisfies Record<string, readonly NamaToko[]>;

type Migrasi = (db: IDBDatabase, transaksi: IDBTransaction) => void;

/** Migrasi bernomor. Versi n dijalankan saat oldVersion < n. */
const MIGRASI: Record<number, Migrasi> = {
  1: (db) => {
    const akun = db.createObjectStore(TOKO.akun, { keyPath: 'id' });
    akun.createIndex('username', 'username', { unique: true });
    akun.createIndex('peran', 'peran', { unique: false });

    const sesi = db.createObjectStore(TOKO.sesiLogin, { keyPath: 'token' });
    sesi.createIndex('akun_id', 'akun_id', { unique: false });

    db.createObjectStore(TOKO.sekolah, { keyPath: 'id' });
    db.createObjectStore(TOKO.perangkat, { keyPath: 'kunci' });
  },
  2: (db) => {
    db.createObjectStore(TOKO.fase, { keyPath: 'kode' });

    const jenjang = db.createObjectStore(TOKO.jenjangKelas, { keyPath: 'tingkat' });
    jenjang.createIndex('fase_kode', 'fase_kode', { unique: false });

    const mapel = db.createObjectStore(TOKO.mataPelajaran, { keyPath: 'kode' });
    mapel.createIndex('status', 'status', { unique: false });
    mapel.createIndex('agama_kode', 'agama_kode', { unique: false });

    db.createObjectStore(TOKO.agama, { keyPath: 'kode' });
    db.createObjectStore(TOKO.cabangSeni, { keyPath: 'kode' });
    db.createObjectStore(TOKO.dokumenKurikulum, { keyPath: 'kode' });

    const cp = db.createObjectStore(TOKO.cp, { keyPath: 'id' });
    cp.createIndex('mapel_kode', 'mapel_kode', { unique: false });
    cp.createIndex('fase_kode', 'fase_kode', { unique: false });
    cp.createIndex('mapel_fase', ['mapel_kode', 'fase_kode'], { unique: false });

    const elemen = db.createObjectStore(TOKO.elemen, { keyPath: 'id' });
    elemen.createIndex('cp_id', 'cp_id', { unique: false });

    const tp = db.createObjectStore(TOKO.tp, { keyPath: 'id' });
    tp.createIndex('elemen_id', 'elemen_id', { unique: false });
    tp.createIndex('tingkat_kelas', 'tingkat_kelas', { unique: false });
    tp.createIndex('sumber', 'sumber', { unique: false });
    tp.createIndex('elemen_kelas', ['elemen_id', 'tingkat_kelas'], { unique: false });

    const konfigurasi = db.createObjectStore(TOKO.konfigurasiKurikulumSekolah, {
      keyPath: 'id',
    });
    konfigurasi.createIndex('sekolah_id', 'sekolah_id', { unique: false });
    konfigurasi.createIndex('tingkat_kelas', 'tingkat_kelas', { unique: false });
  },
  3: (db) => {
    const guru = db.createObjectStore(TOKO.guru, { keyPath: 'id' });
    guru.createIndex('sekolah_id', 'sekolah_id', { unique: false });

    const tahun = db.createObjectStore(TOKO.tahunAjaran, { keyPath: 'id' });
    tahun.createIndex('aktif', 'aktif', { unique: false });

    const materi = db.createObjectStore(TOKO.materi, { keyPath: 'id' });
    materi.createIndex('tp_id', 'tp_id', { unique: false });
    materi.createIndex('judul', 'judul', { unique: false });

    const media = db.createObjectStore(TOKO.media, { keyPath: 'id' });
    media.createIndex('tp_id', 'tp_id', { unique: false });
    media.createIndex('jenis', 'jenis', { unique: false });

    const lkpd = db.createObjectStore(TOKO.lkpd, { keyPath: 'id' });
    lkpd.createIndex('tp_id', 'tp_id', { unique: false });

    const soal = db.createObjectStore(TOKO.soal, { keyPath: 'id' });
    soal.createIndex('tp_id', 'tp_id', { unique: false });

    const asesmen = db.createObjectStore(TOKO.asesmen, { keyPath: 'id' });
    asesmen.createIndex('tp_id', 'tp_id', { unique: false });

    const game = db.createObjectStore(TOKO.game, { keyPath: 'id' });
    game.createIndex('tp_id', 'tp_id', { unique: false });
    game.createIndex('engine_kode', 'engine_kode', { unique: false });

    db.createObjectStore(TOKO.gameEngine, { keyPath: 'kode' });

    const tautan = db.createObjectStore(TOKO.tautanTp, {
      keyPath: ['tp_id', 'jenis_isi', 'isi_id'],
    });
    tautan.createIndex('tp_id', 'tp_id', { unique: false });
    tautan.createIndex('isi', ['jenis_isi', 'isi_id'], { unique: false });

    db.createObjectStore(TOKO.promptAi, { keyPath: 'id' });

    const kelas = db.createObjectStore(TOKO.kelas, { keyPath: 'id' });
    kelas.createIndex('tingkat', 'tingkat', { unique: false });
    kelas.createIndex('fase_kode', 'fase_kode', { unique: false });
    kelas.createIndex('tahun_ajaran_id', 'tahun_ajaran_id', { unique: false });

    const siswa = db.createObjectStore(TOKO.siswa, { keyPath: 'id' });
    siswa.createIndex('kelas_id', 'kelas_id', { unique: false });
    siswa.createIndex('nama', 'nama', { unique: false });

    const kelompok = db.createObjectStore(TOKO.kelompok, { keyPath: 'id' });
    kelompok.createIndex('kelas_id', 'kelas_id', { unique: false });

    const kehadiran = db.createObjectStore(TOKO.kehadiran, {
      keyPath: ['siswa_id', 'tanggal'],
    });
    kehadiran.createIndex('tanggal', 'tanggal', { unique: false });

    const sesi = db.createObjectStore(TOKO.sesi, { keyPath: 'id' });
    sesi.createIndex('tp_id', 'tp_id', { unique: false });
    sesi.createIndex('kelas_id', 'kelas_id', { unique: false });
    sesi.createIndex('kode_gabung', 'kode_gabung', { unique: false });

    const hasil = db.createObjectStore(TOKO.hasil, { keyPath: 'id' });
    hasil.createIndex('siswa_id', 'siswa_id', { unique: false });
    hasil.createIndex('tp_id', 'tp_id', { unique: false });
    hasil.createIndex('sesi_id', 'sesi_id', { unique: false });

    db.createObjectStore(TOKO.poinBadge, { keyPath: 'siswa_id' });

    const antrean = db.createObjectStore(TOKO.antreanAi, { keyPath: 'id' });
    antrean.createIndex('status', 'status', { unique: false });

    const cadangan = db.createObjectStore(TOKO.cadangan, { keyPath: 'id' });
    cadangan.createIndex('waktu', 'waktu', { unique: false });

    const indeks = db.createObjectStore(TOKO.indeksPencarian, {
      keyPath: ['jenis_isi', 'isi_id'],
    });
    indeks.createIndex('tp_id', 'tp_id', { unique: false });
    indeks.createIndex('kelas', 'kelas', { unique: false });

    const referensi = db.createObjectStore(TOKO.referensi, { keyPath: 'id' });
    referensi.createIndex('mapel_kode', 'mapel_kode', { unique: false });
    referensi.createIndex('fase_kode', 'fase_kode', { unique: false });
    referensi.createIndex('status', 'status', { unique: false });

    const bab = db.createObjectStore(TOKO.referensiBab, { keyPath: 'id' });
    bab.createIndex('referensi_id', 'referensi_id', { unique: false });

    const pemetaan = db.createObjectStore(TOKO.pemetaanBabTp, {
      keyPath: ['referensi_bab_id', 'tp_id'],
    });
    pemetaan.createIndex('tp_id', 'tp_id', { unique: false });

    const referensiSekolah = db.createObjectStore(TOKO.referensiSekolah, {
      keyPath: ['sekolah_id', 'referensi_id', 'tingkat_kelas'],
    });
    referensiSekolah.createIndex('sekolah_id', 'sekolah_id', { unique: false });
  },
  4: (_db, transaksi) => {
    const cp = transaksi.objectStore(TOKO.cp);
    if (!cp.indexNames.contains('terverifikasi')) {
      cp.createIndex('terverifikasi', 'terverifikasi', { unique: false });
    }

    const game = transaksi.objectStore(TOKO.game);
    if (!game.indexNames.contains('mapel_kode')) {
      game.createIndex('mapel_kode', 'mapel_kode', { unique: false });
    }
    if (!game.indexNames.contains('cp_id')) {
      game.createIndex('cp_id', 'cp_id', { unique: false });
    }
    if (!game.indexNames.contains('fase_kode')) {
      game.createIndex('fase_kode', 'fase_kode', { unique: false });
    }
    if (!game.indexNames.contains('status_persetujuan')) {
      game.createIndex('status_persetujuan', 'status_persetujuan', { unique: false });
    }
  },
};

let koneksi: Promise<IDBDatabase> | null = null;

function indexedDbTersedia(): boolean {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

export function bukaBasisData(): Promise<IDBDatabase> {
  if (!indexedDbTersedia()) {
    return Promise.reject(
      new AppError(
        'PENYIMPANAN_TIDAK_TERSEDIA',
        'Penyimpanan lokal tidak tersedia di peramban ini. Aplikasi memerlukan IndexedDB agar dapat bekerja tanpa internet.',
      ),
    );
  }

  if (!koneksi) {
    koneksi = new Promise<IDBDatabase>((selesai, tolak) => {
      const permintaan = indexedDB.open(NAMA_BASIS_DATA, VERSI_BASIS_DATA);

      permintaan.onupgradeneeded = (peristiwa) => {
        const db = permintaan.result;
        const transaksi = permintaan.transaction;
        if (!transaksi) return;
        const versiLama = peristiwa.oldVersion;
        for (let versi = versiLama + 1; versi <= VERSI_BASIS_DATA; versi += 1) {
          MIGRASI[versi]?.(db, transaksi);
        }
      };

      permintaan.onsuccess = () => {
        const db = permintaan.result;
        db.onversionchange = () => {
          db.close();
          koneksi = null;
        };
        selesai(db);
      };

      permintaan.onerror = () =>
        tolak(
          new AppError('PENYIMPANAN_GAGAL', 'Basis data lokal gagal dibuka.', {
            detail: permintaan.error,
          }),
        );

      permintaan.onblocked = () =>
        tolak(
          new AppError(
            'PENYIMPANAN_GAGAL',
            'Basis data lokal terkunci oleh tab lain. Tutup tab aplikasi yang lain lalu muat ulang.',
          ),
        );
    }).catch((galat: unknown) => {
      koneksi = null;
      throw galat;
    });
  }

  return koneksi;
}

/** Menutup koneksi. Dipakai pengujian dan saat basis data diganti restore. */
export async function tutupBasisData(): Promise<void> {
  if (!koneksi) return;
  try {
    const db = await koneksi;
    db.close();
  } catch {
    /* koneksi memang gagal; tidak ada yang perlu ditutup */
  }
  koneksi = null;
}

function bungkus<T>(permintaan: IDBRequest<T>): Promise<T> {
  return new Promise<T>((selesai, tolak) => {
    permintaan.onsuccess = () => selesai(permintaan.result);
    permintaan.onerror = () =>
      tolak(
        new AppError('PENYIMPANAN_GAGAL', 'Operasi penyimpanan lokal gagal.', {
          detail: permintaan.error,
        }),
      );
  });
}

/** Menjalankan satu transaksi dan menunggu sampai benar-benar tersimpan. */
export async function jalankanTransaksi<T>(
  toko: NamaToko | NamaToko[],
  mode: IDBTransactionMode,
  kerja: (dapatkan: (nama: NamaToko) => IDBObjectStore) => Promise<T> | T,
): Promise<T> {
  const db = await bukaBasisData();
  const daftar = Array.isArray(toko) ? toko : [toko];
  const transaksi = db.transaction(daftar, mode);

  const selesaiTransaksi = new Promise<void>((selesai, tolak) => {
    transaksi.oncomplete = () => selesai();
    transaksi.onabort = () =>
      tolak(
        new AppError('PENYIMPANAN_GAGAL', 'Transaksi penyimpanan dibatalkan.', {
          detail: transaksi.error,
        }),
      );
    transaksi.onerror = () =>
      tolak(
        new AppError('PENYIMPANAN_GAGAL', 'Transaksi penyimpanan gagal.', {
          detail: transaksi.error,
        }),
      );
  });

  try {
    const hasil = await kerja((nama) => transaksi.objectStore(nama));
    if (mode !== 'readonly') await selesaiTransaksi;
    return hasil;
  } catch (galat) {
    try {
      transaksi.abort();
    } catch {
      /* transaksi mungkin sudah selesai atau sudah dibatalkan */
    }
    if (mode !== 'readonly') {
      try {
        await selesaiTransaksi;
      } catch {
        /* galat asli dari pekerjaan lebih berguna daripada galat abort */
      }
    }
    throw galat;
  }
}

export const kueri = {
  ambil: <T>(toko: IDBObjectStore, kunci: IDBValidKey) => bungkus<T | undefined>(toko.get(kunci)),
  ambilLewatIndeks: <T>(toko: IDBObjectStore, indeks: string, kunci: IDBValidKey) =>
    bungkus<T | undefined>(toko.index(indeks).get(kunci)),
  semua: <T>(toko: IDBObjectStore) => bungkus<T[]>(toko.getAll()),
  semuaLewatIndeks: <T>(toko: IDBObjectStore, indeks: string, kunci?: IDBValidKey) =>
    bungkus<T[]>(toko.index(indeks).getAll(kunci)),
  jumlah: (toko: IDBObjectStore) => bungkus<number>(toko.count()),
  simpan: <T>(toko: IDBObjectStore, nilai: T) => bungkus(toko.put(nilai as unknown as never)),
  hapus: (toko: IDBObjectStore, kunci: IDBValidKey) => bungkus(toko.delete(kunci)),
  kosongkan: (toko: IDBObjectStore) => bungkus(toko.clear()),
};
