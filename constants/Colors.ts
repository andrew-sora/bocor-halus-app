// Token warna Bocor Halus Gen Z Edition - Clean, Warm & Aesthetic
export const C = {
  cream: "#FAF7F2",       // Warm Soft Cream Background
  creamDark: "#F3ECE1",   // Elevated Card Background
  greenDark: "#064E3B",   // Deep Emerald Primary
  greenLight: "#10B981",  // Fresh Mint Accent
  greenSoft: "#D1FAE5",   // Soft Mint Badge Background
  ink: "#0F172A",         // Slate 900 Typography
  inkLight: "#334155",    // Slate 700 Secondary
  muted: "#64748B",       // Slate 500 Subtitle
  mutedBg: "#E2E8F0",     // Slate 200 Border/Bg
  danger: "#E11D48",      // Rose Danger
  dangerBg: "#FFE4E6",    // Soft Rose Background
  warning: "#D97706",     // Amber Warning
  warningBg: "#FEF3C7",   // Soft Amber Background
  border: "#E2DDD6",      // Soft Neutral Border
  white: "#FFFFFF",       // Pure White Card
  cardBg: "#FFFFFF",      // Card Background
  shadow: "rgba(15, 23, 42, 0.06)",
  shadowStrong: "rgba(15, 23, 42, 0.12)",
};

export type CategoryTag = {
  id: string;
  label: string;
  emoji: string;
  bg: string;
  color: string;
};

export const CATEGORIES: CategoryTag[] = [
  { id: "dapur", label: "Belanja Dapur", emoji: "🛒", bg: "#FEF3C7", color: "#92400E" },
  { id: "jajan", label: "Jajan & Kopi", emoji: "☕", bg: "#FEE2E2", color: "#991B1B" },
  { id: "anak", label: "Susu & Anak", emoji: "🍼", bg: "#FCE7F3", color: "#9D174D" },
  { id: "tagihan", label: "Listrik & Rutin", emoji: "⚡", bg: "#E0E7FF", color: "#3730A3" },
  { id: "transport", label: "Bensin & Ojol", emoji: "🛵", bg: "#E0F2FE", color: "#075985" },
  { id: "lainnya", label: "Lain-lain", emoji: "✨", bg: "#ECFDF5", color: "#065F46" },
];

export function getCategoryById(id?: string): CategoryTag {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[5]; // Default: Lain-lain
}
