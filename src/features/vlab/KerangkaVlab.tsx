import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ProfilVlab } from '../../lib/vlab/katalogVlab';
import { RUTE } from '../../routes/paths';
import './vlab.css';

interface KerangkaVlabProps {
  profil: ProfilVlab;
  /** Panggung percobaan — SVG khas lab yang bersangkutan. */
  panggung: ReactNode;
  /** Kontrol variabel lab. */
  kontrol: ReactNode;
  /** Bacaan alat ukur lab. */
  bacaan: ReactNode;
  observasi: string;
  kesimpulan: string;
  onReset: () => void;
  panggungGelap?: boolean;
  /** Tombol tambahan khas lab, misalnya "Jalankan simulasi". */
  aksiTambahan?: ReactNode;
}

/**
 * Kerangka tampilan bersama seluruh VLAB.
 *
 * Kerangka hanya menyusun judul, tujuan, petunjuk, panggung, kontrol,
 * observasi, dan kesimpulan pada tata letak yang sama sehingga guru tidak
 * perlu belajar ulang tiap membuka lab. Kerangka ini tidak menyimpan keadaan
 * dan tidak menghitung apa pun — seluruh simulasi berada di modul lab.
 */
export function KerangkaVlab({
  profil,
  panggung,
  kontrol,
  bacaan,
  observasi,
  kesimpulan,
  onReset,
  panggungGelap = false,
  aksiTambahan,
}: KerangkaVlabProps) {
  return (
    <main
      className="halaman-vlab vlab-layar"
      data-testid={`vlab-${profil.kode}`}
      style={{ ['--vlab-warna' as string]: profil.warna }}
    >
      <header className="vlab-layar__kop">
        <div className="vlab-layar__judul">
          <span aria-hidden="true">{profil.ikon}</span>
          <div>
            <h1>{profil.nama}</h1>
            <p>{profil.tujuan}</p>
          </div>
        </div>
        <div className="vlab-layar__aksi">
          {aksiTambahan}
          <button className="vlab-tombol vlab-tombol--utama" type="button" onClick={onReset}>
            Ulangi percobaan
          </button>
          <button className="vlab-tombol" type="button" onClick={onReset}>
            Reset
          </button>
          <Link className="vlab-tombol vlab-tombol--sunyi" to={RUTE.vlab}>
            Daftar VLAB
          </Link>
        </div>
      </header>

      <p className="vlab-petunjuk">
        <b aria-hidden="true">›</b>
        {profil.petunjuk}
      </p>

      <div className="vlab-badan">
        <section
          className={`vlab-panggung${panggungGelap ? ' vlab-panggung--gelap' : ''}`}
          aria-label={`Area percobaan ${profil.nama}`}
        >
          {panggung}
        </section>

        <div className="vlab-samping">
          <section className="vlab-panel" aria-label="Kontrol percobaan">
            <h2>Kontrol</h2>
            <div className="vlab-kontrol">{kontrol}</div>
          </section>

          <section className="vlab-panel" aria-label="Bacaan alat ukur">
            <h2>Hasil pengukuran</h2>
            {bacaan}
          </section>

          <section className="vlab-panel vlab-observasi" aria-label="Catatan observasi">
            <h2>Catatan observasi</h2>
            <p data-testid="vlab-observasi">{observasi}</p>
          </section>

          <section className="vlab-panel vlab-kesimpulan" aria-label="Kesimpulan">
            <h2>Kesimpulan</h2>
            <p data-testid="vlab-kesimpulan">{kesimpulan}</p>
          </section>
        </div>
      </div>
    </main>
  );
}

interface GeserProps {
  label: string;
  nilai: number;
  satuan?: string;
  min: number;
  max: number;
  langkah?: number;
  onUbah: (nilai: number) => void;
  /** Teks nilai khusus, misalnya "Kutub utara". */
  tampilanNilai?: string;
}

/** Penggeser besar dengan nilai terbaca — dipakai lintas lab. */
export function GeserVlab({
  label,
  nilai,
  satuan = '',
  min,
  max,
  langkah = 1,
  onUbah,
  tampilanNilai,
}: GeserProps) {
  return (
    <label className="vlab-geser">
      <span className="vlab-geser__label">
        {label}
        <b className="vlab-geser__nilai">{tampilanNilai ?? `${nilai}${satuan}`}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={langkah}
        value={nilai}
        onChange={(peristiwa) => onUbah(Number(peristiwa.target.value))}
      />
    </label>
  );
}

interface SaklarProps {
  label: string;
  aktif: boolean;
  teksAktif?: string;
  teksMati?: string;
  onUbah: () => void;
}

/** Saklar besar dua keadaan. */
export function SaklarVlab({
  label,
  aktif,
  teksAktif = 'NYALA',
  teksMati = 'MATI',
  onUbah,
}: SaklarProps) {
  return (
    <button className="vlab-saklar" type="button" aria-pressed={aktif} onClick={onUbah}>
      {label}
      <b>{aktif ? teksAktif : teksMati}</b>
    </button>
  );
}

interface PilihanProps<T extends string> {
  label: string;
  nilai: T;
  opsi: Array<{ nilai: T; label: string }>;
  onUbah: (nilai: T) => void;
}

/** Deret tombol pilihan tunggal, cukup besar untuk disentuh di papan 75". */
export function PilihanVlab<T extends string>({ label, nilai, opsi, onUbah }: PilihanProps<T>) {
  return (
    <div className="vlab-geser" role="group" aria-label={label}>
      <span className="vlab-geser__label">{label}</span>
      <div className="vlab-pilihan">
        {opsi.map((item) => (
          <button
            key={item.nilai}
            type="button"
            aria-pressed={item.nilai === nilai}
            onClick={() => onUbah(item.nilai)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface BacaanProps {
  daftar: Array<{ label: string; nilai: string }>;
}

/** Kisi angka hasil pengukuran. */
export function BacaanVlab({ daftar }: BacaanProps) {
  return (
    <dl className="vlab-bacaan">
      {daftar.map((baris) => (
        <div key={baris.label}>
          <dt>{baris.label}</dt>
          <dd>{baris.nilai}</dd>
        </div>
      ))}
    </dl>
  );
}
