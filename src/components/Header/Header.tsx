import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { BackupActions } from "@src/components/BackupActions/BackupActions";
import { HelpDrawer } from "@src/components/HelpDrawer/HelpDrawer";
import type { Project } from "@src/features/tasks/task.types";
import type { ThemeMode } from "@src/hooks/useTheme";
import { t } from "@src/i18n/en";
import { Button, Tooltip, Typography } from "antd";

const { Text, Title } = Typography;

interface HeaderProps {
  activeProject: Project | null;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Header = ({ activeProject, theme, onToggleTheme }: HeaderProps) => (
  <header
    className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4 text-[var(--content)] md:px-6"
    style={{ backgroundColor: "var(--surface)", color: "var(--content)" }}
  >
    <div className="flex min-w-0 flex-1 items-baseline gap-2">
      <Title level={4} className="m-0 shrink-0 truncate text-[var(--content)]">
        {activeProject?.name ?? t("header.noProject")}
      </Title>
      <span className="hidden min-w-0 items-center gap-2 sm:flex">
        <span
          aria-hidden="true"
          data-testid="header-project-separator"
          className="h-4 w-px shrink-0 bg-[var(--border)]"
        />
        <Text type="secondary" className="min-w-0 truncate text-xs">
          {activeProject?.description || t("header.createProjectPrompt")}
        </Text>
      </span>
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
