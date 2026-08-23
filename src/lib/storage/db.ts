import { AppError } from '../errors/AppError';

/**
 * Lapisan penyimpanan lokal offline-first.
 *
 * Tahap 1 hanya membuka Zona 6 (akun, sesi_login), satu baris `sekolah`
 * dari Zona 2, dan penanda tingkat perangkat. Zona kurikulum, isi
 * pembelajaran, kelas, dan referensi menyusul pada tahap berikutnya —
 * ditambahkan sebagai migrasi baru, bukan dengan membongkar yang ini.
 */
export const NAMA_BASIS_DATA = 'papan-interaktif-sd';
export const VERSI_BASIS_DATA = 1;

export const TOKO = {
  akun: 'akun',
  sesiLogin: 'sesi_login',
  sekolah: 'sekolah',
  perangkat: 'perangkat',
} as const;

export type NamaToko = (typeof TOKO)[keyof typeof TOKO];

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

  const hasil = await kerja((nama) => transaksi.objectStore(nama));
  if (mode !== 'readonly') await selesaiTransaksi;
  return hasil;
}

export const kueri = {
  ambil: <T>(toko: IDBObjectStore, kunci: IDBValidKey) => bungkus<T | undefined>(toko.get(kunci)),
  ambilLewatIndeks: <T>(toko: IDBObjectStore, indeks: string, kunci: IDBValidKey) =>
    bungkus<T | undefined>(toko.index(indeks).get(kunci)),
  semua: <T>(toko: IDBObjectStore) => bungkus<T[]>(toko.getAll()),
  jumlah: (toko: IDBObjectStore) => bungkus<number>(toko.count()),
  simpan: <T>(toko: IDBObjectStore, nilai: T) => bungkus(toko.put(nilai as unknown as never)),
  hapus: (toko: IDBObjectStore, kunci: IDBValidKey) => bungkus(toko.delete(kunci)),
  kosongkan: (toko: IDBObjectStore) => bungkus(toko.clear()),
};
