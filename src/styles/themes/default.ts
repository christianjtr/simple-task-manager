import { setTwoToneColor } from "@ant-design/icons";
import type { ThemeMode } from "@src/hooks/useTheme";
import { theme as antdTheme, type ThemeConfig } from "antd";

const BRAND_COLOR = "#6366f1";
const DARK_BRAND_COLOR = "#818cf8";
const WHITE_COLOR = "#ffffff";

const sharedTokens = {
  wireframe: false,
  fontSize: 14,
  borderRadius: 8,
  colorWhite: WHITE_COLOR,
  colorBgMask: "rgba(15,23,42,0.55)",
  colorSuccess: "#059669",
  colorWarning: "#d97706",
  colorError: "#dc2626",
  fontFamily:
    "Inter, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'",
} as const;

const lightTokens = {
  colorPrimary: BRAND_COLOR,
  colorLink: BRAND_COLOR,
  colorInfo: BRAND_COLOR,
  colorLinkHover: "#4f46e5",
  colorTextBase: "#0f172a",
  colorTextSecondary: "#64748b",
  colorBgBase: WHITE_COLOR,
  colorBgLayout: "#f8fafc",
} as const;

const darkTokens = {
  colorPrimary: DARK_BRAND_COLOR,
  colorLink: DARK_BRAND_COLOR,
  colorInfo: DARK_BRAND_COLOR,
  colorLinkHover: "#a5b4fc",
  colorTextBase: "#e2e8f0",
  colorTextSecondary: "#94a3b8",
  colorBgBase: "#0f172a",
  colorBgLayout: "#020617",
  colorBgMask: "rgba(2,6,23,0.7)",
} as const;

const baseTheme: ThemeConfig = {
  hashed: false,
  token: sharedTokens,
};

export function getThemeConfig(mode: ThemeMode): ThemeConfig {
  const isDark = mode === "dark";
  setTwoToneColor(isDark ? DARK_BRAND_COLOR : BRAND_COLOR);

  return {
    ...baseTheme,
    token: {
      ...sharedTokens,
      ...(isDark ? darkTokens : lightTokens),
    },
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  };
}

export default baseTheme;
