import { ThunderboltOutlined } from "@ant-design/icons";
import { t } from "@src/i18n/en";
import { Button, Card, Empty, Typography } from "antd";

const { Text, Title } = Typography;

interface ProjectEmptyStateProps {
  onLoadExample: () => void;
  isLoading?: boolean;
}

export const ProjectEmptyState = ({ onLoadExample, isLoading }: ProjectEmptyStateProps) => (
  <div className="flex min-h-[60vh] items-center justify-center p-4">
    <Card className="w-full max-w-lg text-center shadow-sm">
      <Empty description={null}>
        <Title level={3} className="mb-2">
          {t("emptyState.title")}
        </Title>
        <Text type="secondary" className="mb-6 block">
          {t("emptyState.description")}
        </Text>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          loading={isLoading}
          onClick={onLoadExample}
        >
          {t("emptyState.loadExample")}
        </Button>
      </Empty>
    </Card>
  </div>
);
