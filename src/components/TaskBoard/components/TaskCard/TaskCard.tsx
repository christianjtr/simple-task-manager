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
import { t } from "@src/i18n/en";
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
            <Tag color={priorityColors[priority]}>{t(`priority.${priority}`)}</Tag>
            <button
              ref={setActivatorNodeRef}
              type="button"
              className={styles.dragHandle}
              aria-label={t("taskCard.drag", { title })}
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
            {t("taskCard.updated", { date: updatedAtToDisplay })}
          </Text>
          {dueDate && (
            <Text type="secondary" className="text-xs">
              {t("taskCard.due", { date: formatDueDate(dueDate) })}
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
                {t("taskCard.edit")}
              </Button>
            )}
            {onDelete && (
              <Popconfirm
                title={t("taskCard.deleteTitle")}
                okText={t("taskCard.delete")}
                cancelText={t("taskCard.cancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() => onDelete(id)}
              >
                <Tooltip title={t("taskCard.deleteTooltip")}>
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={t("taskCard.deleteAria", { title })}
                  >
                    {t("taskCard.delete")}
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}
          </div>
        )}
      </Card>
      {onMove && (
        <fieldset className={styles.controls}>
          <legend className="sr-only">{t("taskCard.moveLegend", { title })}</legend>
          <Button
            size="small"
            aria-label={t("taskCard.movePreviousAria", { title })}
            title={t("taskCard.movePreviousTitle")}
            disabled={!canMovePrevious}
            onClick={() => onMove("previous")}
            icon={<ArrowLeftOutlined />}
          />
          <Button
            size="small"
            aria-label={t("taskCard.moveUpAria", { title })}
            title={t("taskCard.moveUpTitle")}
            disabled={!canMoveUp}
            onClick={() => onMove("up")}
            icon={<ArrowUpOutlined />}
          />
          <Button
            size="small"
            aria-label={t("taskCard.moveDownAria", { title })}
            title={t("taskCard.moveDownTitle")}
            disabled={!canMoveDown}
            onClick={() => onMove("down")}
            icon={<ArrowDownOutlined />}
          />
          <Button
            size="small"
            aria-label={t("taskCard.moveNextAria", { title })}
            title={t("taskCard.moveNextTitle")}
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
