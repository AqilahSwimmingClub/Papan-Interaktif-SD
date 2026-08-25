import { useMemo, useState } from 'react';
import {
  JENIS_TANAH,
  KEADAAN_AWAL_EROSION,
  hitungErosion,
} from '../../../lib/vlab/erosionLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab, SaklarVlab } from '../KerangkaVlab';

export function ErosionLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_EROSION);
  const hasil = useMemo(() => hitungErosion(keadaan), [keadaan]);

  // Tinggi ujung lereng mengikuti sudut kemiringan yang dipilih.
  const naik = Math.tan((keadaan.kemiringan * Math.PI) / 180) * 46;
  const puncak = Math.max(6, 44 - naik);
  const jumlahPohon = Math.round((keadaan.vegetasiPersen / 100) * 9);
  const warnaAir = `rgb(${120 + hasil.kekeruhan}, ${Math.max(60, 150 - hasil.kekeruhan)}, ${Math.max(50, 130 - hasil.kekeruhan)})`;

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_EROSION)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggung={
        <svg
          viewBox="0 0 100 68"
          role="img"
          aria-label={`Erosi ${hasil.tanahTerkikis.toFixed(2)} ton per hektar, kekeruhan air ${hasil.kekeruhan.toFixed(0)} persen`}
        >
          <rect width={100} height={68} fill="#e8f1f7" />

          {/* Hujan */}
          {keadaan.hujanMenyala
            ? Array.from({ length: Math.round(keadaan.curahHujan / 4) }, (_, indeks) => (
                <line
                  key={`hujan-${indeks}`}
                  x1={6 + ((indeks * 13) % 84)}
                  y1={2 + ((indeks * 7) % 12)}
                  x2={4 + ((indeks * 13) % 84)}
                  y2={8 + ((indeks * 7) % 12)}
                  stroke="#5aa9e6"
                  strokeWidth={0.8}
                />
              ))
            : null}

          {/* Lereng tanah */}
          <polygon points={`8,${puncak} 60,44 60,58 8,58`} fill={hasil.tanah.warna} />
          {/* Lapisan subur yang tersisa */}
          <polygon
            points={`8,${puncak} 60,44 60,${44 + (2.6 * hasil.sisaLapisanSubur) / 100} 8,${puncak + (2.6 * hasil.sisaLapisanSubur) / 100}`}
            fill="#3f5136"
            opacity={0.85}
          />

          {/* Vegetasi */}
          {Array.from({ length: jumlahPohon }, (_, indeks) => {
            const t = (indeks + 0.5) / Math.max(1, jumlahPohon);
            const x = 10 + t * 48;
            const y = puncak + t * (44 - puncak);
            return (
              <g key={`pohon-${indeks}`}>
                <rect x={x - 0.4} y={y - 3} width={0.8} height={3} fill="#6b4a2c" />
                <circle cx={x} cy={y - 4} r={2.4} fill="#4f9e51" />
              </g>
            );
          })}

          {/* Aliran limpasan */}
          {hasil.limpasan > 0 ? (
            <polygon
              points={`60,44 60,${44 + Math.min(9, hasil.limpasan / 4)} 72,58 72,52`}
              fill={warnaAir}
              opacity={0.85}
            />
          ) : null}

          {/* Penampung air */}
          <rect x={70} y={44} width={22} height={18} rx={1.6} fill="#ffffff" stroke="#a8bac6" />
          <rect
            x={71}
            y={50}
            width={20}
            height={11}
            fill={warnaAir}
          />
          <text x={81} y={42} fontSize={3.4} fill="#4a5c6b" textAnchor="middle">
            air tampungan
          </text>
          <text x={81} y={57} fontSize={3.4} fill="#fff" textAnchor="middle">
            keruh {hasil.kekeruhan.toFixed(0)}%
          </text>

          {/* Busur kemiringan */}
          <line x1={8} y1={58} x2={60} y2={58} stroke="#8a99a5" strokeWidth={0.5} />
          <text x={20} y={64} fontSize={3.4} fill="#4a5c6b">
            kemiringan {keadaan.kemiringan}°
          </text>
        </svg>
      }
      kontrol={
        <>
          <SaklarVlab
            label="Penyiram hujan"
            aktif={keadaan.hujanMenyala}
            onUbah={() => setKeadaan({ ...keadaan, hujanMenyala: !keadaan.hujanMenyala })}
          />
          <GeserVlab
            label="Curah hujan"
            nilai={keadaan.curahHujan}
            satuan=" mm/jam"
            min={0}
            max={140}
            langkah={5}
            onUbah={(nilai) => setKeadaan({ ...keadaan, curahHujan: nilai })}
          />
          <GeserVlab
            label="Kemiringan lereng"
            nilai={keadaan.kemiringan}
            satuan="°"
            min={0}
            max={55}
            onUbah={(nilai) => setKeadaan({ ...keadaan, kemiringan: nilai })}
          />
          <GeserVlab
            label="Tutupan vegetasi"
            nilai={keadaan.vegetasiPersen}
            satuan="%"
            min={0}
            max={100}
            langkah={5}
            onUbah={(nilai) => setKeadaan({ ...keadaan, vegetasiPersen: nilai })}
          />
          <GeserVlab
            label="Lama pengamatan"
            nilai={keadaan.durasiMenit}
            satuan=" menit"
            min={5}
            max={120}
            langkah={5}
            onUbah={(nilai) => setKeadaan({ ...keadaan, durasiMenit: nilai })}
          />
          <label className="vlab-pilih-lengkap">
            Jenis tanah
            <select
              value={keadaan.tanahKode}
              onChange={(peristiwa) => setKeadaan({ ...keadaan, tanahKode: peristiwa.target.value })}
            >
              {JENIS_TANAH.map((tanah) => (
                <option key={tanah.kode} value={tanah.kode}>
                  {tanah.nama}
                </option>
              ))}
            </select>
          </label>
        </>
      }
      bacaan={
        <>
          <p
            className={`vlab-status vlab-status--${
              hasil.tingkat === 'sangat_ringan' || hasil.tingkat === 'ringan'
                ? 'berhasil'
                : hasil.tingkat === 'sedang'
                  ? 'netral'
                  : 'gagal'
            }`}
            data-testid="erosion-tingkat"
          >
            {hasil.labelTingkat}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Limpasan air', nilai: `${hasil.limpasan.toFixed(1)} mm/jam` },
              { label: 'Tanah terkikis', nilai: `${hasil.tanahTerkikis.toFixed(2)} ton/ha` },
              { label: 'Kekeruhan air', nilai: `${hasil.kekeruhan.toFixed(0)}%` },
              { label: 'Sisa lapisan subur', nilai: `${hasil.sisaLapisanSubur.toFixed(0)}%` },
            ]}
          />
        </>
      }
    />
  );
}
