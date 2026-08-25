import { useMemo, useState } from 'react';
import {
  JARI_LUBANG,
  KEADAAN_AWAL_LIGHT_RAY,
  LEBAR_PANGGUNG_LIGHT_RAY,
  TINGGI_PANGGUNG_LIGHT_RAY,
  geserLubang,
  geserPapan,
  hitungLightRay,
  sejajarkanSemuaLubang,
} from '../../../lib/vlab/lightRayLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab, SaklarVlab } from '../KerangkaVlab';

/** Panggung digambar terbalik karena sumbu SVG tumbuh ke bawah. */
function keY(tinggi: number): number {
  return TINGGI_PANGGUNG_LIGHT_RAY - tinggi;
}

export function LightRayLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_LIGHT_RAY);
  const hasil = useMemo(() => hitungLightRay(keadaan), [keadaan]);

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_LIGHT_RAY)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      aksiTambahan={
        <button
          className="vlab-tombol"
          type="button"
          onClick={() => setKeadaan(sejajarkanSemuaLubang(keadaan))}
        >
          Sejajarkan semua lubang
        </button>
      }
      panggung={
        <svg
          viewBox={`-6 -6 ${LEBAR_PANGGUNG_LIGHT_RAY + 24} ${TINGGI_PANGGUNG_LIGHT_RAY + 12}`}
          role="img"
          aria-label={`Berkas cahaya berhenti pada jarak ${hasil.jarakBerkasBerhenti.toFixed(0)} cm`}
        >
          <rect
            x={-6}
            y={-6}
            width={LEBAR_PANGGUNG_LIGHT_RAY + 24}
            height={TINGGI_PANGGUNG_LIGHT_RAY + 12}
            fill="#0d1f2f"
          />

          {/* Layar target */}
          <rect
            x={keadaan.jarakLayar}
            y={0}
            width={5}
            height={TINGGI_PANGGUNG_LIGHT_RAY}
            fill={hasil.sampaiLayar ? '#fdf5d8' : '#3a4a5a'}
            rx={1}
          />
          {hasil.sampaiLayar ? (
            <circle
              cx={keadaan.jarakLayar + 2.5}
              cy={keY(keadaan.tinggiSenter)}
              r={5.5}
              fill="#ffe680"
              opacity={0.95}
            />
          ) : null}

          {/* Berkas cahaya */}
          {hasil.lintasan.length === 2 ? (
            <>
              <line
                x1={hasil.lintasan[0]!.jarak}
                y1={keY(hasil.lintasan[0]!.tinggi)}
                x2={hasil.lintasan[1]!.jarak}
                y2={keY(hasil.lintasan[1]!.tinggi)}
                stroke="#ffe680"
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.28}
              />
              <line
                x1={hasil.lintasan[0]!.jarak}
                y1={keY(hasil.lintasan[0]!.tinggi)}
                x2={hasil.lintasan[1]!.jarak}
                y2={keY(hasil.lintasan[1]!.tinggi)}
                stroke="#fff6c9"
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            </>
          ) : null}

          {/* Papan berlubang */}
          {[...keadaan.papan]
            .sort((a, b) => a.jarak - b.jarak)
            .map((papan, indeks) => {
              const atas = keY(papan.tinggiLubang + JARI_LUBANG);
              const bawah = keY(papan.tinggiLubang - JARI_LUBANG);
              const menghalangi = hasil.papanPenghalang === indeks;
              return (
                <g key={papan.id}>
                  <rect x={papan.jarak} y={0} width={3.4} height={atas} fill={menghalangi ? '#c9553a' : '#8fa3b4'} />
                  <rect
                    x={papan.jarak}
                    y={bawah}
                    width={3.4}
                    height={TINGGI_PANGGUNG_LIGHT_RAY - bawah}
                    fill={menghalangi ? '#c9553a' : '#8fa3b4'}
                  />
                  <text x={papan.jarak + 1.7} y={TINGGI_PANGGUNG_LIGHT_RAY + 4} fill="#9fb6c8" fontSize={3.4} textAnchor="middle">
                    {indeks + 1}
                  </text>
                </g>
              );
            })}

          {/* Senter */}
          <g>
            <rect x={-5} y={keY(keadaan.tinggiSenter) - 3.5} width={9} height={7} rx={1.5} fill="#4a5c6b" />
            <rect
              x={3}
              y={keY(keadaan.tinggiSenter) - 2.2}
              width={3}
              height={4.4}
              fill={keadaan.senterMenyala ? '#ffe680' : '#2c3a47'}
            />
          </g>
        </svg>
      }
      kontrol={
        <>
          <SaklarVlab
            label="Senter"
            aktif={keadaan.senterMenyala}
            onUbah={() => setKeadaan({ ...keadaan, senterMenyala: !keadaan.senterMenyala })}
          />
          <GeserVlab
            label="Tinggi senter"
            nilai={keadaan.tinggiSenter}
            satuan=" cm"
            min={6}
            max={TINGGI_PANGGUNG_LIGHT_RAY - 6}
            onUbah={(nilai) => setKeadaan({ ...keadaan, tinggiSenter: nilai })}
          />
          {keadaan.papan.map((papan, indeks) => (
            <GeserVlab
              key={`lubang-${papan.id}`}
              label={`Lubang papan ${indeks + 1}`}
              nilai={papan.tinggiLubang}
              satuan=" cm"
              min={4}
              max={TINGGI_PANGGUNG_LIGHT_RAY - 4}
              onUbah={(nilai) => setKeadaan(geserLubang(keadaan, papan.id, nilai))}
            />
          ))}
          {keadaan.papan.map((papan, indeks) => (
            <GeserVlab
              key={`jarak-${papan.id}`}
              label={`Jarak papan ${indeks + 1}`}
              nilai={papan.jarak}
              satuan=" cm"
              min={8}
              max={keadaan.jarakLayar - 4}
              onUbah={(nilai) => setKeadaan(geserPapan(keadaan, papan.id, nilai))}
            />
          ))}
        </>
      }
      panggungGelap
      bacaan={
        <>
          <p className={`vlab-status vlab-status--${hasil.sampaiLayar ? 'berhasil' : 'gagal'}`}>
            {hasil.sampaiLayar ? 'Cahaya sampai layar' : 'Cahaya terhalang papan'}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Papan dilewati', nilai: `${hasil.papanLolos} / ${keadaan.papan.length}` },
              {
                label: 'Berkas berhenti',
                nilai: `${hasil.jarakBerkasBerhenti.toFixed(0)} cm`,
              },
              {
                label: 'Simpangan terbesar',
                nilai: `${Math.max(...hasil.simpangan, 0).toFixed(1)} cm`,
              },
            ]}
          />
          <ul className="vlab-daftar-ringkas">
            {hasil.simpangan.map((nilai, indeks) => (
              <li key={`simpangan-${indeks}`}>
                Papan {indeks + 1}: simpangan {nilai.toFixed(1)} cm —{' '}
                {nilai <= JARI_LUBANG ? 'cahaya lewat' : 'cahaya tertahan'}
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}
