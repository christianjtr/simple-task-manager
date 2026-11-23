import { useMemo, type DragEventHandler } from "react";
import { Button, Card, Typography } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";

import { OptimizedImage } from "@components/OptimizedImage/OptimizedImage";
import type { Task } from "@src/types/task";
import { formatDateForDisplay } from "@src/utils/formatDateForDisplay";
import styles from "./TaskCard.module.scss";

const { Text } = Typography;

export type TaskMoveDirection = "up" | "down" | "previous" | "next";

interface TaskCardProps extends Task {
  onDragStart?: DragEventHandler<HTMLDivElement>;
  onDragEnd?: DragEventHandler<HTMLDivElement>;
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
  image,
  onDragStart,
  onDragEnd,
  onMove,
  canMoveUp = false,
  canMoveDown = false,
  canMovePrevious = false,
  canMoveNext = false,
}: TaskCardProps) => {
  const updatedAtToDisplay = useMemo(
    () => formatDateForDisplay(updatedAt),
    [updatedAt]
  );

  return (
    <div
      id={id}
      data-testid={`task_card_item_${id}`}
      className={styles.cardWrapper}
      draggable={Boolean(onDragStart)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Card
        classNames={{ cover: styles.image }}
        cover={
          image ? (
            <OptimizedImage
              src={image.url}
              alt={image.alt ?? title}
              width={image.width}
              height={image.height}
            />
          ) : undefined
        }
        title={title}
        extra={<Text type="secondary">{updatedAtToDisplay}</Text>}
        className={styles.taskCard}
      >
        {description}
      </Card>
      {onMove && (
        <div className={styles.controls} role="group" aria-label={`Move ${title}`}>
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
        </div>
      )}
    </div>
  );
};

export { TaskCard };
