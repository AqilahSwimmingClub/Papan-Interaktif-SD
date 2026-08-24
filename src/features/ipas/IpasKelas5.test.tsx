import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GAME_ENGINE_FINAL } from '../../lib/gameEngines';
import { BAB_IPAS_KELAS_5, SEMUA_GAME_IPAS_5, SEMUA_TOPIK_IPAS_5, SEMUA_VLAB_IPAS_5, TP_IPAS_KELAS_5, cariVlabIpas5 } from '../../lib/ipasKelas5';
import { buatButirGameIpas, simpanHasilVlab } from '../../lib/storage/ipasRepo';
import { jalankanTransaksi, kueri, TOKO } from '../../lib/storage/db';
import type { Kelompok, Siswa } from '../../lib/types';
import { resetPenyimpanan } from '../../test/bantuan';
import { EduGameEngine } from './EduGameEngine';
import { VirtualLabEngine } from './VirtualLabEngine';

const dataLab = (nama: string) => {
  const vlab = SEMUA_VLAB_IPAS_5.find((item) => item.nama === nama)!;
  return cariVlabIpas5(vlab.id)!;
};
const renderLab = (nama: string) => {
  const data = dataLab(nama);
  render(<VirtualLabEngine topik={data.topik} vlab={data.vlab}/>);
  return data;
};

describe('sistem utuh IPAS Kelas V', () => {
  it('memiliki 8 bab, 25 topik, minimal satu VLAB dan lima gim playable per topik', () => {
    expect(BAB_IPAS_KELAS_5).toHaveLength(8);
    expect(SEMUA_TOPIK_IPAS_5).toHaveLength(25);
    expect(SEMUA_VLAB_IPAS_5).toHaveLength(38);
    expect(SEMUA_GAME_IPAS_5).toHaveLength(159);
    expect(SEMUA_TOPIK_IPAS_5.every((item) => item.vlab.length >= 1 && item.game.length >= 5)).toBe(true);
    expect(new Set(SEMUA_VLAB_IPAS_5.map((item) => item.id)).size).toBe(SEMUA_VLAB_IPAS_5.length);
    expect(new Set(SEMUA_GAME_IPAS_5.map((item) => item.id)).size).toBe(SEMUA_GAME_IPAS_5.length);
  });

  it('mengikat setiap topik hanya ke empat TP IPAS Kelas V final dan engine yang nyata', () => {
    const tpFinal = new Set(Object.values(TP_IPAS_KELAS_5));
    const engine = new Set(GAME_ENGINE_FINAL.map((item) => item.kode));
    expect(SEMUA_TOPIK_IPAS_5.every((item) => item.tpIds.length > 0 && item.tpIds.every((id) => tpFinal.has(id as never)))).toBe(true);
    expect(SEMUA_GAME_IPAS_5.every((item) => item.mekanik !== 'kuis' && engine.has(item.engineKode))).toBe(true);
  });

  it('Mirror Lab: rotasi cermin mengubah arah sinar real-time', () => {
    renderLab('Mirror Lab');
    const visual = screen.getByTestId('visual-cahaya');
    expect(visual).toHaveAttribute('data-ray-angle', '25');
    fireEvent.change(screen.getByRole('slider', { name: 'Sudut cermin' }), { target: { value: '70' } });
    expect(visual).toHaveAttribute('data-ray-angle', '70');
  });

  it('Shadow Lab: jarak benda mengubah ukuran bayangan', () => {
    renderLab('Shadow Lab');
    const visual = screen.getByTestId('visual-cahaya');
    const awal = visual.getAttribute('data-shadow-size');
    fireEvent.change(screen.getByRole('slider', { name: 'Jarak benda' }), { target: { value: '80' } });
    expect(visual.getAttribute('data-shadow-size')).not.toBe(awal);
  });

  it('Sound Lab: frekuensi mengubah state pitch, bukan gambar statis', () => {
    renderLab('Frequency Lab');
    const visual = screen.getByTestId('visual-bunyi');
    fireEvent.change(screen.getByRole('slider', { name: 'Frekuensi bunyi' }), { target: { value: '850' } });
    expect(visual).toHaveAttribute('data-frequency', '850');
    expect(visual).toHaveAttribute('data-pitch', 'tinggi');
  });

  it('Ecosystem Sandbox: menghapus produsen mengubah indikator keseimbangan', async () => {
    renderLab('Ecosystem Sandbox'); const pengguna = userEvent.setup();
    const indikator = screen.getByTestId('indikator-ekosistem'); const awal = indikator.getAttribute('data-balance');
    await pengguna.click(screen.getByRole('button', { name: 'Kurangi produsen' }));
    expect(indikator.getAttribute('data-balance')).not.toBe(awal);
  });

  it('Magnet Lab: kutub sama menolak dan kutub berbeda menarik', async () => {
    renderLab('Magnet Lab'); const pengguna = userEvent.setup(); const gaya = screen.getByTestId('gaya-magnet');
    expect(gaya).toHaveAttribute('data-force', 'tolak');
    await pengguna.selectOptions(screen.getByRole('combobox', { name: 'Kutub magnet B' }), 'S');
    expect(gaya).toHaveAttribute('data-force', 'tarik');
  });

  it('Circuit Builder: seluruh sambungan dan saklar membuat lampu ON', async () => {
    renderLab('Circuit Builder'); const pengguna = userEvent.setup(); const lampu = screen.getByTestId('lampu-rangkaian');
    for (const nama of ['baterai', 'kabel', 'lampu', 'saklar']) await pengguna.click(screen.getByRole('button', { name: `Hubungkan ${nama}` }));
    expect(lampu).toHaveAttribute('data-lamp-on', 'true'); expect(screen.getByText('LAMPU ON')).toBeVisible();
  });

  it('Erosion Lab: air, kemiringan, dan vegetasi menghasilkan perubahan terhitung', async () => {
    renderLab('Erosion Lab'); const pengguna = userEvent.setup(); const hasil = screen.getByTestId('hasil-erosi');
    fireEvent.change(screen.getByRole('slider', { name: 'Aliran air' }), { target: { value: '90' } });
    fireEvent.change(screen.getByRole('slider', { name: 'Kemiringan tanah' }), { target: { value: '80' } });
    fireEvent.change(screen.getByRole('slider', { name: 'Vegetasi' }), { target: { value: '10' } });
    await pengguna.click(screen.getByRole('button', { name: 'Jalankan percobaan' }));
    expect(Number(hasil.getAttribute('data-change'))).toBeGreaterThan(50);
  });

  it('Breathing Lab: inhale mengubah fase dan ukuran paru', async () => {
    renderLab('Breathing Lab'); const pengguna = userEvent.setup(); const paru = screen.getByTestId('paru-paru');
    await pengguna.click(screen.getByRole('button', { name: 'Tarik napas' }));
    expect(paru).toHaveAttribute('data-phase', 'inhale');
  });

  it('Local Economy: urutan produsen-distributor-konsumen menyelesaikan transaksi', async () => {
    renderLab('Local Economy'); const pengguna = userEvent.setup(); const alur = screen.getByTestId('alur-ekonomi');
    for (const nama of ['produsen', 'distributor', 'konsumen']) await pengguna.click(screen.getByRole('button', { name: new RegExp(nama) }));
    expect(alur).toHaveAttribute('data-complete', 'true'); expect(screen.getByText('✓ Transaksi selesai')).toBeVisible();
  });

  it('Eco City: penambahan sampah menurunkan kualitas lingkungan', () => {
    renderLab('Eco City'); const indikator = screen.getByTestId('indikator-kota'); const awal = Number(indikator.getAttribute('data-quality'));
    fireEvent.change(screen.getByRole('slider', { name: 'Jumlah sampah' }), { target: { value: '95' } });
    expect(Number(indikator.getAttribute('data-quality'))).toBeLessThan(awal);
  });

  it('GIM EDU IPAS memakai arena maze, movement, collision, target, dan completion nyata', async () => {
    const topik = SEMUA_TOPIK_IPAS_5[0]!; const config = topik.game.find((item) => item.mekanik === 'maze_adventure')!;
    const butir = buatButirGameIpas(topik, config)[0]!; const engine = GAME_ENGINE_FINAL.find((item) => item.kode === config.engineKode)!; const jawab = vi.fn(); const pengguna = userEvent.setup();
    render(<EduGameEngine content={butir} world={engine} mapelKode="IPAS" mode="individu" jumlahTim={2} onComplete={jawab}/>);
    expect(screen.getByTestId('edu-game-engine')).toHaveAttribute('data-mechanic', 'maze_adventure');
    for (let i = 0; i < 4; i += 1) await pengguna.click(screen.getByRole('button', { name: 'Kanan' }));
    for (let i = 0; i < 4; i += 1) await pengguna.click(screen.getByRole('button', { name: 'Bawah' }));
    expect(jawab).toHaveBeenCalledWith(butir.jawaban, 0);
  });

  it('menyimpan hasil VLAB kelompok ke setiap anggota beserta CP, TP, bab, topik, variabel, dan catatan', async () => {
    await resetPenyimpanan();
    const kelompok: Kelompok = { id: 'GRUP-IPAS', kelas_id: 'KELAS-5', nama: 'Tim Sains', semester: 1, poin_total: 0 };
    const siswa: Siswa[] = ['Ayu', 'Bima'].map((nama, i) => ({ id: `SISWA-${i}`, kelas_id: 'KELAS-5', nama, nomor_absen: i + 1, kelompok_id: kelompok.id, kelompok_ids: [kelompok.id], catatan_guru: '', perlu_pendampingan: false }));
    await jalankanTransaksi([TOKO.kelompok, TOKO.siswa], 'readwrite', async (toko) => { await kueri.simpan(toko(TOKO.kelompok), kelompok); for (const item of siswa) await kueri.simpan(toko(TOKO.siswa), item); });
    const data = dataLab('Mirror Lab');
    const hasil = await simpanHasilVlab({ tpId: TP_IPAS_KELAS_5.cahayaBunyi, cpId: 'CP-IPAS-C', kelasId: 'KELAS-5', kelompokId: kelompok.id, sesiId: 'SESI-UJI', dinilaiOleh: 'GURU-1', topik: data.topik, vlab: data.vlab, variabel: { sudut_cermin: 70 }, observasi: 'Sinar pantul berubah arah.', kesimpulan: 'Sudut cermin memengaruhi arah pantulan.' });
    expect(hasil).toHaveLength(2);
    expect(hasil.every((item) => item.jenis_aktivitas === 'vlab' && item.skor_maksimal === 0 && item.metadata_vlab?.status === 'selesai')).toBe(true);
    expect(hasil[0]?.metadata_vlab).toMatchObject({ cp_id: 'CP-IPAS-C', topik_id: data.topik.id, vlab_id: data.vlab.id, variabel: { sudut_cermin: 70 } });
  });
});
