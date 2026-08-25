/**
 * Mirror Lab — pemantulan cahaya pada cermin datar.
 *
 * Alat: laser, cermin datar yang dapat diputar, target.
 * Variabel: sudut cermin, posisi laser, posisi target.
 * Logika: vektor arah datang dipantulkan terhadap normal cermin
 * (d' = d − 2(d·n)n), lalu jarak terdekat sinar pantul ke target dihitung.
 * Sudut datang selalu sama dengan sudut pantul terhadap normal.
 */

export const PANGGUNG_MIRROR = { lebar: 100, tinggi: 70 };
/** Radius target; sinar dianggap mengenai target di dalam radius ini. */
export const RADIUS_TARGET = 5;

export interface Titik {
  x: number;
  y: number;
}

export interface KeadaanMirror {
  laser: Titik;
  /** Titik tumpu cermin (titik pantul geometris). */
  cermin: Titik;
  /** Orientasi bidang cermin dalam derajat, 0 = cermin mendatar. */
  sudutCermin: number;
  target: Titik;
  laserMenyala: boolean;
}

export interface HasilMirror {
  /** Sudut datang terhadap garis normal, derajat. */
  sudutDatang: number;
  /** Sudut pantul terhadap garis normal, derajat. Selalu = sudut datang. */
  sudutPantul: number;
  /** Arah sinar pantul dalam koordinat panggung, derajat. */
  arahPantulGlobal: number;
  titikPantul: Titik;
  /** Ujung sinar pantul untuk digambar. */
  ujungPantul: Titik;
  arahNormal: Titik;
  jarakKeTarget: number;
  kenaTarget: boolean;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_MIRROR: KeadaanMirror = {
  laser: { x: 10, y: 58 },
  cermin: { x: 50, y: 22 },
  sudutCermin: 25,
  target: { x: 90, y: 52 },
  laserMenyala: true,
};

const kePi = Math.PI / 180;

function normalkan(v: Titik): Titik {
  const panjang = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / panjang, y: v.y / panjang };
}

/** Memantulkan sinar laser pada cermin datar dan mengukur jarak ke target. */
export function hitungMirror(keadaan: KeadaanMirror): HasilMirror {
  const arahDatang = normalkan({
    x: keadaan.cermin.x - keadaan.laser.x,
    y: keadaan.cermin.y - keadaan.laser.y,
  });
  // Normal tegak lurus bidang cermin.
  const normal = normalkan({
    x: -Math.sin(keadaan.sudutCermin * kePi),
    y: -Math.cos(keadaan.sudutCermin * kePi),
  });
  const proyeksi = arahDatang.x * normal.x + arahDatang.y * normal.y;
  // Normal selalu diarahkan menghadap sinar datang agar sudut tidak negatif.
  const normalHadap = proyeksi > 0 ? { x: -normal.x, y: -normal.y } : normal;
  const proyeksiHadap = arahDatang.x * normalHadap.x + arahDatang.y * normalHadap.y;
  const arahPantul = normalkan({
    x: arahDatang.x - 2 * proyeksiHadap * normalHadap.x,
    y: arahDatang.y - 2 * proyeksiHadap * normalHadap.y,
  });

  const sudutDatang = Math.acos(Math.min(1, Math.abs(proyeksiHadap))) / kePi;
  const arahPantulGlobal = (Math.atan2(arahPantul.y, arahPantul.x) / kePi + 360) % 360;

  // Jarak terdekat sinar pantul (setengah garis) terhadap pusat target.
  const keTarget = {
    x: keadaan.target.x - keadaan.cermin.x,
    y: keadaan.target.y - keadaan.cermin.y,
  };
  const sepanjangSinar = keTarget.x * arahPantul.x + keTarget.y * arahPantul.y;
  const t = Math.max(0, sepanjangSinar);
  const terdekat = {
    x: keadaan.cermin.x + arahPantul.x * t,
    y: keadaan.cermin.y + arahPantul.y * t,
  };
  const jarakKeTarget = Math.hypot(keadaan.target.x - terdekat.x, keadaan.target.y - terdekat.y);
  const kenaTarget = keadaan.laserMenyala && jarakKeTarget <= RADIUS_TARGET;

  const panjangSinar = 70;
  return {
    sudutDatang,
    sudutPantul: sudutDatang,
    arahPantulGlobal,
    titikPantul: { ...keadaan.cermin },
    ujungPantul: {
      x: keadaan.cermin.x + arahPantul.x * panjangSinar,
      y: keadaan.cermin.y + arahPantul.y * panjangSinar,
    },
    arahNormal: normalHadap,
    jarakKeTarget,
    kenaTarget,
    observasi: keadaan.laserMenyala
      ? `Sudut datang ${sudutDatang.toFixed(0)}° dan sudut pantul ${sudutDatang.toFixed(0)}°; sinar pantul melesat ke arah ${arahPantulGlobal.toFixed(0)}° dan meleset ${jarakKeTarget.toFixed(1)} cm dari target.`
      : 'Laser mati, tidak ada sinar datang maupun sinar pantul.',
    kesimpulan: kenaTarget
      ? 'Target tercapai. Memutar cermin mengubah arah sinar pantul, sedangkan besar sudut pantul selalu sama dengan sudut datang.'
      : 'Putar cermin sedikit demi sedikit: setiap perubahan sudut cermin menggeser arah sinar pantul dua kali lipat besar putarannya.',
  };
}

/** Memutar cermin, dibatasi setengah putaran agar bidang cermin tetap unik. */
export function putarCermin(keadaan: KeadaanMirror, sudut: number): KeadaanMirror {
  return { ...keadaan, sudutCermin: ((sudut % 180) + 180) % 180 };
}

export function pindahLaser(keadaan: KeadaanMirror, titik: Titik): KeadaanMirror {
  return {
    ...keadaan,
    laser: {
      x: Math.min(PANGGUNG_MIRROR.lebar, Math.max(0, titik.x)),
      y: Math.min(PANGGUNG_MIRROR.tinggi, Math.max(0, titik.y)),
    },
  };
}
