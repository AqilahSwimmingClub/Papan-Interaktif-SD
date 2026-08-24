import type { ButirGame, GameEngine, ModePermainanGame } from '../../lib/types';
import { InteractiveGameStage } from '../game/InteractiveGameStage';

interface Properti {
  content: ButirGame;
  world: GameEngine;
  mapelKode: string;
  mode: ModePermainanGame;
  jumlahTim: number;
  onComplete: (jawaban: string, tim: number) => void;
}

/**
 * Kontrak reusable GIM EDU IPAS. World/mekanik datang dari katalog engine,
 * content dari topik aktif, sedangkan level, skor, reward, dan victory dikelola runner.
 */
export function EduGameEngine({ content, world, mapelKode, mode, jumlahTim, onComplete }: Properti) {
  return <div data-testid="edu-game-engine" data-world={world.kode} data-mechanic={content.mekanik_anak}>
    <InteractiveGameStage butir={content} engine={world} mapelKode={mapelKode} mode={mode} jumlahTim={jumlahTim} onJawab={onComplete}/>
  </div>;
}
