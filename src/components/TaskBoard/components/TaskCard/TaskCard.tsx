import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  DragOutlined,
  EditOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@src/features/tasks/task.types";
import { formatDueDate, toIsoString } from "@src/features/tasks/task.utils";
import { t } from "@src/i18n/en";
import { formatDateForDisplay } from "@src/utils/formatDateForDisplay";
import { App as AntApp, Button, Card, Dropdown, type MenuProps, Space, Tag, Tooltip } from "antd";
import { type CSSProperties, useMemo, useState } from "react";
import styles from "./TaskCard.module.scss";

const DESCRIPTION_PREVIEW_LIMIT = 140;

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
  const { modal } = AntApp.useApp();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
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

  const isDescriptionLong = description.length > DESCRIPTION_PREVIEW_LIMIT;

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

  const requestDelete = () => {
    modal.confirm({
      title: t("taskCard.deleteTitle"),
      content: t("taskCard.deleteDescription"),
      okText: t("taskCard.delete"),
      cancelText: t("taskCard.cancel"),
      okButtonProps: { danger: true },
      onOk: () => onDelete?.(id),
    });
  };

  const actionItems: MenuProps["items"] = [
    ...(onEdit
      ? [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: t("taskCard.edit"),
            onClick: () => handleEdit(),
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            key: "delete",
            danger: true,
            icon: <DeleteOutlined />,
            label: t("taskCard.delete"),
            onClick: () => requestDelete(),
          },
        ]
      : []),
  ];

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
          <Space size={4} align="center">
            <Tag color={priorityColors[priority]}>{t(`priority.${priority}`)}</Tag>
            {actionItems.length > 0 && (
              <Tooltip title={t("taskCard.actionsTooltip")}>
                <Dropdown trigger={["click"]} menu={{ items: actionItems }}>
                  <Button
                    type="default"
                    size="small"
                    shape="circle"
                    icon={<EllipsisOutlined />}
                    aria-label={t("taskCard.actionsAria", { title })}
                    onClick={(event) => event.stopPropagation()}
                  />
                </Dropdown>
              </Tooltip>
            )}
            <button
              ref={setActivatorNodeRef}
              type="button"
              className={styles.dragHandle}
              aria-label={t("taskCard.drag", { title })}
              {...attributes}
              {...listeners}
            >
              <DragOutlined />
            </button>
          </Space>
        }
        className={styles.taskCard}
      >
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--content-muted)]">
          <span data-testid="task-card-updated">
            {t("taskCard.updated", { date: updatedAtToDisplay })}
          </span>
          {dueDate && <span>{t("taskCard.due", { date: formatDueDate(dueDate) })}</span>}
        </div>
        <div
          data-testid="task-description"
          className={`whitespace-pre-wrap ${
            isDescriptionLong && !isDescriptionExpanded ? "line-clamp-2" : ""
          }`}
        >
          {description}
        </div>
        {isDescriptionLong && (
          <Button
            type="link"
            size="small"
            className="mt-1 px-0"
            aria-expanded={isDescriptionExpanded}
            onClick={() => setIsDescriptionExpanded((current) => !current)}
          >
            {isDescriptionExpanded ? t("taskCard.showLess") : t("taskCard.showMore")}
          </Button>
        )}
        {tags.length > 0 && (
          <div data-testid="task-card-tags" className="mt-2 flex flex-wrap items-center gap-1">
            {tags.map((tag) => (
              <Tag key={tag} bordered={false}>
                {tag}
              </Tag>
            ))}
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
