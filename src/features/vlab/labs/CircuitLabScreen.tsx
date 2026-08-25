import { useMemo, useState } from 'react';
import {
  KEADAAN_AWAL_CIRCUIT,
  alihkanLampuPutus,
  hitungCircuit,
  type SusunanRangkaian,
} from '../../../lib/vlab/circuitLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab, PilihanVlab, SaklarVlab } from '../KerangkaVlab';

const WARNA_TERANG: Record<string, string> = {
  padam: '#3a4a5a',
  redup: '#8a7530',
  normal: '#ffd24d',
  sangat_terang: '#fff3b0',
  putus: '#5a2f2f',
};

export function CircuitLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_CIRCUIT);
  const hasil = useMemo(() => hitungCircuit(keadaan), [keadaan]);
  const seri = keadaan.susunan === 'seri';

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_CIRCUIT)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggungGelap
      panggung={
        <svg
          viewBox="0 0 100 66"
          role="img"
          aria-label={`Rangkaian ${keadaan.susunan}, arus ${hasil.arusTotal.toFixed(2)} ampere`}
        >
          <rect width={100} height={66} fill="#0d1f2f" />

          {/* Kabel utama */}
          <path
            d="M 12 46 L 12 20 L 88 20 L 88 46 Z"
            fill="none"
            stroke={hasil.rangkaianTertutup ? '#7ce0a8' : '#4a5c6b'}
            strokeWidth={1.4}
          />
          <path
            d="M 12 46 L 88 46"
            fill="none"
            stroke={keadaan.kabelTerputus ? '#c9553a' : hasil.rangkaianTertutup ? '#7ce0a8' : '#4a5c6b'}
            strokeWidth={1.4}
            strokeDasharray={keadaan.kabelTerputus ? '3 4' : '0'}
          />

          {/* Baterai */}
          {Array.from({ length: keadaan.jumlahBaterai }, (_, indeks) => (
            <g key={`baterai-${indeks}`}>
              <rect x={16 + indeks * 11} y={42} width={9} height={8} rx={1.4} fill="#f2b230" />
              <text x={20.5 + indeks * 11} y={48} fontSize={4} fill="#3a2c05" textAnchor="middle">
                +
              </text>
            </g>
          ))}
          <text x={16} y={56} fontSize={3.2} fill="#9fb6c8">
            {hasil.tegangan.toFixed(1)} V
          </text>

          {/* Saklar */}
          <g>
            <circle cx={74} cy={46} r={1.4} fill="#9fb6c8" />
            <circle cx={82} cy={46} r={1.4} fill="#9fb6c8" />
            <line
              x1={74}
              y1={46}
              x2={keadaan.saklarTertutup ? 82 : 80}
              y2={keadaan.saklarTertutup ? 46 : 39}
              stroke={keadaan.saklarTertutup ? '#7ce0a8' : '#c9553a'}
              strokeWidth={1.4}
            />
            <text x={78} y={56} fontSize={3.2} fill="#9fb6c8" textAnchor="middle">
              saklar
            </text>
          </g>

          {/* Lampu — seri berjajar pada satu kawat, paralel bercabang */}
          {Array.from({ length: keadaan.jumlahLampu }, (_, indeks) => {
            const lebar = 72 / keadaan.jumlahLampu;
            const x = 14 + lebar * indeks + lebar / 2;
            const status = hasil.terang[indeks] ?? 'padam';
            // Lampu seri duduk pada kawat atas; lampu paralel turun ke cabangnya.
            const y = seri ? 20 : 34;
            return (
              <g key={`lampu-${indeks}`}>
                {!seri ? (
                  <>
                    <line x1={x} y1={20} x2={x} y2={30} stroke="#7ce0a8" strokeWidth={1} opacity={0.8} />
                    <line x1={x} y1={38} x2={x} y2={46} stroke="#7ce0a8" strokeWidth={1} opacity={0.8} />
                  </>
                ) : null}
                <circle
                  cx={x}
                  cy={y}
                  r={5}
                  fill={WARNA_TERANG[status]}
                  stroke="#9fb6c8"
                  strokeWidth={0.6}
                />
                {status !== 'padam' && status !== 'putus' ? (
                  <circle cx={x} cy={y} r={8} fill="#ffd24d" opacity={0.18} />
                ) : null}
                {status === 'putus' ? (
                  <line x1={x - 3} y1={y - 3} x2={x + 3} y2={y + 3} stroke="#c9553a" strokeWidth={1.2} />
                ) : null}
                <text x={x} y={y + 11} fontSize={3} fill="#9fb6c8" textAnchor="middle">
                  L{indeks + 1}
                </text>
              </g>
            );
          })}

          <text x={50} y={9} fontSize={4.2} fill="#9fb6c8" textAnchor="middle">
            Rangkaian {keadaan.susunan}
          </text>
          <text x={50} y={63} fontSize={3.4} fill={hasil.rangkaianTertutup ? '#7ce0a8' : '#c9553a'} textAnchor="middle">
            {hasil.rangkaianTertutup
              ? `arus mengalir ${hasil.arusTotal.toFixed(2)} A`
              : 'rangkaian terbuka — arus 0 A'}
          </text>
        </svg>
      }
      kontrol={
        <>
          <SaklarVlab
            label="Saklar"
            aktif={keadaan.saklarTertutup}
            teksAktif="TERTUTUP"
            teksMati="TERBUKA"
            onUbah={() => setKeadaan({ ...keadaan, saklarTertutup: !keadaan.saklarTertutup })}
          />
          <SaklarVlab
            label="Kabel penghubung"
            aktif={!keadaan.kabelTerputus}
            teksAktif="UTUH"
            teksMati="PUTUS"
            onUbah={() => setKeadaan({ ...keadaan, kabelTerputus: !keadaan.kabelTerputus })}
          />
          <PilihanVlab<SusunanRangkaian>
            label="Susunan rangkaian"
            nilai={keadaan.susunan}
            opsi={[
              { nilai: 'seri', label: 'Seri' },
              { nilai: 'paralel', label: 'Paralel' },
            ]}
            onUbah={(nilai) => setKeadaan({ ...keadaan, susunan: nilai })}
          />
          <GeserVlab
            label="Jumlah baterai"
            nilai={keadaan.jumlahBaterai}
            satuan=" buah"
            min={0}
            max={6}
            onUbah={(nilai) => setKeadaan({ ...keadaan, jumlahBaterai: nilai })}
          />
          <GeserVlab
            label="Jumlah lampu"
            nilai={keadaan.jumlahLampu}
            satuan=" buah"
            min={1}
            max={5}
            onUbah={(nilai) =>
              setKeadaan({
                ...keadaan,
                jumlahLampu: nilai,
                lampuPutus: keadaan.lampuPutus.filter((indeks) => indeks < nilai),
              })
            }
          />
          <div className="vlab-geser" role="group" aria-label="Putuskan filamen lampu">
            <span className="vlab-geser__label">Putuskan filamen lampu</span>
            <div className="vlab-pilihan">
              {Array.from({ length: keadaan.jumlahLampu }, (_, indeks) => (
                <button
                  key={`putus-${indeks}`}
                  type="button"
                  aria-pressed={keadaan.lampuPutus.includes(indeks)}
                  onClick={() => setKeadaan(alihkanLampuPutus(keadaan, indeks))}
                >
                  Lampu {indeks + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      }
      bacaan={
        <>
          <p
            className={`vlab-status vlab-status--${hasil.rangkaianTertutup ? 'berhasil' : 'gagal'}`}
            data-testid="circuit-status"
          >
            {hasil.labelTerang}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Tegangan', nilai: `${hasil.tegangan.toFixed(1)} V` },
              { label: 'Hambatan total', nilai: `${hasil.hambatanTotal.toFixed(1)} Ω` },
              { label: 'Arus total', nilai: `${hasil.arusTotal.toFixed(2)} A` },
              { label: 'Daya tiap lampu', nilai: `${hasil.dayaPerLampu.toFixed(2)} W` },
            ]}
          />
          <ul className="vlab-daftar-ringkas">
            {hasil.terang.map((status, indeks) => (
              <li key={`status-${indeks}`}>
                Lampu {indeks + 1}: {status.replace('_', ' ')}
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}
