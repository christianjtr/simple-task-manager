import { useMemo } from "react";
import { Alert, App as AntApp, Button, Col, Row, Spin } from "antd";

import { useTaskService } from "@src/hooks/useTaskService";
import type { TaskStatus } from "@src/types/task";
import { DEFAULT_STAGES } from "./stages";
import { TaskBoardStage } from "./components/TaskBoardStage/TaskBoardStage";

const TaskBoard = () => {
  const { message } = AntApp.useApp();
  const { tasks, isLoading, error, reload, moveTask } = useTaskService();

  const stages = useMemo(
    () =>
      DEFAULT_STAGES.map((stage) => ({
        ...stage,
        tasks: tasks.filter((task) => task.status === stage.status),
      })),
    [tasks]
  );

  const handleMove = async (
    taskId: string,
    status: TaskStatus,
    index: number
  ): Promise<void> => {
    try {
      await moveTask(taskId, status, index);
      message.success(`Task ${taskId} moved to ${status}`);
    } catch (caught) {
      message.error(
        `Cannot move task ${taskId}: ${
          caught instanceof Error ? caught.message : String(caught)
        }`
      );
    }
  };

  return (
    <Spin spinning={isLoading && tasks.length === 0} tip="Loading tasks…">
      {error && (
        <Alert
          type="error"
          showIcon
          message="Could not load tasks"
          description={error}
          action={
            <Button size="small" onClick={() => void reload().catch(() => {})}>
              Retry
            </Button>
          }
        />
      )}
      <Row gutter={[24, 24]}>
        {stages.map((stage) => (
          <Col key={stage.id} span={24 / stages.length}>
            <TaskBoardStage {...stage} onMoveTask={handleMove} />
          </Col>
        ))}
      </Row>
    </Spin>
  );
};

export { TaskBoard };
