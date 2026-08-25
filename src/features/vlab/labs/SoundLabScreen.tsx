import { useMemo, useState } from 'react';
import {
  KEADAAN_AWAL_SOUND,
  MEDIUM_BUNYI,
  gantiMediumBunyi,
  hitungSound,
} from '../../../lib/vlab/soundLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab, SaklarVlab } from '../KerangkaVlab';

export function SoundLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_SOUND);
  const hasil = useMemo(() => hitungSound(keadaan), [keadaan]);

  const jalur = hasil.bentukGelombang
    .map((titik, indeks) => `${indeks === 0 ? 'M' : 'L'} ${8 + titik.x * 0.84} ${32 - titik.y * 20}`)
    .join(' ');

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_SOUND)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggungGelap
      panggung={
        <svg
          viewBox="0 0 100 62"
          role="img"
          aria-label={`Gelombang bunyi ${keadaan.frekuensiHz} hertz pada ${hasil.medium.nama}`}
        >
          <rect width={100} height={62} fill="#0d1f2f" />
          <rect x={8} y={12} width={84} height={40} rx={3} fill={hasil.medium.warna} opacity={0.28} />
          <text x={50} y={9} fontSize={4} fill="#9fb6c8" textAnchor="middle">
            Tabung {hasil.medium.nama.toLowerCase()}
          </text>

          {/* Rapatan–renggangan partikel medium */}
          {hasil.medium.kecepatan > 0
            ? Array.from({ length: 42 }, (_, indeks) => {
                const dasar = 9 + indeks * 2;
                const fase = (indeks / 42) * Math.max(1, Math.round(keadaan.frekuensiHz / 120)) * 2 * Math.PI;
                const geser = Math.sin(fase) * (hasil.amplitudoDiterima / 100) * 1.6;
                return (
                  <circle
                    key={`partikel-${indeks}`}
                    cx={dasar + geser}
                    cy={46}
                    r={0.9}
                    fill="#6cc0f0"
                    opacity={0.75}
                  />
                );
              })
            : (
              <text x={50} y={47} fontSize={4} fill="#7f95a8" textAnchor="middle">
                tidak ada partikel perantara
              </text>
            )}

          {/* Bentuk gelombang */}
          <line x1={8} y1={32} x2={92} y2={32} stroke="#3a5164" strokeWidth={0.5} />
          <path d={jalur} fill="none" stroke={hasil.terdengar ? '#7ce0a8' : '#f2b230'} strokeWidth={1.2} />

          {/* Sumber getar dan penerima */}
          <rect x={2} y={24} width={6} height={16} rx={1.5} fill={keadaan.sumberBergetar ? '#f08a5d' : '#3a4a5a'} />
          <rect x={92} y={26} width={6} height={12} rx={1.5} fill={hasil.terdengar ? '#7ce0a8' : '#3a4a5a'} />
          <text x={5} y={45} fontSize={3} fill="#9fb6c8" textAnchor="middle">
            sumber
          </text>
          <text x={95} y={45} fontSize={3} fill="#9fb6c8" textAnchor="middle">
            telinga
          </text>
          <text x={50} y={59} fontSize={3.4} fill="#9fb6c8" textAnchor="middle">
            {keadaan.jarakMeter} meter
          </text>
        </svg>
      }
      kontrol={
        <>
          <SaklarVlab
            label="Sumber getar"
            aktif={keadaan.sumberBergetar}
            teksAktif="BERGETAR"
            teksMati="DIAM"
            onUbah={() => setKeadaan({ ...keadaan, sumberBergetar: !keadaan.sumberBergetar })}
          />
          <GeserVlab
            label="Frekuensi"
            nilai={keadaan.frekuensiHz}
            satuan=" Hz"
            min={5}
            max={24000}
            langkah={5}
            onUbah={(nilai) => setKeadaan({ ...keadaan, frekuensiHz: nilai })}
          />
          <GeserVlab
            label="Amplitudo"
            nilai={keadaan.amplitudo}
            satuan="%"
            min={0}
            max={100}
            langkah={5}
            onUbah={(nilai) => setKeadaan({ ...keadaan, amplitudo: nilai })}
          />
          <GeserVlab
            label="Jarak penerima"
            nilai={keadaan.jarakMeter}
            satuan=" m"
            min={1}
            max={60}
            onUbah={(nilai) => setKeadaan({ ...keadaan, jarakMeter: nilai })}
          />
          <label className="vlab-pilih-lengkap">
            Medium perambatan
            <select
              value={keadaan.mediumKode}
              onChange={(peristiwa) => setKeadaan(gantiMediumBunyi(keadaan, peristiwa.target.value))}
            >
              {MEDIUM_BUNYI.map((medium) => (
                <option key={medium.kode} value={medium.kode}>
                  {medium.nama}
                </option>
              ))}
            </select>
          </label>
        </>
      }
      bacaan={
        <>
          <p
            className={`vlab-status vlab-status--${hasil.terdengar ? 'berhasil' : 'gagal'}`}
            data-testid="sound-status"
          >
            {hasil.terdengar ? 'Bunyi terdengar' : 'Bunyi tidak terdengar'}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Cepat rambat', nilai: `${hasil.kecepatan} m/s` },
              { label: 'Panjang gelombang', nilai: `${hasil.panjangGelombang.toFixed(3)} m` },
              { label: 'Amplitudo diterima', nilai: `${hasil.amplitudoDiterima.toFixed(1)}%` },
              { label: 'Waktu tempuh', nilai: `${hasil.waktuTempuh.toFixed(4)} s` },
            ]}
          />
          <p className="vlab-observasi">{hasil.labelNada}</p>
        </>
      }
    />
  );
}
