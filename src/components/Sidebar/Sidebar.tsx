import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  SettingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import styles from "./Sidebar.module.scss";

const { Sider } = Layout;

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onCollapse,
}) => {
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "projects",
      icon: <ProjectOutlined />,
      label: "Projects",
    },
    {
      key: "team",
      icon: <TeamOutlined />,
      label: "Team",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      className={styles.sidebar}
      theme="light"
    >
      <div className={styles.logo}>
        {collapsed ? (
          <AppstoreOutlined className={styles.logoIcon} />
        ) : (
          <span>TaskManager</span>
        )}
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={["dashboard"]}
        items={menuItems}
      />
    </Sider>
  );
};
