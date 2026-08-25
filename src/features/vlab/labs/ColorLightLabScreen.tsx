import { useMemo, useState } from 'react';
import {
  KEADAAN_AWAL_COLOR_LIGHT,
  TAPIS_TERSEDIA,
  alihkanLampu,
  aturIntensitas,
  hitungColorLight,
  type KanalWarna,
} from '../../../lib/vlab/colorLightLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab, SaklarVlab } from '../KerangkaVlab';

const LAMPU: Array<{ kanal: KanalWarna; label: string; warna: string; x: number }> = [
  { kanal: 'merah', label: 'Merah', warna: '#ff3b30', x: 22 },
  { kanal: 'hijau', label: 'Hijau', warna: '#34c759', x: 50 },
  { kanal: 'biru', label: 'Biru', warna: '#0a84ff', x: 78 },
];

export function ColorLightLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_COLOR_LIGHT);
  const hasil = useMemo(() => hitungColorLight(keadaan), [keadaan]);

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_COLOR_LIGHT)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggungGelap
      panggung={
        <svg
          viewBox="0 0 100 66"
          role="img"
          aria-label={`Layar berwarna ${hasil.namaWarna}`}
        >
          <rect width={100} height={66} fill="#08131f" />

          {/* Berkas tiap lampu sorot menuju layar */}
          {LAMPU.map((lampu) =>
            keadaan.lampuMenyala[lampu.kanal] ? (
              <polygon
                key={`berkas-${lampu.kanal}`}
                points={`${lampu.x},10 ${34},44 ${66},44`}
                fill={lampu.warna}
                opacity={(keadaan.intensitas[lampu.kanal] / 100) * 0.42}
              />
            ) : null,
          )}

          {/* Tapis warna */}
          {keadaan.tapisKode !== 'tanpa' ? (
            <rect
              x={30}
              y={44}
              width={40}
              height={2.6}
              fill={
                keadaan.tapisKode === 'merah'
                  ? '#ff3b30'
                  : keadaan.tapisKode === 'hijau'
                    ? '#34c759'
                    : keadaan.tapisKode === 'biru'
                      ? '#0a84ff'
                      : '#ffd60a'
              }
              opacity={0.85}
            />
          ) : null}

          {/* Layar putih yang menerima campuran */}
          <rect x={28} y={48} width={44} height={14} rx={1.6} fill="#dfe7ee" />
          <rect x={29.5} y={49.5} width={41} height={11} rx={1} fill={hasil.warnaHex} />
          <text
            x={50}
            y={57}
            fontSize={4.4}
            textAnchor="middle"
            fill={hasil.kecerahan > 45 ? '#1a2733' : '#e6edf3'}
          >
            {hasil.namaWarna}
          </text>

          {/* Lampu sorot */}
          {LAMPU.map((lampu) => (
            <g key={lampu.kanal}>
              <rect x={lampu.x - 6} y={2} width={12} height={8} rx={2} fill="#3a4a5a" />
              <circle
                cx={lampu.x}
                cy={10}
                r={3.2}
                fill={keadaan.lampuMenyala[lampu.kanal] ? lampu.warna : '#2c3a47'}
              />
              <text x={lampu.x} y={19} fontSize={3.2} fill="#9fb6c8" textAnchor="middle">
                {lampu.label}
              </text>
            </g>
          ))}
        </svg>
      }
      kontrol={
        <>
          {LAMPU.map((lampu) => (
            <SaklarVlab
              key={`saklar-${lampu.kanal}`}
              label={`Lampu ${lampu.label.toLowerCase()}`}
              aktif={keadaan.lampuMenyala[lampu.kanal]}
              onUbah={() => setKeadaan(alihkanLampu(keadaan, lampu.kanal))}
            />
          ))}
          {LAMPU.map((lampu) => (
            <GeserVlab
              key={`intensitas-${lampu.kanal}`}
              label={`Intensitas ${lampu.label.toLowerCase()}`}
              nilai={keadaan.intensitas[lampu.kanal]}
              satuan="%"
              min={0}
              max={100}
              langkah={5}
              onUbah={(nilai) => setKeadaan(aturIntensitas(keadaan, lampu.kanal, nilai))}
            />
          ))}
          <label className="vlab-pilih-lengkap">
            Tapis di depan layar
            <select
              value={keadaan.tapisKode}
              onChange={(peristiwa) => setKeadaan({ ...keadaan, tapisKode: peristiwa.target.value })}
            >
              {TAPIS_TERSEDIA.map((tapis) => (
                <option key={tapis.kode} value={tapis.kode}>
                  {tapis.nama}
                </option>
              ))}
            </select>
          </label>
        </>
      }
      bacaan={
        <>
          <p className="vlab-status vlab-status--netral" data-testid="color-nama">
            {hasil.namaWarna}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Nilai RGB', nilai: `${hasil.rgb.r}, ${hasil.rgb.g}, ${hasil.rgb.b}` },
              { label: 'Kode warna', nilai: hasil.warnaHex.toUpperCase() },
              { label: 'Kecerahan', nilai: `${hasil.kecerahan.toFixed(0)}%` },
              { label: 'Lampu menyala', nilai: `${hasil.lampuAktif.length} dari 3` },
            ]}
          />
        </>
      }
    />
  );
}
