import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../state/useAuth';
import type { Akun } from '../../lib/types';
import {
  aturUlangSandiGuru,
  buatAkunGuru,
  daftarAkunLokal,
  ubahAkunGuru,
  ubahStatusAkunGuru,
} from '../../lib/auth/authService';
import { keAppError } from '../../lib/errors/AppError';
import '../pelengkap/pelengkap.css';
import './kelola-akun.css';
import { bacaProviderAi, simpanProviderAi, type ProviderAi } from '../../lib/ai/aiService';
import { simpanPenugasanGuru } from '../../lib/storage/pelengkapRepo';
import { bacaExcelGuru, unduhTemplateGuru, type BarisGuruImpor } from '../../lib/guruImport';

const FORM_AWAL = { nama: '', username: '', password: '', konfirmasi: '', kelas: '', mapel: '' };

export function KelolaAkunScreen() {
  const { akun } = useAuth();
  const [daftar, setDaftar] = useState<Akun[]>([]);
  const [form, setForm] = useState(FORM_AWAL);
  const [resetId, setResetId] = useState<string | null>(null);
  const [sandiBaru, setSandiBaru] = useState('');
  const [pesan, setPesan] = useState('');
  const [providerAi, setProviderAi] = useState<ProviderAi>(() => bacaProviderAi());
  const [imporGuru, setImporGuru] = useState<BarisGuruImpor[]>([]);
  const inputGuruRef = useRef<HTMLInputElement>(null);

  async function muat() {
    if (akun) setDaftar(await daftarAkunLokal(akun));
  }

  useEffect(() => {
    void muat().catch((galat: unknown) => setPesan(keAppError(galat).message));
    // Akun aktif stabil selama layar ini terbuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [akun?.id]);

  async function tambah(peristiwa: FormEvent<HTMLFormElement>) {
    peristiwa.preventDefault();
    if (!akun) return;
    try {
      const guru = await buatAkunGuru(akun, form);
      await simpanPenugasanGuru(guru, form.kelas.split(',').map(Number), form.mapel.split(','));
      setForm(FORM_AWAL);
      setPesan('Akun Guru tersimpan di perangkat ini.');
      await muat();
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }

  async function editGuru(guru: Akun) {
    if (!akun) return;
    const nama = window.prompt('Nama Guru', guru.nama);
    if (nama === null) return;
    const username = window.prompt('Username Guru', guru.username);
    if (username === null) return;
    try { await ubahAkunGuru(akun, guru.id, { nama, username }); setPesan('Identitas akun Guru diperbarui tanpa menyentuh data kelasnya.'); await muat(); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  async function aturPenugasan(guru: Akun) {
    const kelas = window.prompt('Kelas diampu, pisahkan koma (contoh: 1,2,3)', '');
    if (kelas === null) return;
    const mapel = window.prompt('Kode mapel diampu, pisahkan koma (contoh: MAT,BI,IPAS)', '');
    if (mapel === null) return;
    try { await simpanPenugasanGuru(guru, kelas.split(',').map(Number), mapel.split(',')); setPesan(`Penugasan ${guru.nama} tersimpan.`); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  async function bacaImporGuru(file: File | undefined) {
    if (!file) return;
    try { const baris = await bacaExcelGuru(await file.arrayBuffer()); setImporGuru(baris); setPesan(`${baris.filter((item) => item.valid).length} akun Guru siap diimpor.`); }
    catch (galat) { setPesan(keAppError(galat).message); }
    if (inputGuruRef.current) inputGuruRef.current.value = '';
  }

  async function jalankanImporGuru() {
    if (!akun) return;
    try {
      let jumlah = 0;
      for (const baris of imporGuru.filter((item) => item.valid)) {
        const sandiSementara = crypto.randomUUID();
        const guru = await buatAkunGuru(akun, { nama: baris.nama, username: baris.username, password: sandiSementara, konfirmasi: sandiSementara });
        await simpanPenugasanGuru(guru, baris.kelas, baris.mapel);
        await ubahStatusAkunGuru(akun, guru.id, false);
        jumlah += 1;
      }
      setImporGuru([]); setPesan(`${jumlah} akun diimpor dalam status nonaktif. Atur ulang password lalu aktifkan akun.`); await muat();
    } catch (galat) { setPesan(keAppError(galat).message); await muat(); }
  }

  async function ubahAktif(guru: Akun) {
    if (!akun) return;
    try {
      await ubahStatusAkunGuru(akun, guru.id, !guru.aktif);
      setPesan(`Akun ${guru.nama} ${guru.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`);
      await muat();
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }

  async function resetSandi(guru: Akun) {
    if (!akun) return;
    try {
      await aturUlangSandiGuru(akun, guru.id, sandiBaru);
      setResetId(null);
      setSandiBaru('');
      setPesan(`Sandi ${guru.nama} sudah diperbarui.`);
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }

  const guru = daftar.filter((item) => item.peran === 'guru');

  return (
    <main className="halaman-pelengkap" data-testid="layar-kelola-akun">
      <header className="pelengkap-kop">
        <div>
          <p className="label-data">Hanya Admin perangkat</p>
          <h1>Kelola Akun</h1>
          <p>Akun tersimpan hanya di perangkat ini; tidak ada akun pusat atau pemulihan surel.</p>
        </div>
      </header>

      <div className="tata-akun">
        <form className="form-akun" onSubmit={(peristiwa) => void tambah(peristiwa)}>
          <h2>Tambah akun Guru</h2>
          <label>
            Nama Guru
            <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </label>
          <label>
            Username
            <input
              autoCapitalize="none"
              autoComplete="off"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <label>
            Konfirmasi Password
            <input
              type="password"
              autoComplete="new-password"
              value={form.konfirmasi}
              onChange={(e) => setForm({ ...form, konfirmasi: e.target.value })}
            />
          </label>
          <label>Kelas diampu<input value={form.kelas} placeholder="1,2,3" onChange={(e) => setForm({ ...form, kelas: e.target.value })}/></label>
          <label>Mapel diampu<input value={form.mapel} placeholder="MAT,BI,IPAS" onChange={(e) => setForm({ ...form, mapel: e.target.value })}/></label>
          <button className="tombol-guru tombol-guru--utama" type="submit">
            Simpan Akun Guru
          </button>
        </form>

        <section className="daftar-akun">
          <h2>Akun pada perangkat</h2>
          {guru.length ? (
            guru.map((item) => (
              <article key={item.id}>
                <header>
                  <div>
                    <strong>{item.nama}</strong>
                    <small>@{item.username} · {item.aktif ? 'Aktif' : 'Nonaktif'}</small>
                  </div>
                  <button className="tombol-guru" type="button" onClick={() => void ubahAktif(item)}>
                    {item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </header>
                {resetId === item.id ? (
                  <div className="reset-sandi">
                    <label>
                      Sandi baru
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={sandiBaru}
                        onChange={(e) => setSandiBaru(e.target.value)}
                      />
                    </label>
                    <button
                      className="tombol-guru tombol-guru--utama"
                      type="button"
                      onClick={() => void resetSandi(item)}
                    >
                      Simpan Sandi
                    </button>
                    <button className="tombol-guru" type="button" onClick={() => setResetId(null)}>
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="aksi-akun-guru"><button className="tautan-akun" type="button" onClick={() => setResetId(item.id)}>Atur ulang sandi</button><button className="tautan-akun" type="button" onClick={() => void editGuru(item)}>Edit identitas</button><button className="tautan-akun" type="button" onClick={() => void aturPenugasan(item)}>Atur kelas/mapel</button></div>
                )}
              </article>
            ))
          ) : (
            <p>Belum ada akun Guru. Admin tetap dapat memakai seluruh fitur pembelajaran.</p>
          )}
        </section>
      </div>
      <section className="kartu-backup impor-guru"><p className="label-data">Impor Guru</p><h2>Template dan pratinjau Excel</h2><p>Kolom: Nama, Username, Kelas, Peran, Mapel. Akun hasil impor dinonaktifkan sampai Admin menetapkan password awal.</p><div><button type="button" onClick={() => void unduhTemplateGuru()}>Unduh Template</button><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => inputGuruRef.current?.click()}>Pilih Excel</button><input className="sr-only" ref={inputGuruRef} type="file" accept=".xlsx,.xls" onChange={(e) => void bacaImporGuru(e.target.files?.[0])}/></div>{imporGuru.length ? <><div className="tabel-data-wrap"><table><thead><tr><th>Baris</th><th>Nama</th><th>Username</th><th>Kelas/Mapel</th><th>Status</th></tr></thead><tbody>{imporGuru.map((item) => <tr key={item.baris}><td>{item.baris}</td><td>{item.nama}</td><td>{item.username}</td><td>{item.kelas.join(', ') || '-'} / {item.mapel.join(', ') || '-'}</td><td>{item.valid ? 'Siap' : item.masalah.join(' ')}</td></tr>)}</tbody></table></div><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => void jalankanImporGuru()}>Impor akun valid</button></> : null}</section>
      <section className="kartu-backup konfigurasi-ai-admin">
        <p className="label-data">Konfigurasi AI</p><h2>Provider resmi</h2>
        <p>Kunci API tetap berada pada environment server dan tidak disimpan di browser maupun Android.</p>
        <label>Provider<select value={providerAi} onChange={(e) => { const nilai = e.target.value as ProviderAi; setProviderAi(nilai); simpanProviderAi(nilai); setPesan(`Provider AI ${nilai === 'gemini' ? 'Gemini' : 'OpenAI'} dipilih. Pastikan secret server tersedia.`); }}><option value="openai">OpenAI</option><option value="gemini">Google Gemini</option></select></label>
      </section>
      {pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : null}
    </main>
  );
}
