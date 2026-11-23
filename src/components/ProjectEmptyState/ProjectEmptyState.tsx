import { ThunderboltOutlined } from "@ant-design/icons";
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
          Organiza tu trabajo
        </Title>
        <Text type="secondary" className="mb-6 block">
          Crea tu primer proyecto desde la barra lateral o carga un ejemplo para explorar el
          tablero.
        </Text>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          loading={isLoading}
          onClick={onLoadExample}
        >
          Cargar ejemplo
        </Button>
      </Empty>
    </Card>
  </div>
);
