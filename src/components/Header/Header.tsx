import {
  BulbOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { BackupActions } from "@src/components/BackupActions/BackupActions";
import type { Project } from "@src/features/tasks/task.types";
import type { ThemeMode } from "@src/hooks/useTheme";
import { t } from "@src/i18n/en";
import { Button, Layout, Space, Tooltip, Typography } from "antd";

const { Header: AntHeader } = Layout;
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
  <AntHeader className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 md:px-6">
    <div className="flex min-w-0 items-center gap-3">
      <Tooltip title={collapsed ? t("header.showProjects") : t("header.hideProjects")}>
        <Button
          type="text"
          aria-label="Toggle sidebar"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
        />
      </Tooltip>
      <div className="min-w-0">
        <Title level={4} className="m-0 truncate text-slate-900 dark:text-slate-50">
          {activeProject?.name ?? t("header.noProject")}
        </Title>
        <Text type="secondary" className="hidden truncate sm:block">
          {activeProject?.description || t("header.createProjectPrompt")}
        </Text>
      </div>
    </div>

    <Space size="middle">
      <BackupActions />
      <Tooltip title={theme === "dark" ? t("header.lightMode") : t("header.darkMode")}>
        <Button
          type="text"
          aria-label="Toggle theme"
          icon={theme === "dark" ? <BulbOutlined /> : <MoonOutlined />}
          onClick={onToggleTheme}
        />
      </Tooltip>
    </Space>
  </AntHeader>
);
