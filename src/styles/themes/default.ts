import { setTwoToneColor } from "@ant-design/icons";
import { ThemeConfig } from "antd";

const BRAND_COLOR = "#0284c7";
const WHITE_COLOR = "#ffffff";

setTwoToneColor(BRAND_COLOR);

const defaultTheme: ThemeConfig = {
  hashed: false,
  token: {
    wireframe: true,
    fontSize: 14,
    borderRadius: 4,
    colorPrimary: BRAND_COLOR,
    colorWhite: WHITE_COLOR,
    colorTextBase: "#2c3e50",
    colorTextSecondary: "#64748b",
    colorBgBase: WHITE_COLOR,
    colorBgMask: "rgba(26,28,30,0.45)",
    colorLink: BRAND_COLOR,
    colorSuccess: "#059669",
    colorWarning: "#d97706",
    colorError: "#dc2626",
    colorInfo: BRAND_COLOR,
    colorLinkHover: "#0369a1",
    fontFamily:
      "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji','Segoe UI Emoji', 'Segoe UI Symbol'",
  },
};

export default defaultTheme;
