import { setTwoToneColor } from "@ant-design/icons";
import type { ThemeMode } from "@src/hooks/useTheme";
import { theme as antdTheme, type ThemeConfig } from "antd";

const BRAND_COLOR = "#6366f1";
const WHITE_COLOR = "#ffffff";

setTwoToneColor(BRAND_COLOR);

const baseTheme: ThemeConfig = {
  hashed: false,
  token: {
    wireframe: false,
    fontSize: 14,
    borderRadius: 8,
    colorPrimary: BRAND_COLOR,
    colorWhite: WHITE_COLOR,
    colorTextBase: "#0f172a",
    colorTextSecondary: "#64748b",
    colorBgBase: WHITE_COLOR,
    colorBgMask: "rgba(15,23,42,0.55)",
    colorLink: BRAND_COLOR,
    colorSuccess: "#059669",
    colorWarning: "#d97706",
    colorError: "#dc2626",
    colorInfo: BRAND_COLOR,
    colorLinkHover: "#4f46e5",
    fontFamily:
      "Inter, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'",
  },
};

export function getThemeConfig(mode: ThemeMode): ThemeConfig {
  return {
    ...baseTheme,
    algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  };
}

export default baseTheme;
