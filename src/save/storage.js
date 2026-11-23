const STORAGE_KEY = 'meow_syrup_save_data_v1';
const DEFAULT_PROGRESS = {
    schemaVersion: 1,
    currentLevel: 1,
    highestUnlockedLevel: 1,
    coins: 100,
    tools: {
        undo: 5,
        addJar: 3,
        hint: 3,
    },
    levelStars: {},
    settings: {
        sound: true,
        music: true,
        colorblind: true,
        haptics: true,
        lang: 'vi',
    },
};
export class StorageService {
    static load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw)
                return { ...DEFAULT_PROGRESS };
            const parsed = JSON.parse(raw);
            if (parsed.schemaVersion === 1) {
                return {
                    ...DEFAULT_PROGRESS,
                    ...parsed,
                    tools: { ...DEFAULT_PROGRESS.tools, ...parsed.tools },
                    settings: { ...DEFAULT_PROGRESS.settings, ...parsed.settings },
                };
            }
        }
        catch (err) {
            console.warn('Failed to parse save data, falling back to default:', err);
        }
        return { ...DEFAULT_PROGRESS };
    }
    static save(progress) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        }
        catch (err) {
            console.error('Failed to save progress to localStorage:', err);
        }
    }
    static reset() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        }
        catch (err) {
            console.error('Failed to reset storage:', err);
        }
    }
}
