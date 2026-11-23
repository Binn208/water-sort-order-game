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
    levelTitle: (lvl: number) => `Màn ${lvl}`,
    movesCount: (moves: number) => `${moves} bước`,
    undo: 'Hoàn tác',
    addJar: '+ Bình',
    hint: 'Gợi ý',
    winTitle: '🎉 Hoàn Thành Xuất Sắc!',
    winDesc: 'Tất cả các bạn mèo đều đã nhận được siro thơm ngon!',
    nextLevel: 'Tiếp tục (Màn kế)',
    stuckTitle: '🐾 Hết Nước Đi Rồi!',
    stuckDesc: 'Đừng lo, tiệm siro luôn có cách giúp bạn:',
    freeRescue: '🧪 Nhận Bình Rỗng Miễn Phí',
    undoPrev: '↩️ Hoàn Tác Nước Trước',
    restart: '🔄 Chơi Lại Màn Này',
    settingsTitle: '⚙️ Cài Đặt',
    sound: 'Âm thanh (SFX)',
    music: 'Nhạc nền (BGM)',
    colorblind: 'Chế độ Hỗ trợ Mù Màu',
    haptics: 'Rung (Haptics)',
    language: 'Ngôn ngữ',
    close: 'Đóng',
  },
  en: {
    levelTitle: (lvl: number) => `Level ${lvl}`,
    movesCount: (moves: number) => `${moves} moves`,
    undo: 'Undo',
    addJar: '+ Jar',
    hint: 'Hint',
    winTitle: '🎉 Level Cleared!',
    winDesc: 'All cute feline customers received their sweet syrups!',
    nextLevel: 'Continue (Next Level)',
    stuckTitle: '🐾 No Moves Left!',
    stuckDesc: "Don't worry, the cafe always has your back:",
    freeRescue: '🧪 Free Extra Rescue Jar',
    undoPrev: '↩️ Undo Previous Move',
    restart: '🔄 Restart Level',
    settingsTitle: '⚙️ Settings',
    sound: 'Sound Effects (SFX)',
    music: 'Background Music (BGM)',
    colorblind: 'Colorblind Assist Mode',
    haptics: 'Haptics (Vibration)',
    language: 'Language',
    close: 'Close',
  },
};
