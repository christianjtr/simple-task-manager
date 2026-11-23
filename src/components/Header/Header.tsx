import { MenuFoldOutlined, MenuUnfoldOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { BackupActions } from "@src/components/BackupActions/BackupActions";
import { HelpDrawer } from "@src/components/HelpDrawer/HelpDrawer";
import type { Project } from "@src/features/tasks/task.types";
import type { ThemeMode } from "@src/hooks/useTheme";
import { t } from "@src/i18n/en";
import { Button, Tooltip, Typography } from "antd";

const { Text, Title } = Typography;

interface HeaderProps {
  activeProject: Project | null;
  collapsed: boolean;
  theme: ThemeMode;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
}

export const Header = ({
  activeProject,
  collapsed,
  theme,
  onToggleSidebar,
  onToggleTheme,
}: HeaderProps) => (
  <header
    className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4 text-[var(--content)] md:px-6"
    style={{ backgroundColor: "var(--surface)", color: "var(--content)" }}
  >
    <div className="flex min-w-0 items-center gap-3">
      <Tooltip title={collapsed ? t("header.showProjects") : t("header.hideProjects")}>
        <Button
          type="text"
          shape="circle"
          aria-label={t("header.toggleSidebarAria")}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
        />
      </Tooltip>
      <span className="hidden h-8 w-px bg-[var(--border)] sm:block" aria-hidden="true" />
      <div className="min-w-0">
        <Title level={4} className="m-0 truncate text-[var(--content)]">
          {activeProject?.name ?? t("header.noProject")}
        </Title>
        <Text type="secondary" className="hidden truncate text-xs sm:block">
          {activeProject?.description || t("header.createProjectPrompt")}
        </Text>
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-1">
      <HelpDrawer />
      <BackupActions />
      <span className="mx-1 h-6 w-px bg-[var(--border)]" aria-hidden="true" />
      <Tooltip title={theme === "dark" ? t("header.lightMode") : t("header.darkMode")}>
        <Button
          type="text"
          shape="circle"
          aria-label={t("header.toggleThemeAria")}
          icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
          onClick={onToggleTheme}
        />
      </Tooltip>
    </div>
  </header>
);
