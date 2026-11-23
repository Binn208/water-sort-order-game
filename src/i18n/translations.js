import viStrings from '../../shared/i18n/vi.json';
import enStrings from '../../shared/i18n/en.json';
export const TRANSLATIONS = {
    vi: {
        ...viStrings,
        levelTitle: (lvl) => viStrings.levelTitle.replace('{lvl}', String(lvl)),
        movesCount: (moves) => viStrings.movesCount.replace('{moves}', String(moves)),
    },
    en: {
        ...enStrings,
        levelTitle: (lvl) => enStrings.levelTitle.replace('{lvl}', String(lvl)),
        movesCount: (moves) => enStrings.movesCount.replace('{moves}', String(moves)),
    },
};
