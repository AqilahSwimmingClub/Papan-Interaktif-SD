import masterJson from '../../../uploads/PAPAN_INTERAKTIF_SD_MASTER_DATA_KURIKULUM.json';
import agama020Json from '../../../uploads/PAPAN_INTERAKTIF_SD_UPDATE_SEMUA_PADB_020_2026_FINAL.json';
import paketImporJson from '../../../uploads/Papan_Interaktif_SD_Data_Kurikulum_Import_v1/kurikulum_sd_import.json';
import type {
  Agama,
  CabangSeni,
  CapaianPembelajaran,
  DokumenKurikulum,
  ElemenKurikulum,
  Fase,
  JenjangKelas,
  KodeFase,
  MataPelajaran,
  ReferensiPembelajaran,
  StatusMataPelajaran,
  TujuanPembelajaran,
} from '../types';

interface MasterMapel {
  kode: string;
  nama: string;
  fase: KodeFase[];
  kelas: number[];
  status: StatusMataPelajaran;
  bercabang: boolean;
  agama_kode?: string;
  dasar_hukum?: string;
}

interface MasterCp {
  id: string;
  mapel_kode: string;
  fase_kode: KodeFase;
  cabang_kode: string;
  agama_kode: string;
  teks_capaian: string;
  dokumen_kode: string;
  halaman_lampiran: number | null;
}

interface MasterElemen {
  id: string;
  cp_id: string;
  nama: string;
  teks_elemen: string;
  urutan: number;
}

interface MasterTp {
  kode_tampil: string;
  elemen_id: string;
  tingkat_kelas: number;
  teks_tujuan: string;
  semester: 1 | 2;
  halaman_lampiran: number | null;
}

type MasterDokumen = DokumenKurikulum;

interface MasterData {
  dokumen: MasterDokumen[];
  mata_pelajaran: MasterMapel[];
  cp: MasterCp[];
  elemen: MasterElemen[];
  tp_rekomendasi: MasterTp[];
}

interface SubjekAgama020 {
  code: string;
  name: string;
  elements: string[] | Record<string, string[]>;
  source_pages: number[];
  cp: Record<KodeFase, Record<string, string | number[]>>;
}

interface DataAgama020 {
  source: { title: string; status: string };
  subjects: SubjekAgama020[];
}

interface ReferensiImpor {
  id: string;
  jenis: ReferensiPembelajaran['jenis'];
  judul: string;
  mapel_kode: string;
  kelas: string;
  fase: string;
  penerbit: string;
  tahun: string;
  versi: string;
  isbn: string;
  url: string;
  lingkup_izin: string;
}

interface PaketImpor {
  referensi: ReferensiImpor[];
}

const master = masterJson as unknown as MasterData;
const agama020 = agama020Json as unknown as DataAgama020;
const paketImpor = paketImporJson as unknown as PaketImpor;

export const VERSI_SEED_KURIKULUM = '2025.1+2026.1|47-221-212|ref-7';

const FASE: Fase[] = [
  {
    kode: 'A',
    nama: 'Fase A',
    kelas_awal: 1,
    kelas_akhir: 2,
    warna_penanda: '#FDF0D6',
    profil_game: 'visual, teks sedikit, satu langkah',
  },
  {
    kode: 'B',
    nama: 'Fase B',
    kelas_awal: 3,
    kelas_akhir: 4,
    warna_penanda: '#DFF0E7',
    profil_game: 'konsep, prosedur, dan pemecahan masalah bertahap',
  },
  {
    kode: 'C',
    nama: 'Fase C',
    kelas_awal: 5,
    kelas_akhir: 6,
    warna_penanda: '#ECE0F4',
    profil_game: 'analisis, strategi, dan penerapan lintas konteks',
  },
];

function faseUntukKelas(tingkat: number): KodeFase {
  if (tingkat <= 2) return 'A';
  if (tingkat <= 4) return 'B';
  return 'C';
}

const JENJANG: JenjangKelas[] = Array.from({ length: 6 }, (_, indeks) => {
  const tingkat = indeks + 1;
  return { tingkat, fase_kode: faseUntukKelas(tingkat), nama: `Kelas ${tingkat}` };
});

const MAPEL: MataPelajaran[] = master.mata_pelajaran.map((baris) => ({
  kode: baris.kode,
  nama: baris.nama,
  fase_tersedia: baris.fase,
  kelas_tersedia: baris.kelas,
  status: baris.status,
  punya_cabang: baris.bercabang,
  agama_kode: baris.agama_kode ?? null,
  dasar_hukum:
    baris.dasar_hukum ??
    (baris.kode === 'KKA' ? 'Permendikdasmen Nomor 13 Tahun 2025' : ''),
}));

const AGAMA: Agama[] = MAPEL.filter((mapel) => mapel.agama_kode).map((mapel) => ({
  kode: mapel.agama_kode ?? '',
  nama: mapel.nama
    .replace('Pendidikan Agama ', '')
    .replace(' dan Budi Pekerti', ''),
  mapel_kode: mapel.kode,
  aktif_di_sekolah: false,
}));

const CABANG_SENI: CabangSeni[] = MAPEL.filter((mapel) =>
  mapel.status.startsWith('pilihan_cabang_seni'),
).map((mapel) => ({
  kode: mapel.kode,
  nama: mapel.nama,
  bawaan: mapel.status === 'pilihan_cabang_seni_default',
}));

const DOKUMEN: DokumenKurikulum[] = master.dokumen.map((dokumen) =>
  dokumen.kode === '020/2026'
    ? {
        ...dokumen,
        judul: agama020.source.title,
        tanggal: '2026-06-23',
        versi: '2026.1',
        status_verifikasi: agama020.source.status,
      }
    : dokumen,
);

const versiDokumen = new Map(DOKUMEN.map((dokumen) => [dokumen.kode, dokumen.versi]));

const CP_NON_AGAMA: CapaianPembelajaran[] = master.cp.map((baris) => ({
  id: baris.id,
  mapel_kode: baris.mapel_kode,
  fase_kode: baris.fase_kode,
  cabang_kode: baris.cabang_kode || null,
  agama_kode: baris.agama_kode || null,
  teks_capaian: baris.teks_capaian,
  dokumen_kode: baris.dokumen_kode,
  halaman_lampiran: baris.halaman_lampiran,
  versi: versiDokumen.get(baris.dokumen_kode) ?? '2025.1',
  terverifikasi: false,
}));

const ELEMEN_NON_AGAMA: ElemenKurikulum[] = master.elemen.map((baris) => ({
  ...baris,
  kelompok: null,
  status: 'aktif',
}));

interface DefinisiElemenAgama {
  nama: string;
  kelompok: string | null;
}

function daftarElemenAgama(subjek: SubjekAgama020): DefinisiElemenAgama[] {
  if (Array.isArray(subjek.elements)) {
    return subjek.elements.map((nama) => ({ nama, kelompok: null }));
  }

  return Object.entries(subjek.elements).flatMap(([kelompok, subElemen]) =>
    subElemen.map((nama) => ({ nama, kelompok })),
  );
}

const CP_AGAMA: CapaianPembelajaran[] = [];
const ELEMEN_AGAMA: ElemenKurikulum[] = [];

for (const subjek of agama020.subjects) {
  const mapel = MAPEL.find((baris) => baris.nama === subjek.name);
  if (!mapel?.agama_kode) {
    throw new Error(`Mapel agama final tidak terpetakan: ${subjek.name}`);
  }

  const definisiElemen = daftarElemenAgama(subjek);
  (['A', 'B', 'C'] as const).forEach((faseKode, indeksFase) => {
    const dataFase = subjek.cp[faseKode];
    const cpId = `CP-${mapel.kode}-${faseKode}-020-2026`;
    const elemenFase = definisiElemen.map((elemen, indeksElemen) => {
      const teks = String(dataFase[elemen.nama] ?? '');
      return {
        id: `ELM-${mapel.kode}-${faseKode}-${String(indeksElemen + 1).padStart(2, '0')}-020-2026`,
        cp_id: cpId,
        nama: elemen.nama,
        teks_elemen: teks === '-' ? '' : teks,
        urutan: indeksElemen + 1,
        kelompok: elemen.kelompok,
        status: teks === '-' ? ('tidak_berlaku' as const) : ('aktif' as const),
      };
    });

    const ringkasanFase = dataFase.phase_summary;
    const teksCapaian =
      typeof ringkasanFase === 'string'
        ? ringkasanFase
        : elemenFase
            .filter((elemen) => elemen.status === 'aktif')
            .map((elemen) => elemen.teks_elemen)
            .join(' ');

    CP_AGAMA.push({
      id: cpId,
      mapel_kode: mapel.kode,
      fase_kode: faseKode,
      cabang_kode: null,
      agama_kode: mapel.agama_kode,
      teks_capaian: teksCapaian,
      dokumen_kode: '020/2026',
      halaman_lampiran: subjek.source_pages[indeksFase] ?? null,
      versi: '2026.1',
      terverifikasi: false,
    });
    ELEMEN_AGAMA.push(...elemenFase);
  });
}

const TP_REKOMENDASI: TujuanPembelajaran[] = master.tp_rekomendasi.map((baris) => ({
  id: baris.kode_tampil,
  elemen_id: baris.elemen_id,
  tingkat_kelas: baris.tingkat_kelas,
  kode_tampil: baris.kode_tampil,
  teks_tujuan: baris.teks_tujuan,
  sumber: 'rekomendasi',
  dibuat_oleh: null,
  semester: baris.semester,
  status: 'aktif',
  halaman_lampiran: baris.halaman_lampiran,
}));

function rentangKelas(teks: string): number[] {
  const [awal, akhir] = teks.split('-').map(Number);
  if (!Number.isInteger(awal)) return [];
  if (!Number.isInteger(akhir)) return [awal];
  return Array.from({ length: akhir - awal + 1 }, (_, indeks) => awal + indeks);
}

const REFERENSI: ReferensiPembelajaran[] = paketImpor.referensi.map((baris) => ({
  id: baris.id,
  jenis: baris.jenis,
  judul: baris.judul,
  mapel_kode: baris.mapel_kode || null,
  fase_kode: /^[ABC]$/.test(baris.fase) ? (baris.fase as KodeFase) : null,
  kelas_relevan: rentangKelas(baris.kelas),
  penerbit: baris.penerbit,
  tahun: baris.tahun,
  versi: baris.versi,
  url_sumber: baris.url,
  isbn: baris.isbn,
  status: 'aktif',
  tanggal_diperbarui: '2026-08-23',
  lingkup_izin:
    baris.lingkup_izin === 'isi_boleh_disimpan' ? 'isi_boleh_disimpan' : 'metadata_saja',
  ditambahkan_oleh: null,
}));

export const DATA_KURIKULUM_FINAL = {
  fase: FASE,
  jenjangKelas: JENJANG,
  mataPelajaran: MAPEL,
  agama: AGAMA,
  cabangSeni: CABANG_SENI,
  dokumenKurikulum: DOKUMEN,
  cp: [...CP_NON_AGAMA, ...CP_AGAMA],
  elemen: [...ELEMEN_NON_AGAMA, ...ELEMEN_AGAMA],
  tp: TP_REKOMENDASI,
  referensi: REFERENSI,
} as const;
