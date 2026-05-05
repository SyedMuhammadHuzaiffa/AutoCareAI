/** Global theme tokens — spacing, typography, dark & light palettes */

export const spacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const typography = {
  titleHero: { fontSize: 28, fontWeight: "800" as const },
  title: { fontSize: 18, fontWeight: "700" as const },
  subtitle: { fontSize: 14, fontWeight: "400" as const },
  label: { fontSize: 12, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const },
};

export const radius = { sm: 12, md: 16, lg: 20 };

export type ThemeColors = {
  bg: string;
  bgElevated: string;
  card: string;
  cardElevated: string;
  border: string;
  text: string;
  textSecondary: string;
  label: string;
  muted: string;
  accent: string;
  accentMuted: string;
  danger: string;
  success: string;
  inputBg: string;
  inputBorder: string;
  tabBar: string;
  tabBarBorder: string;
};

export const darkColors: ThemeColors = {
  bg: "#070A0E",
  bgElevated: "#0B0F14",
  card: "#101622",
  cardElevated: "#121826",
  border: "#1B2436",
  text: "#F4F6FB",
  textSecondary: "#8B95A8",
  label: "#5C6575",
  muted: "#6B7280",
  accent: "#6366F1",
  accentMuted: "#A5B4FC",
  danger: "#B91C1C",
  success: "#059669",
  inputBg: "#121826",
  inputBorder: "#1F2937",
  tabBar: "#070A0E",
  tabBarBorder: "#1B2436",
};

export const lightColors: ThemeColors = {
  bg: "#F3F4F6",
  bgElevated: "#FFFFFF",
  card: "#FFFFFF",
  cardElevated: "#F9FAFB",
  border: "#E5E7EB",
  text: "#111827",
  textSecondary: "#4B5563",
  label: "#6B7280",
  muted: "#9CA3AF",
  accent: "#4F46E5",
  accentMuted: "#818CF8",
  danger: "#DC2626",
  success: "#059669",
  inputBg: "#FFFFFF",
  inputBorder: "#D1D5DB",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E5E7EB",
};

export type ThemeMode = "light" | "dark";
