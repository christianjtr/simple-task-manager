import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@src/features/tasks/task.types";
import { formatDueDate, toIsoString } from "@src/features/tasks/task.utils";
import { formatDateForDisplay } from "@src/utils/formatDateForDisplay";
import { Button, Card, Popconfirm, Space, Tag, Tooltip, Typography } from "antd";
import { type CSSProperties, useMemo } from "react";
import styles from "./TaskCard.module.scss";

const { Text } = Typography;

export type TaskMoveDirection = "up" | "down" | "previous" | "next";

interface TaskCardProps extends Task {
  className?: string;
  onMove?: (direction: TaskMoveDirection) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canMovePrevious?: boolean;
  canMoveNext?: boolean;
}

const priorityColors = {
  low: "green",
  medium: "gold",
  high: "red",
} as const;

const TaskCard = ({
  id,
  projectId,
  title,
  description,
  status,
  position,
  priority,
  tags,
  dueDate,
  createdAt,
  updatedAt,
  className,
  onMove,
  onEdit,
  onDelete,
  canMoveUp = false,
  canMoveDown = false,
  canMovePrevious = false,
  canMoveNext = false,
}: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "task", status },
  });

  const updatedAtToDisplay = useMemo(
    () => formatDateForDisplay(toIsoString(updatedAt)),
    [updatedAt],
  );

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleEdit = () => {
    onEdit?.({
      id,
      projectId,
      title,
      description,
      status,
      position,
      priority,
      tags,
      dueDate,
      createdAt,
      updatedAt,
    });
  };

  return (
    <li
      ref={setNodeRef}
      id={id}
      data-testid={`task_card_item_${id}`}
      className={`${styles.cardWrapper} ${className ?? ""}`}
      style={style}
    >
      <Card
        title={title}
        extra={
          <Space size={4}>
            <Tag color={priorityColors[priority]}>{priority}</Tag>
            <button
              ref={setActivatorNodeRef}
              type="button"
              className={styles.dragHandle}
              aria-label={`Arrastrar ${title}`}
              {...attributes}
              {...listeners}
            >
              <HolderOutlined />
            </button>
          </Space>
        }
        className={styles.taskCard}
      >
        <div className="mb-2 flex flex-wrap items-center gap-1">
          <Text type="secondary" className="text-xs">
            Actualizado {updatedAtToDisplay}
          </Text>
          {dueDate && (
            <Text type="secondary" className="text-xs">
              Vence {formatDueDate(dueDate)}
            </Text>
          )}
          {tags.map((tag) => (
            <Tag key={tag} bordered={false}>
              {tag}
            </Tag>
          ))}
        </div>
        <div className="whitespace-pre-wrap">{description}</div>
        {(onEdit || onDelete) && (
          <div className="mt-3 flex items-center gap-1">
            {onEdit && (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                aria-label={`Edit ${title}`}
                onClick={handleEdit}
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Popconfirm
                title="¿Eliminar tarea?"
                okText="Eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                onConfirm={() => onDelete(id)}
              >
                <Tooltip title="Eliminar tarea">
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${title}`}
                  >
                    Eliminar
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}
          </div>
        )}
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
