import { useMemo, useState } from 'react';
import {
  KEADAAN_AWAL_SHADOW,
  geserBenda,
  hitungShadow,
} from '../../../lib/vlab/shadowLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab, SaklarVlab } from '../KerangkaVlab';

const TENGAH = 30;

export function ShadowLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_SHADOW);
  const hasil = useMemo(() => hitungShadow(keadaan), [keadaan]);

  const setengahUmbra = hasil.tinggiUmbra / 2;
  const setengahTotal = hasil.tinggiTotalBayangan / 2;
  const setengahObjek = keadaan.tinggiObjek / 2;

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_SHADOW)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggungGelap
      panggung={
        <svg
          viewBox="0 0 105 60"
          role="img"
          aria-label={`Bayangan gelap setinggi ${hasil.tinggiUmbra.toFixed(1)} sentimeter`}
        >
          <rect width={105} height={60} fill="#0d1f2f" />

          {/* Kerucut cahaya dari tepi lampu melewati tepi objek */}
          {hasil.susunanSah ? (
            <>
              <polygon
                points={`${keadaan.posisiLampu},${TENGAH - keadaan.diameterLampu / 2} ${keadaan.posisiObjek},${TENGAH - setengahObjek} ${keadaan.posisiLayar},${TENGAH - setengahTotal} ${keadaan.posisiLayar},${TENGAH + setengahTotal} ${keadaan.posisiObjek},${TENGAH + setengahObjek} ${keadaan.posisiLampu},${TENGAH + keadaan.diameterLampu / 2}`}
                fill="#1d3346"
                opacity={0.85}
              />
              <polygon
                points={`${keadaan.posisiLampu},${TENGAH} ${keadaan.posisiLayar},${TENGAH - setengahUmbra} ${keadaan.posisiLayar},${TENGAH + setengahUmbra}`}
                fill="#060f18"
              />
            </>
          ) : null}

          {/* Berkas terang di luar bayangan */}
          {keadaan.lampuMenyala ? (
            <>
              <polygon
                points={`${keadaan.posisiLampu},${TENGAH} ${keadaan.posisiLayar},4 ${keadaan.posisiLayar},${TENGAH - setengahTotal}`}
                fill="#ffe27a"
                opacity={0.16}
              />
              <polygon
                points={`${keadaan.posisiLampu},${TENGAH} ${keadaan.posisiLayar},${TENGAH + setengahTotal} ${keadaan.posisiLayar},56`}
                fill="#ffe27a"
                opacity={0.16}
              />
            </>
          ) : null}

          {/* Layar */}
          <rect x={keadaan.posisiLayar} y={2} width={3.4} height={56} fill="#e6edf3" />
          {hasil.susunanSah ? (
            <>
              <rect
                x={keadaan.posisiLayar}
                y={TENGAH - setengahTotal}
                width={3.4}
                height={hasil.tinggiTotalBayangan}
                fill="#8fa3b4"
                opacity={0.7}
              />
              <rect
                x={keadaan.posisiLayar}
                y={TENGAH - setengahUmbra}
                width={3.4}
                height={hasil.tinggiUmbra}
                fill="#16222e"
              />
            </>
          ) : null}

          {/* Objek */}
          <rect
            x={keadaan.posisiObjek - 1.6}
            y={TENGAH - setengahObjek}
            width={3.2}
            height={keadaan.tinggiObjek}
            rx={0.8}
            fill="#c0873f"
          />

          {/* Lampu */}
          <circle
            cx={keadaan.posisiLampu}
            cy={TENGAH}
            r={Math.max(1.5, keadaan.diameterLampu / 2)}
            fill={keadaan.lampuMenyala ? '#ffd24d' : '#4a5c6b'}
          />

          <text x={keadaan.posisiLampu} y={TENGAH + 12} fill="#9fb6c8" fontSize={3.2} textAnchor="middle">
            lampu
          </text>
          <text x={keadaan.posisiObjek} y={TENGAH - setengahObjek - 2} fill="#9fb6c8" fontSize={3.2} textAnchor="middle">
            objek
          </text>
          <text x={keadaan.posisiLayar + 1.7} y={59} fill="#9fb6c8" fontSize={3.2} textAnchor="middle">
            layar
          </text>
        </svg>
      }
      kontrol={
        <>
          <SaklarVlab
            label="Lampu"
            aktif={keadaan.lampuMenyala}
            onUbah={() => setKeadaan({ ...keadaan, lampuMenyala: !keadaan.lampuMenyala })}
          />
          <GeserVlab
            label="Posisi lampu"
            nilai={keadaan.posisiLampu}
            satuan=" cm"
            min={0}
            max={60}
            onUbah={(nilai) => setKeadaan(geserBenda(keadaan, 'lampu', nilai))}
          />
          <GeserVlab
            label="Posisi objek"
            nilai={keadaan.posisiObjek}
            satuan=" cm"
            min={5}
            max={95}
            onUbah={(nilai) => setKeadaan(geserBenda(keadaan, 'objek', nilai))}
          />
          <GeserVlab
            label="Posisi layar"
            nilai={keadaan.posisiLayar}
            satuan=" cm"
            min={20}
            max={100}
            onUbah={(nilai) => setKeadaan(geserBenda(keadaan, 'layar', nilai))}
          />
          <GeserVlab
            label="Tinggi objek"
            nilai={keadaan.tinggiObjek}
            satuan=" cm"
            min={3}
            max={24}
            onUbah={(nilai) => setKeadaan({ ...keadaan, tinggiObjek: nilai })}
          />
          <GeserVlab
            label="Diameter lampu"
            nilai={keadaan.diameterLampu}
            satuan=" cm"
            min={1}
            max={18}
            onUbah={(nilai) => setKeadaan({ ...keadaan, diameterLampu: nilai })}
          />
        </>
      }
      bacaan={
        <>
          <p className={`vlab-status vlab-status--${hasil.susunanSah ? 'netral' : 'gagal'}`}>
            {hasil.susunanSah ? hasil.labelKetajaman : 'Susunan belum membentuk bayangan'}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Bayangan gelap', nilai: `${hasil.tinggiUmbra.toFixed(1)} cm` },
              { label: 'Perbesaran', nilai: `${hasil.perbesaran.toFixed(2)}×` },
              { label: 'Tepi kabur', nilai: `${hasil.lebarPenumbra.toFixed(1)} cm` },
              { label: 'Lampu → objek', nilai: `${hasil.jarakLampuObjek} cm` },
              { label: 'Objek → layar', nilai: `${hasil.jarakObjekLayar} cm` },
            ]}
          />
        </>
      }
    />
  );
}
