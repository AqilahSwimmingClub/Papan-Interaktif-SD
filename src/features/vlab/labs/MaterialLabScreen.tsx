import { useMemo, useState } from 'react';
import {
  BAHAN_UJI,
  KEADAAN_AWAL_MATERIAL,
  gantiBahan,
  hitungMaterial,
} from '../../../lib/vlab/materialLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab, SaklarVlab } from '../KerangkaVlab';

export function MaterialLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_MATERIAL);
  const hasil = useMemo(() => hitungMaterial(keadaan), [keadaan]);

  const kelasStatus =
    hasil.kategori === 'transparan' ? 'berhasil' : hasil.kategori === 'opak' ? 'gagal' : 'netral';

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_MATERIAL)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggung={
        <svg
          viewBox="0 0 100 58"
          role="img"
          aria-label={`Sensor membaca ${hasil.bacaanSensor.toFixed(1)} lux, bahan tergolong ${hasil.labelKategori}`}
        >
          <rect width={100} height={58} fill="#f3f7fa" />

          {/* Lampu sumber */}
          <g>
            <rect x={4} y={22} width={10} height={14} rx={2} fill="#4a5c6b" />
            <circle cx={16} cy={29} r={4} fill={keadaan.lampuMenyala ? '#ffd24d' : '#98a6b3'} />
            <text x={9} y={44} fontSize={3.2} fill="#55697a" textAnchor="middle">
              lampu
            </text>
          </g>

          {/* Berkas sebelum bahan */}
          {keadaan.lampuMenyala ? (
            <rect
              x={20}
              y={29 - (keadaan.dayaLampu / 100) * 9}
              width={26}
              height={(keadaan.dayaLampu / 100) * 18}
              fill="#ffe27a"
              opacity={0.75}
            />
          ) : null}

          {/* Baki bahan */}
          <g>
            <rect
              x={46}
              y={12}
              width={Math.max(2.5, keadaan.tebalMm * 0.7)}
              height={34}
              fill={hasil.bahan.warna}
              stroke="#7f8f9c"
              strokeWidth={0.5}
            />
            <rect x={44} y={46} width={12} height={2.4} rx={1} fill="#8c99a5" />
            <text x={50} y={9} fontSize={3.4} fill="#35485a" textAnchor="middle">
              {hasil.bahan.nama}
            </text>
          </g>

          {/* Berkas setelah bahan; tinggi dan opasitas mengikuti transmisi */}
          {hasil.transmisi > 0.001 ? (
            <rect
              x={46 + Math.max(2.5, keadaan.tebalMm * 0.7)}
              y={29 - (keadaan.dayaLampu / 100) * 9}
              width={30 - Math.max(2.5, keadaan.tebalMm * 0.7)}
              height={(keadaan.dayaLampu / 100) * 18}
              fill="#ffe27a"
              opacity={Math.max(0.06, hasil.transmisi * 0.75)}
            />
          ) : null}

          {/* Layar dan sensor */}
          <rect x={80} y={8} width={3} height={42} fill="#c8d4dd" />
          <rect
            x={83}
            y={22}
            width={12}
            height={14}
            rx={2}
            fill="#28394a"
          />
          <text x={89} y={31} fontSize={4.4} fill="#7ce0a8" textAnchor="middle" fontFamily="monospace">
            {hasil.bacaanSensor.toFixed(0)}
          </text>
          <text x={89} y={41} fontSize={3} fill="#9fb6c8" textAnchor="middle">
            lux
          </text>

          {/* Bayangan pada layar; ketajaman berbeda tiap bahan */}
          <rect
            x={76}
            y={29 - (keadaan.dayaLampu / 100) * 9}
            width={4}
            height={(keadaan.dayaLampu / 100) * 18}
            fill="#243342"
            opacity={Math.min(0.85, (1 - hasil.transmisi) * hasil.ketajamanBayangan + 0.05)}
          />
        </svg>
      }
      kontrol={
        <>
          <SaklarVlab
            label="Lampu sumber"
            aktif={keadaan.lampuMenyala}
            onUbah={() => setKeadaan({ ...keadaan, lampuMenyala: !keadaan.lampuMenyala })}
          />
          <div className="vlab-geser" role="group" aria-label="Bahan pada baki">
            <span className="vlab-geser__label">Bahan pada baki</span>
            <div className="vlab-pilihan">
              {BAHAN_UJI.map((bahan) => (
                <button
                  key={bahan.kode}
                  type="button"
                  aria-pressed={bahan.kode === keadaan.bahanKode}
                  onClick={() => setKeadaan(gantiBahan(keadaan, bahan.kode))}
                >
                  {bahan.nama}
                </button>
              ))}
            </div>
          </div>
          <GeserVlab
            label="Ketebalan bahan"
            nilai={keadaan.tebalMm}
            satuan=" mm"
            min={1}
            max={40}
            onUbah={(nilai) => setKeadaan({ ...keadaan, tebalMm: nilai })}
          />
          <GeserVlab
            label="Daya lampu"
            nilai={keadaan.dayaLampu}
            satuan="%"
            min={10}
            max={100}
            langkah={5}
            onUbah={(nilai) => setKeadaan({ ...keadaan, dayaLampu: nilai })}
          />
        </>
      }
      bacaan={
        <>
          <p className={`vlab-status vlab-status--${kelasStatus}`} data-testid="material-kategori">
            {hasil.labelKategori}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Bacaan sensor', nilai: `${hasil.bacaanSensor.toFixed(1)} lux` },
              { label: 'Cahaya diteruskan', nilai: `${(hasil.transmisi * 100).toFixed(1)}%` },
              { label: 'Ketajaman bayangan', nilai: `${(hasil.ketajamanBayangan * 100).toFixed(0)}%` },
            ]}
          />
        </>
      }
    />
  );
}
