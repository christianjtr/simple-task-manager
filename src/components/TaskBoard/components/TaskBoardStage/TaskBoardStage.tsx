import type { Task, TaskStatus } from "@src/features/tasks/task.types";
import { Empty, Typography } from "antd";
import { type DragEvent, useState } from "react";
import { STAGE_ORDER } from "../../stages";
import { TaskCard, type TaskMoveDirection } from "../TaskCard/TaskCard";
import styles from "./TaskBoardStage.module.scss";

interface TaskBoardStageProps {
  id: TaskStatus;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onMoveTask?: (taskId: Task["id"], status: TaskStatus, index: number) => Promise<void>;
}

const { Title } = Typography;

const TaskBoardStage = ({ id, title, status, tasks, onMoveTask }: TaskBoardStageProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const stagePosition = STAGE_ORDER.indexOf(status);

  const handleDrop = (index: number, event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const taskId = event.dataTransfer.getData("text/plain") || draggedId;
    setDraggedId(null);
    setDropIndex(null);
    if (taskId) void onMoveTask?.(taskId, status, index);
  };

  const handleMove = (taskId: string, direction: TaskMoveDirection) => {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return;

    if (direction === "up") {
      void onMoveTask?.(taskId, status, Math.max(0, index - 1));
      return;
    }
    if (direction === "down") {
      void onMoveTask?.(taskId, status, Math.min(tasks.length - 1, index + 1));
      return;
    }

    const nextPosition = stagePosition + (direction === "next" ? 1 : -1);
    const nextStatus = STAGE_ORDER[nextPosition];
    if (nextStatus) void onMoveTask?.(taskId, nextStatus, 0);
  };

  return (
    <section
      className={styles.taskBoardStage}
      data-testid={`task_board_stage_item_${id}`}
      aria-label={`${title} column`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => handleDrop(tasks.length, event)}
    >
      <Title level={4} className={styles.title}>
        {title}
      </Title>
      <span className={styles.count}>{tasks.length}</span>
      <ul className={styles.list}>
        {tasks.length === 0 && (
          <li>
            <Empty description="Drop tasks here" className={styles.empty} />
          </li>
        )}
        {tasks.map((task, index) => (
          <TaskCard
            {...task}
            key={task.id}
            className={`${styles.cardSlot} ${
              dropIndex === index && draggedId ? styles.dropTarget : ""
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDropIndex(index);
            }}
            onDrop={(event) => handleDrop(index, event)}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", task.id);
              event.dataTransfer.effectAllowed = "move";
              setDraggedId(task.id);
            }}
            onDragEnd={() => {
              setDraggedId(null);
              setDropIndex(null);
            }}
            onMove={(direction) => handleMove(task.id, direction)}
            canMoveUp={index > 0}
            canMoveDown={index < tasks.length - 1}
            canMovePrevious={stagePosition > 0}
            canMoveNext={stagePosition < STAGE_ORDER.length - 1}
          />
        ))}
      </ul>
    </section>
  );
};

export { TaskBoardStage };
