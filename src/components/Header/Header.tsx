import {
  BulbOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Project } from "@src/features/tasks/task.types";
import type { ThemeMode } from "@src/hooks/useTheme";
import { Avatar, Button, Layout, Space, Tooltip, Typography } from "antd";

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
      <Tooltip title={collapsed ? "Mostrar proyectos" : "Ocultar proyectos"}>
        <Button
          type="text"
          aria-label="Toggle sidebar"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
        />
      </Tooltip>
      <div className="min-w-0">
        <Title level={4} className="m-0 truncate text-slate-900 dark:text-slate-50">
          {activeProject?.name ?? "Sin proyecto"}
        </Title>
        <Text type="secondary" className="hidden truncate sm:block">
          {activeProject?.description || "Crea un proyecto para empezar"}
        </Text>
      </div>
    </div>

    <Space size="middle">
      <Tooltip title={theme === "dark" ? "Modo claro" : "Modo oscuro"}>
        <Button
          type="text"
          aria-label="Toggle theme"
          icon={theme === "dark" ? <BulbOutlined /> : <MoonOutlined />}
          onClick={onToggleTheme}
        />
      </Tooltip>
      <Avatar icon={<UserOutlined />} />
    </Space>
  </AntHeader>
);
