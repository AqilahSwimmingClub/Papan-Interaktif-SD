import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../test/bantuan';
import { buatTemplateSiswa, validasiBarisSiswa } from './studentImport';
import { bacaExcelGuru } from './guruImport';
import { buatKelompokOtomatis, daftarKelompokKelas, daftarSiswaKelas, imporSiswaKelas, pastikanKelasKerja } from './storage/kelasRepo';
import { daftarHasilKelas, simpanPenilaian } from './storage/penilaianRepo';
import { bacaDetailMapelKelas } from './storage/kurikulumRepo';
import * as XLSX from 'xlsx';
import { aturUlangSandiGuru, buatAdminPertama, buatAkunGuru } from './auth/authService';

describe('restruktur data Guru, siswa, kelompok, dan penilaian', () => {
  beforeEach(async () => resetPenyimpanan());

  it('menerima siswa dengan kolom pendamping kosong dan menolak hanya identitas utama yang tidak valid', async () => {
    const hasil = validasiBarisSiswa([
      { Nama: 'Alya' },
      { Nama: '', NIS: '', NISN: '', JK: '', Agama: '', Alamat: '' },
    ]);
    expect(hasil[0]).toMatchObject({ valid: true, nama: 'Alya', nis: '', nisn: '', jk: '', agama: '' });
    expect(hasil[1]?.valid).toBe(false);
    expect((await buatTemplateSiswa()).byteLength).toBeGreaterThan(1000);
  });

  it('memisahkan kelas dan siswa Guru A dari Guru B', async () => {
    const kelasA = await pastikanKelasKerja(4, 'guru-a');
    const kelasB = await pastikanKelasKerja(4, 'guru-b');
    expect(kelasA.id).not.toBe(kelasB.id);
    await imporSiswaKelas(kelasA.id, [{ nama: 'Siswa Guru A' }]);
    await imporSiswaKelas(kelasB.id, [{ nama: 'Siswa Guru B' }]);
    expect((await daftarSiswaKelas(kelasA.id)).map((item) => item.nama)).toEqual(['Siswa Guru A']);
    expect((await daftarSiswaKelas(kelasB.id)).map((item) => item.nama)).toEqual(['Siswa Guru B']);
  });

  it('reset password Guru tidak menghapus siswa atau data kelas miliknya', async () => {
    const admin = await buatAdminPertama({ nama: 'Admin Sekolah', username: 'admin.sekolah', password: 'password-awal', konfirmasi: 'password-awal' });
    const guru = await buatAkunGuru(admin, { nama: 'Guru A', username: 'guru.a', password: 'password-guru', konfirmasi: 'password-guru' });
    const kelas = await pastikanKelasKerja(2, guru.id);
    await imporSiswaKelas(kelas.id, [{ nama: 'Data Tetap Ada' }]);
    await aturUlangSandiGuru(admin, guru.id, 'password-baru');
    expect((await daftarSiswaKelas(kelas.id)).map((item) => item.nama)).toEqual(['Data Tetap Ada']);
  });

  it('menyinkronkan penilaian kelompok ke setiap anggota dan poin kelompok', async () => {
    const detail = await bacaDetailMapelKelas(1, 'MAT');
    const tp = detail!.elemen.flatMap((item) => item.tpRekomendasi)[0]!;
    const kelas = await pastikanKelasKerja(1, 'guru-a');
    await imporSiswaKelas(kelas.id, [{ nama: 'Alya' }, { nama: 'Bima' }]);
    const grup = (await buatKelompokOtomatis(kelas.id, 2, 1, 'game_battle'))[0]!;
    const hasil = await simpanPenilaian({ kelasId: kelas.id, tpId: tp.id, dinilaiOleh: 'guru-a', jenis: 'battle', kelompokId: grup.id, skor: 80, skorMaksimal: 100, tanggal: '2026-08-24' });
    expect(hasil).toHaveLength(2);
    expect(hasil.every((item) => item.kelompok_id === grup.id && item.ketuntasan === 'tuntas')).toBe(true);
    expect(await daftarHasilKelas(kelas.id)).toHaveLength(2);
    expect((await daftarKelompokKelas(kelas.id))[0]?.poin_total).toBe(80);
  });

  it('membaca template Guru minimal dengan pratinjau kelas dan mapel', async () => {
    const lembar = XLSX.utils.json_to_sheet([{ Nama: 'Guru A', Username: 'guru.a', Kelas: '1,2', Peran: 'guru', Mapel: 'MAT,BI' }]);
    const buku = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(buku, lembar, 'Guru');
    const data = XLSX.write(buku, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    expect((await bacaExcelGuru(data))[0]).toMatchObject({ valid: true, nama: 'Guru A', username: 'guru.a', kelas: [1,2], mapel: ['MAT','BI'] });
  });
});
