import { moveTask as moveTaskInDb } from "@src/features/tasks/task.repository";
import type { TaskStatus } from "@src/features/tasks/task.types";
import { useTasks } from "@src/hooks/useTasks";
import { App as AntApp, Col, Row, Spin } from "antd";
import { useMemo } from "react";
import { TaskBoardStage } from "./components/TaskBoardStage/TaskBoardStage";
import { DEFAULT_STAGES } from "./stages";

const TaskBoard = () => {
  const { message } = AntApp.useApp();
  const { tasks, isLoading } = useTasks();

  const stages = useMemo(
    () =>
      DEFAULT_STAGES.map((stage) => ({
        ...stage,
        tasks: tasks.filter((task) => task.status === stage.status),
      })),
    [tasks],
  );

  const handleMove = async (taskId: string, status: TaskStatus, index: number): Promise<void> => {
    try {
      await moveTaskInDb(taskId, status, index);
      message.success(`Task ${taskId} moved to ${status}`);
    } catch (caught) {
      message.error(
        `Cannot move task ${taskId}: ${caught instanceof Error ? caught.message : String(caught)}`,
      );
    }
  };

  return (
    <Spin spinning={isLoading && tasks.length === 0}>
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
