import { useMemo, useState } from 'react';
import {
  KEADAAN_AWAL_MIRROR,
  PANGGUNG_MIRROR,
  RADIUS_TARGET,
  hitungMirror,
  pindahLaser,
  putarCermin,
} from '../../../lib/vlab/mirrorLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab, SaklarVlab } from '../KerangkaVlab';

export function MirrorLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_MIRROR);
  const hasil = useMemo(() => hitungMirror(keadaan), [keadaan]);

  const rad = (keadaan.sudutCermin * Math.PI) / 180;
  const setengah = 16;
  const cerminUjungA = {
    x: keadaan.cermin.x - Math.cos(rad) * setengah,
    y: keadaan.cermin.y + Math.sin(rad) * setengah,
  };
  const cerminUjungB = {
    x: keadaan.cermin.x + Math.cos(rad) * setengah,
    y: keadaan.cermin.y - Math.sin(rad) * setengah,
  };

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_MIRROR)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggungGelap
      panggung={
        <svg
          viewBox={`0 0 ${PANGGUNG_MIRROR.lebar} ${PANGGUNG_MIRROR.tinggi}`}
          role="img"
          aria-label={`Sudut datang ${hasil.sudutDatang.toFixed(0)} derajat, sudut pantul ${hasil.sudutPantul.toFixed(0)} derajat`}
        >
          <rect width={PANGGUNG_MIRROR.lebar} height={PANGGUNG_MIRROR.tinggi} fill="#0d1f2f" />

          {/* Garis normal */}
          <line
            x1={keadaan.cermin.x - hasil.arahNormal.x * 22}
            y1={keadaan.cermin.y - hasil.arahNormal.y * 22}
            x2={keadaan.cermin.x + hasil.arahNormal.x * 22}
            y2={keadaan.cermin.y + hasil.arahNormal.y * 22}
            stroke="#6cc0f0"
            strokeWidth={0.7}
            strokeDasharray="2.4 2"
          />
          <text
            x={keadaan.cermin.x + hasil.arahNormal.x * 25}
            y={keadaan.cermin.y + hasil.arahNormal.y * 25}
            fill="#6cc0f0"
            fontSize={3.4}
            textAnchor="middle"
          >
            normal
          </text>

          {/* Cermin */}
          <line
            x1={cerminUjungA.x}
            y1={cerminUjungA.y}
            x2={cerminUjungB.x}
            y2={cerminUjungB.y}
            stroke="#d5e6f2"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <line
            x1={cerminUjungA.x + hasil.arahNormal.x * -2.4}
            y1={cerminUjungA.y + hasil.arahNormal.y * -2.4}
            x2={cerminUjungB.x + hasil.arahNormal.x * -2.4}
            y2={cerminUjungB.y + hasil.arahNormal.y * -2.4}
            stroke="#4a6478"
            strokeWidth={2.2}
          />

          {/* Target */}
          <circle
            cx={keadaan.target.x}
            cy={keadaan.target.y}
            r={RADIUS_TARGET}
            fill="none"
            stroke={hasil.kenaTarget ? '#7ce0a8' : '#c9553a'}
            strokeWidth={1.4}
          />
          <circle
            cx={keadaan.target.x}
            cy={keadaan.target.y}
            r={2}
            fill={hasil.kenaTarget ? '#7ce0a8' : '#7b4335'}
          />

          {keadaan.laserMenyala ? (
            <>
              {/* Sinar datang */}
              <line
                x1={keadaan.laser.x}
                y1={keadaan.laser.y}
                x2={hasil.titikPantul.x}
                y2={hasil.titikPantul.y}
                stroke="#ff6b6b"
                strokeWidth={1.5}
              />
              {/* Sinar pantul */}
              <line
                x1={hasil.titikPantul.x}
                y1={hasil.titikPantul.y}
                x2={hasil.ujungPantul.x}
                y2={hasil.ujungPantul.y}
                stroke="#ffb36b"
                strokeWidth={1.5}
                strokeDasharray="0"
              />
              <circle cx={hasil.titikPantul.x} cy={hasil.titikPantul.y} r={1.8} fill="#fff" />
            </>
          ) : null}

          {/* Laser */}
          <circle
            cx={keadaan.laser.x}
            cy={keadaan.laser.y}
            r={3.2}
            fill={keadaan.laserMenyala ? '#ff6b6b' : '#4a5c6b'}
          />
          <text x={keadaan.laser.x} y={keadaan.laser.y + 8} fill="#9fb6c8" fontSize={3.4} textAnchor="middle">
            laser
          </text>
          <text x={keadaan.target.x} y={keadaan.target.y - 8} fill="#9fb6c8" fontSize={3.4} textAnchor="middle">
            target
          </text>
        </svg>
      }
      kontrol={
        <>
          <SaklarVlab
            label="Laser"
            aktif={keadaan.laserMenyala}
            onUbah={() => setKeadaan({ ...keadaan, laserMenyala: !keadaan.laserMenyala })}
          />
          <GeserVlab
            label="Sudut cermin"
            nilai={Math.round(keadaan.sudutCermin)}
            satuan="°"
            min={0}
            max={179}
            onUbah={(nilai) => setKeadaan(putarCermin(keadaan, nilai))}
          />
          <GeserVlab
            label="Laser — jarak mendatar"
            nilai={Math.round(keadaan.laser.x)}
            satuan=" cm"
            min={0}
            max={40}
            onUbah={(nilai) => setKeadaan(pindahLaser(keadaan, { ...keadaan.laser, x: nilai }))}
          />
          <GeserVlab
            label="Laser — tinggi"
            nilai={Math.round(keadaan.laser.y)}
            satuan=" cm"
            min={4}
            max={PANGGUNG_MIRROR.tinggi - 4}
            onUbah={(nilai) => setKeadaan(pindahLaser(keadaan, { ...keadaan.laser, y: nilai }))}
          />
          <GeserVlab
            label="Target — tinggi"
            nilai={Math.round(keadaan.target.y)}
            satuan=" cm"
            min={6}
            max={PANGGUNG_MIRROR.tinggi - 6}
            onUbah={(nilai) =>
              setKeadaan({ ...keadaan, target: { ...keadaan.target, y: nilai } })
            }
          />
        </>
      }
      bacaan={
        <>
          <p className={`vlab-status vlab-status--${hasil.kenaTarget ? 'berhasil' : 'gagal'}`}>
            {hasil.kenaTarget ? 'Sinar pantul mengenai target' : 'Sinar pantul belum mengenai target'}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Sudut datang', nilai: `${hasil.sudutDatang.toFixed(1)}°` },
              { label: 'Sudut pantul', nilai: `${hasil.sudutPantul.toFixed(1)}°` },
              { label: 'Arah sinar pantul', nilai: `${hasil.arahPantulGlobal.toFixed(0)}°` },
              { label: 'Meleset', nilai: `${hasil.jarakKeTarget.toFixed(1)} cm` },
            ]}
          />
        </>
      }
    />
  );
}
