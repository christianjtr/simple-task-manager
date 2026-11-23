import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@src/features/tasks/task.types";
import { t } from "@src/i18n/en";
import { Empty, Typography } from "antd";
import { STAGE_ORDER } from "../../stages";
import { TaskCard, type TaskMoveDirection } from "../TaskCard/TaskCard";
import styles from "./TaskBoardStage.module.scss";

interface TaskBoardStageProps {
  id: TaskStatus;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onMoveTask?: (taskId: Task["id"], status: TaskStatus, index: number) => Promise<void>;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
}

const { Title } = Typography;

const TaskBoardStage = ({
  id,
  title,
  status,
  tasks,
  onMoveTask,
  onEditTask,
  onDeleteTask,
}: TaskBoardStageProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${status}`,
    data: { type: "column", status },
  });
  const stagePosition = STAGE_ORDER.indexOf(status);

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
    >
      <div className={styles.header}>
        <Title level={4} className={styles.title}>
          {title}
        </Title>
        <span
          className={`${styles.count} bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200`}
          role="img"
          aria-label={
            tasks.length === 1
              ? t("stage.countAriaOne")
              : t("stage.countAriaOther", { count: tasks.length })
          }
        >
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          className={`${styles.list} ${isOver ? styles.dropTarget : ""}`}
          aria-label={`${title} task list`}
        >
          {tasks.length === 0 && (
            <li>
              <Empty description={t("stage.dropTasks")} className={styles.empty} />
            </li>
          )}
          {tasks.map((task, index) => (
            <TaskCard
              {...task}
              key={task.id}
              className={styles.cardSlot}
              onMove={(direction) => handleMove(task.id, direction)}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              canMoveUp={index > 0}
              canMoveDown={index < tasks.length - 1}
              canMovePrevious={stagePosition > 0}
              canMoveNext={stagePosition < STAGE_ORDER.length - 1}
            />
          ))}
        </ul>
      </SortableContext>
    </section>
  );
};

export { TaskBoardStage };
