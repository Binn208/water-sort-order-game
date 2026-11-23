import viStrings from '../../shared/i18n/vi.json';
import enStrings from '../../shared/i18n/en.json';

export interface TranslationStrings {
  levelTitle: (lvl: number) => string;
  movesCount: (moves: number) => string;
  undo: string;
  addJar: string;
  hint: string;
  winTitle: string;
  winDesc: string;
  nextLevel: string;
  stuckTitle: string;
  stuckDesc: string;
  freeRescue: string;
  undoPrev: string;
  restart: string;
  settingsTitle: string;
  sound: string;
  music: string;
  colorblind: string;
  haptics: string;
  language: string;
  close: string;
}

export const TRANSLATIONS: Record<string, TranslationStrings> = {
  vi: {
    ...viStrings,
    levelTitle: (lvl: number) => viStrings.levelTitle.replace('{lvl}', String(lvl)),
    movesCount: (moves: number) => viStrings.movesCount.replace('{moves}', String(moves)),
  },
  en: {
    ...enStrings,
    levelTitle: (lvl: number) => enStrings.levelTitle.replace('{lvl}', String(lvl)),
    movesCount: (moves: number) => enStrings.movesCount.replace('{moves}', String(moves)),
  },
};
