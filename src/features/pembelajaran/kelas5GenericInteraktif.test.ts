import { describe, expect, it } from 'vitest';
import { PROFIL_INTERAKTIF_KELAS5 } from './kelas5GenericInteraktif';

const MAPEL = ['MAT', 'PP', 'BI', 'BING'] as const;

describe('profil interaktif mapel kelas 5', () => {
  it.each(MAPEL)('%s punya minimal lima game dan lima lab berbeda', (kode) => {
    const profil = PROFIL_INTERAKTIF_KELAS5[kode];
    expect(profil.game).toHaveLength(5);
    expect(profil.lab).toHaveLength(5);
    expect(new Set(profil.game.map((item) => item.kode)).size).toBe(5);
    expect(new Set(profil.game.map((item) => item.mekanik)).size).toBe(5);
    expect(new Set(profil.lab.map((item) => item.kode)).size).toBe(5);
    expect(new Set(profil.lab.map((item) => item.mekanik)).size).toBe(5);
  });
});
