import { Layout, Typography, Space, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import styles from "./Header.module.scss";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Task Management System",
}) => {
  return (
    <AntHeader className={styles.header}>
      <div className={styles.headerContent}>
        <Title level={3} className={styles.title}>
          {title}
        </Title>
        <Space size="large">
          <Avatar icon={<UserOutlined />} />
        </Space>
      </div>
    </AntHeader>
  );
};
