import { theme as antdTheme } from "antd";
import { getThemeConfig } from "../default";

describe("getThemeConfig", () => {
  it("uses light tokens with the default algorithm", () => {
    const config = getThemeConfig("light");

    expect(config.algorithm).toBe(antdTheme.defaultAlgorithm);
    expect(config.token).toMatchObject({
      colorPrimary: "#6366f1",
      colorTextBase: "#0f172a",
      colorBgBase: "#ffffff",
      colorBgLayout: "#f8fafc",
    });
  });

  it("uses dark tokens with the dark algorithm", () => {
    const config = getThemeConfig("dark");

    expect(config.algorithm).toBe(antdTheme.darkAlgorithm);
    expect(config.token).toMatchObject({
      colorPrimary: "#818cf8",
      colorTextBase: "#e2e8f0",
      colorBgBase: "#0f172a",
      colorBgLayout: "#020617",
    });
  });
});
