import { useEffect, useMemo, useState } from 'react';
import {
  AKTIVITAS_TUBUH,
  KEADAAN_AWAL_BREATHING,
  RUANG_RUGI_ML,
  hitungBreathing,
} from '../../../lib/vlab/breathingLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab } from '../KerangkaVlab';

export function BreathingLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_BREATHING);
  const [berjalan, setBerjalan] = useState(true);
  const hasil = useMemo(() => hitungBreathing(keadaan), [keadaan]);

  // Fase napas berjalan sesuai frekuensi napas yang dipilih siswa.
  useEffect(() => {
    if (!berjalan) return;
    const periodeMs = (60_000 / Math.max(1, keadaan.frekuensiPerMenit)) / 40;
    const pengatur = window.setInterval(() => {
      setKeadaan((sebelum) => ({ ...sebelum, fase: (sebelum.fase + 0.025) % 1 }));
    }, Math.max(30, periodeMs));
    return () => window.clearInterval(pengatur);
  }, [berjalan, keadaan.frekuensiPerMenit]);

  const skala = hasil.skalaParu;
  const diafragmaY = 46 + (1 - hasil.posisiDiafragma) * 6;

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => {
        setKeadaan(KEADAAN_AWAL_BREATHING);
        setBerjalan(true);
      }}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      aksiTambahan={
        <button className="vlab-tombol" type="button" onClick={() => setBerjalan((nilai) => !nilai)}>
          {berjalan ? 'Jeda napas' : 'Lanjutkan napas'}
        </button>
      }
      panggung={
        <svg
          viewBox="0 0 100 70"
          role="img"
          aria-label={`Paru-paru sedang ${hasil.sedangMenarikNapas ? 'menarik napas' : 'mengembuskan napas'}`}
        >
          <rect width={100} height={70} fill="#fdf3f5" />

          {/* Saluran napas; menyempit sesuai kontrol */}
          <rect
            x={48 - (2.4 * (100 - keadaan.penyempitanPersen)) / 100}
            y={6}
            width={(4.8 * (100 - keadaan.penyempitanPersen)) / 100 + 1.4}
            height={16}
            fill="#d98ca0"
          />
          <text x={58} y={12} fontSize={3.4} fill="#8a5b68">
            saluran napas
          </text>
          {keadaan.penyempitanPersen > 0 ? (
            <text x={58} y={17} fontSize={3.2} fill="#b14a2c">
              menyempit {keadaan.penyempitanPersen}%
            </text>
          ) : null}

          {/* Bronkus */}
          <line x1={50} y1={22} x2={36} y2={28} stroke="#d98ca0" strokeWidth={1.6} />
          <line x1={50} y1={22} x2={64} y2={28} stroke="#d98ca0" strokeWidth={1.6} />

          {/* Paru-paru — skala mengikuti fase dan volume tidal */}
          <ellipse cx={34} cy={36} rx={12 * skala} ry={13 * skala} fill="#f0a8b8" opacity={0.92} />
          <ellipse cx={66} cy={36} rx={12 * skala} ry={13 * skala} fill="#f0a8b8" opacity={0.92} />

          {/* Diafragma */}
          <path
            d={`M 18 ${diafragmaY} Q 50 ${diafragmaY + (hasil.sedangMenarikNapas ? 3 : 9)} 82 ${diafragmaY}`}
            fill="none"
            stroke="#9c5f70"
            strokeWidth={2.4}
          />
          <text x={50} y={diafragmaY + 13} fontSize={3.4} fill="#8a5b68" textAnchor="middle">
            diafragma {hasil.sedangMenarikNapas ? 'turun' : 'naik'}
          </text>

          {/* Rongga dada */}
          <path
            d="M 14 24 Q 50 14 86 24 L 86 60 Q 50 66 14 60 Z"
            fill="none"
            stroke="#c48b98"
            strokeWidth={1}
          />

          <text x={50} y={68} fontSize={4} fill="#7d4f5c" textAnchor="middle">
            {hasil.sedangMenarikNapas ? 'MENARIK NAPAS — udara masuk' : 'MENGEMBUSKAN NAPAS — udara keluar'}
          </text>
        </svg>
      }
      kontrol={
        <>
          <GeserVlab
            label="Volume tidal"
            nilai={keadaan.volumeTidalMl}
            satuan=" ml"
            min={200}
            max={1200}
            langkah={25}
            onUbah={(nilai) => setKeadaan({ ...keadaan, volumeTidalMl: nilai })}
          />
          <GeserVlab
            label="Frekuensi napas"
            nilai={keadaan.frekuensiPerMenit}
            satuan=" ×/menit"
            min={5}
            max={45}
            onUbah={(nilai) => setKeadaan({ ...keadaan, frekuensiPerMenit: nilai })}
          />
          <GeserVlab
            label="Penyempitan saluran"
            nilai={keadaan.penyempitanPersen}
            satuan="%"
            min={0}
            max={90}
            langkah={5}
            onUbah={(nilai) => setKeadaan({ ...keadaan, penyempitanPersen: nilai })}
          />
          <div className="vlab-geser" role="group" aria-label="Aktivitas tubuh">
            <span className="vlab-geser__label">Aktivitas tubuh</span>
            <div className="vlab-pilihan">
              {AKTIVITAS_TUBUH.map((aktivitas) => (
                <button
                  key={aktivitas.kode}
                  type="button"
                  aria-pressed={aktivitas.kode === keadaan.aktivitasKode}
                  onClick={() => setKeadaan({ ...keadaan, aktivitasKode: aktivitas.kode })}
                >
                  {aktivitas.ikon} {aktivitas.nama}
                </button>
              ))}
            </div>
          </div>
        </>
      }
      bacaan={
        <>
          <p
            className={`vlab-status vlab-status--${
              hasil.status === 'cukup' ? 'berhasil' : hasil.status === 'kurang' ? 'gagal' : 'netral'
            }`}
            data-testid="breathing-status"
          >
            {hasil.labelStatus}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Ventilasi semenit', nilai: `${hasil.ventilasiSemenit.toFixed(0)} ml/mnt` },
              { label: 'Ventilasi alveolar', nilai: `${hasil.ventilasiAlveolar.toFixed(0)} ml/mnt` },
              { label: 'Oksigen terserap', nilai: `${hasil.oksigenTerserap.toFixed(0)} ml/mnt` },
              { label: 'Kebutuhan tubuh', nilai: `${hasil.aktivitas.kebutuhanOksigen} ml/mnt` },
              { label: 'Kecukupan', nilai: `${(hasil.rasioKecukupan * 100).toFixed(0)}%` },
            ]}
          />
          <ul className="vlab-daftar-ringkas">
            <li>Ruang rugi saluran napas tetap {RUANG_RUGI_ML} ml tiap tarikan napas.</li>
            <li>Volume efektif setelah penyempitan: {hasil.volumeEfektifMl.toFixed(0)} ml.</li>
          </ul>
        </>
      }
    />
  );
}
