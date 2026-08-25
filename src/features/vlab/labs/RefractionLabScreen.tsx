import { useMemo, useState } from 'react';
import {
  MEDIUM_TERSEDIA,
  KEADAAN_AWAL_REFRACTION,
  hitungRefraction,
  ubahSudutDatang,
} from '../../../lib/vlab/refractionLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab, SaklarVlab } from '../KerangkaVlab';

const BATAS_Y = 32;
const TITIK_X = 50;

export function RefractionLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_REFRACTION);
  const hasil = useMemo(() => hitungRefraction(keadaan), [keadaan]);

  const rad = Math.PI / 180;
  const panjang = 34;
  // Sinar datang menuju titik batas dari kiri atas.
  const awalDatang = {
    x: TITIK_X - Math.sin(keadaan.sudutDatang * rad) * panjang,
    y: BATAS_Y - Math.cos(keadaan.sudutDatang * rad) * panjang,
  };
  const ujungBias = hasil.sudutBias === null
    ? null
    : {
        x: TITIK_X + Math.sin(hasil.sudutBias * rad) * panjang,
        y: BATAS_Y + Math.cos(hasil.sudutBias * rad) * panjang,
      };
  const ujungPantul = {
    x: TITIK_X + Math.sin(keadaan.sudutDatang * rad) * panjang,
    y: BATAS_Y - Math.cos(keadaan.sudutDatang * rad) * panjang,
  };

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_REFRACTION)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggung={
        <svg
          viewBox="0 0 100 68"
          role="img"
          aria-label={`Sudut datang ${keadaan.sudutDatang} derajat, sudut bias ${hasil.sudutBias?.toFixed(1) ?? 'tidak ada'} derajat`}
        >
          <rect width={100} height={BATAS_Y} fill={hasil.mediumAtas.warna} />
          <rect y={BATAS_Y} width={100} height={68 - BATAS_Y} fill={hasil.mediumBawah.warna} />
          <line x1={0} y1={BATAS_Y} x2={100} y2={BATAS_Y} stroke="#35485a" strokeWidth={0.8} />

          <text x={4} y={7} fontSize={4} fill="#35485a">
            {hasil.mediumAtas.nama} · n = {hasil.mediumAtas.indeks.toFixed(2)}
          </text>
          <text x={4} y={65} fontSize={4} fill="#1f3040">
            {hasil.mediumBawah.nama} · n = {hasil.mediumBawah.indeks.toFixed(2)}
          </text>

          {/* Garis normal */}
          <line
            x1={TITIK_X}
            y1={2}
            x2={TITIK_X}
            y2={66}
            stroke="#35485a"
            strokeWidth={0.6}
            strokeDasharray="2.4 2"
          />
          <text x={TITIK_X + 2} y={6} fontSize={3.2} fill="#35485a">
            normal
          </text>

          {keadaan.laserMenyala ? (
            <>
              {/* Sinar datang */}
              <line
                x1={awalDatang.x}
                y1={awalDatang.y}
                x2={TITIK_X}
                y2={BATAS_Y}
                stroke="#d83a3a"
                strokeWidth={1.5}
              />
              {/* Sinar pantul lemah selalu ada; menguat saat pemantulan sempurna */}
              <line
                x1={TITIK_X}
                y1={BATAS_Y}
                x2={ujungPantul.x}
                y2={ujungPantul.y}
                stroke="#d83a3a"
                strokeWidth={hasil.pemantulanSempurna ? 1.5 : 0.7}
                opacity={hasil.pemantulanSempurna ? 1 : 0.35}
              />
              {/* Sinar bias */}
              {ujungBias ? (
                <line
                  x1={TITIK_X}
                  y1={BATAS_Y}
                  x2={ujungBias.x}
                  y2={ujungBias.y}
                  stroke="#1b5e8c"
                  strokeWidth={1.6}
                />
              ) : null}
              <circle cx={TITIK_X} cy={BATAS_Y} r={1.5} fill="#1a2733" />

              {/* Busur sudut */}
              <path
                d={`M ${TITIK_X - 10} ${BATAS_Y} A 10 10 0 0 1 ${TITIK_X - Math.sin(keadaan.sudutDatang * rad) * 10} ${BATAS_Y - Math.cos(keadaan.sudutDatang * rad) * 10}`}
                fill="none"
                stroke="#d83a3a"
                strokeWidth={0.6}
              />
              <text
                x={TITIK_X - 13}
                y={BATAS_Y - 5}
                fontSize={3.6}
                fill="#a02a2a"
                textAnchor="middle"
              >
                {keadaan.sudutDatang.toFixed(0)}°
              </text>
              {hasil.sudutBias !== null ? (
                <text
                  x={TITIK_X + 13}
                  y={BATAS_Y + 9}
                  fontSize={3.6}
                  fill="#12405e"
                  textAnchor="middle"
                >
                  {hasil.sudutBias.toFixed(0)}°
                </text>
              ) : null}
            </>
          ) : null}
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
            label="Sudut datang"
            nilai={keadaan.sudutDatang}
            satuan="°"
            min={0}
            max={89}
            onUbah={(nilai) => setKeadaan(ubahSudutDatang(keadaan, nilai))}
          />
          <label className="vlab-pilih-lengkap">
            Medium atas
            <select
              value={keadaan.mediumAtasKode}
              onChange={(peristiwa) =>
                setKeadaan({ ...keadaan, mediumAtasKode: peristiwa.target.value })
              }
            >
              {MEDIUM_TERSEDIA.map((medium) => (
                <option key={medium.kode} value={medium.kode}>
                  {medium.nama} (n = {medium.indeks})
                </option>
              ))}
            </select>
          </label>
          <label className="vlab-pilih-lengkap">
            Medium bawah
            <select
              value={keadaan.mediumBawahKode}
              onChange={(peristiwa) =>
                setKeadaan({ ...keadaan, mediumBawahKode: peristiwa.target.value })
              }
            >
              {MEDIUM_TERSEDIA.map((medium) => (
                <option key={medium.kode} value={medium.kode}>
                  {medium.nama} (n = {medium.indeks})
                </option>
              ))}
            </select>
          </label>
        </>
      }
      bacaan={
        <>
          <p
            className={`vlab-status vlab-status--${hasil.pemantulanSempurna ? 'gagal' : 'netral'}`}
            data-testid="refraction-arah"
          >
            {hasil.pemantulanSempurna ? 'Pemantulan sempurna' : hasil.labelArah}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Sudut datang', nilai: `${keadaan.sudutDatang.toFixed(0)}°` },
              {
                label: 'Sudut bias',
                nilai: hasil.sudutBias === null ? '—' : `${hasil.sudutBias.toFixed(1)}°`,
              },
              {
                label: 'Sudut kritis',
                nilai: hasil.sudutKritis === null ? 'tidak ada' : `${hasil.sudutKritis.toFixed(1)}°`,
              },
              {
                label: 'Laju di medium bawah',
                nilai: `${(hasil.lajuRelatifBawah * 100).toFixed(0)}% c`,
              },
            ]}
          />
        </>
      }
    />
  );
}
