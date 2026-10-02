export interface PaletteColors {
  canvas: string;      // Background page
  cardBg: string;      // Central container background
  charcoal: string;    // Main text
  taupe: string;       // Secondary text
  gold: string;        // Accent / Brass
  wax: string;         // Wax seal color
  selectedTint: string;// Highlighted card background
  border: string;      // Hairline border
}

export interface ThemePreset {
  id: string;
  name: string;
  subtitle: string;
  palette: PaletteColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "alabaster",
    name: "Alabaster Classic",
    subtitle: "Giấy lụa ấm & mực than đá (Mặc định)",
    palette: {
      canvas: "#F9F6F0",
      cardBg: "#FAF8F5",
      charcoal: "#1C1917",
      taupe: "#57534E",
      gold: "#9E7D4B",
      wax: "#7A2021",
      selectedTint: "#F2ECE1",
      border: "#E7E5E4",
    },
  },
  {
    id: "midnight",
    name: "Midnight & Gold",
    subtitle: "Đêm huyền bí & ánh kim sang trọng",
    palette: {
      canvas: "#141413",
      cardBg: "#1C1B19",
      charcoal: "#F5F3EF",
      taupe: "#A8A29E",
      gold: "#D4AF37",
      wax: "#8A1C22",
      selectedTint: "#2B2824",
      border: "#383531",
    },
  },
  {
    id: "matcha-linen",
    name: "Sage & Warm Linen",
    subtitle: "Xanh xô thơm nhẹ nhàng & đồng cổ",
    palette: {
      canvas: "#F4F5F0",
      cardBg: "#FAFAF7",
      charcoal: "#232F1E",
      taupe: "#52634C",
      gold: "#A37A4C",
      wax: "#5C2427",
      selectedTint: "#E7EAE0",
      border: "#D8DCD0",
    },
  },
  {
    id: "rose-cashmere",
    name: "Rose & Cashmere",
    subtitle: "Màu kem phớt hồng & vang bordeaux",
    palette: {
      canvas: "#FBF7F5",
      cardBg: "#FCF9F7",
      charcoal: "#2C1E21",
      taupe: "#6E5B5E",
      gold: "#B07D62",
      wax: "#781D2E",
      selectedTint: "#F4EAE6",
      border: "#EADCD7",
    },
  },
];

export function getThemeById(id?: string, customPalette?: PaletteColors): ThemePreset {
  if (id === "custom" && customPalette) {
    return {
      id: "custom",
      name: "Tùy biến riêng",
      subtitle: "Bảng màu phối cá nhân",
      palette: customPalette,
    };
  }
  const found = THEME_PRESETS.find((t) => t.id === id);
  return found || THEME_PRESETS[0];
}
