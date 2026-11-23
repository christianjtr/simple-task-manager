import { UserOutlined } from "@ant-design/icons";
import { useAppSelector } from "@src/hooks/useReduxStore";
import type { ConnectionStatus } from "@src/types/task";
import { Avatar, Badge, Layout, Space, Typography } from "antd";
import styles from "./Header.module.scss";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
  title?: string;
}

const STATUS_BADGE: Record<
  ConnectionStatus,
  { status: "success" | "error" | "warning" | "processing"; text: string }
> = {
  connected: { status: "success", text: "Live" },
  connecting: { status: "processing", text: "Connecting" },
  reconnecting: { status: "warning", text: "Reconnecting" },
  disconnected: { status: "error", text: "Offline" },
};

export const Header: React.FC<HeaderProps> = ({ title = "Task Management System" }) => {
  const connectionStatus = useAppSelector((state) => state.tasks.connectionStatus);
  const badge = STATUS_BADGE[connectionStatus];

  return (
    <AntHeader className={styles.header}>
      <div className={styles.headerContent}>
        <Title level={3} className={styles.title}>
          {title}
        </Title>
        <Space size="large">
          <Badge status={badge.status} text={badge.text} />
          <Avatar icon={<UserOutlined />} />
        </Space>
      </div>
    </AntHeader>
  );
};
