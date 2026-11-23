export interface ColorTheme {
  name: string;
  hex: string;
  symbol: string;
}

export const COLOR_MAP: Record<string, ColorTheme> = {
  strawberry: { name: 'Dâu Tây', hex: '#FF4B72', symbol: '●' },
  blueberry: { name: 'Việt Quất', hex: '#3388FF', symbol: '✦' },
  orange: { name: 'Cam Tươi', hex: '#FF9900', symbol: '☀' },
  kiwi: { name: 'Kiwi Xanh', hex: '#2ECC71', symbol: '♣' },
  grape: { name: 'Nho Tím', hex: '#9B59B6', symbol: '▲' },
  lemon: { name: 'Chanh Vàng', hex: '#F1C40F', symbol: '☾' },
  peach: { name: 'Đào Hồng', hex: '#FF8A80', symbol: '♥' },
  mint: { name: 'Bạc Hà Băng', hex: '#1ABC9C', symbol: '❄' },
  chocolate: { name: 'Cacao Đậm', hex: '#795548', symbol: '■' },
  vanilla: { name: 'Vani Kem', hex: '#E0D0B0', symbol: '☁' },
};

export const CUSTOMER_AVATARS: Record<string, { name: string; avatar: string }> = {
  cat_mochi: { name: 'Mochi (Mèo Cam)', avatar: '🐱' },
  cat_mimi: { name: 'Mimi (Mèo Xiêm)', avatar: '😸' },
  cat_boba: { name: 'Boba (Mèo Ba Thể)', avatar: '😽' },
  cat_luna: { name: 'Luna (Mèo Mướp)', avatar: '😻' },
  cat_simba: { name: 'Simba (Mèo Vàng)', avatar: '🦁' },
  cat_oliver: { name: 'Oliver (Mèo Xám)', avatar: '😺' },
  cat_milo: { name: 'Milo (Mèo Đen)', avatar: '🐈‍⬛' },
  cat_chloe: { name: 'Chloe (Mèo Trắng)', avatar: '🐈' },
  cat_felix: { name: 'Felix (Bé Corgi)', avatar: '🐶' },
  cat_nami: { name: 'Nami (Mèo Béo)', avatar: '🐾' },
};
