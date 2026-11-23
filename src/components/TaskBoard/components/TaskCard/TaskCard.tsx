import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import type { Task } from "@src/features/tasks/task.types";
import { toIsoString } from "@src/features/tasks/task.utils";
import { formatDateForDisplay } from "@src/utils/formatDateForDisplay";
import { Button, Card, Typography } from "antd";
import { type DragEventHandler, useMemo } from "react";
import styles from "./TaskCard.module.scss";

const { Text } = Typography;

export type TaskMoveDirection = "up" | "down" | "previous" | "next";

interface TaskCardProps extends Task {
  className?: string;
  onDragStart?: DragEventHandler<HTMLLIElement>;
  onDragEnd?: DragEventHandler<HTMLLIElement>;
  onDragOver?: DragEventHandler<HTMLLIElement>;
  onDrop?: DragEventHandler<HTMLLIElement>;
  onMove?: (direction: TaskMoveDirection) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canMovePrevious?: boolean;
  canMoveNext?: boolean;
}

const TaskCard = ({
  id,
  title,
  description,
  updatedAt,
  className,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMove,
  canMoveUp = false,
  canMoveDown = false,
  canMovePrevious = false,
  canMoveNext = false,
}: TaskCardProps) => {
  const updatedAtToDisplay = useMemo(
    () => formatDateForDisplay(toIsoString(updatedAt)),
    [updatedAt],
  );

  return (
    <li
      id={id}
      data-testid={`task_card_item_${id}`}
      className={`${styles.cardWrapper} ${className ?? ""}`}
      draggable={Boolean(onDragStart)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Card
        classNames={{ cover: styles.image }}
        title={title}
        extra={<Text type="secondary">{updatedAtToDisplay}</Text>}
        className={styles.taskCard}
      >
        {description}
      </Card>
      {onMove && (
        <fieldset className={styles.controls}>
          <legend className="sr-only">Move {title}</legend>
          <Button
            size="small"
            aria-label={`Move ${title} to previous column`}
            title="Move to previous column"
            disabled={!canMovePrevious}
            onClick={() => onMove("previous")}
            icon={<ArrowLeftOutlined />}
          />
          <Button
            size="small"
            aria-label={`Move ${title} up`}
            title="Move up"
            disabled={!canMoveUp}
            onClick={() => onMove("up")}
            icon={<ArrowUpOutlined />}
          />
          <Button
            size="small"
            aria-label={`Move ${title} down`}
            title="Move down"
            disabled={!canMoveDown}
            onClick={() => onMove("down")}
            icon={<ArrowDownOutlined />}
          />
          <Button
            size="small"
            aria-label={`Move ${title} to next column`}
            title="Move to next column"
            disabled={!canMoveNext}
            onClick={() => onMove("next")}
            icon={<ArrowRightOutlined />}
          />
        </fieldset>
      )}
    </li>
  );
};

export { TaskCard };
