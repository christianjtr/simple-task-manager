import { PlusOutlined } from "@ant-design/icons";
import {
  type Announcements,
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  createTask,
  deleteTask,
  moveTask as moveTaskInDb,
  updateTask,
} from "@src/features/tasks/task.repository";
import type { Task, TaskFilters, TaskPriority, TaskStatus } from "@src/features/tasks/task.types";
import { filterTasks } from "@src/features/tasks/task.utils";
import { useTasks } from "@src/hooks/useTasks";
import { t } from "@src/i18n/en";
import { Alert, App as AntApp, Button, Spin, Tag, Typography } from "antd";
import { useMemo, useState } from "react";

import { TaskFiltersBar } from "../TaskFiltersBar/TaskFiltersBar";
import { TaskFormModal, type TaskFormValues, toTaskDueDate } from "../TaskFormModal/TaskFormModal";
import { TaskBoardStage } from "./components/TaskBoardStage/TaskBoardStage";
import { DEFAULT_STAGES } from "./stages";

const { Title } = Typography;

interface TaskBoardProps {
  projectId: string;
}

const TaskBoard = ({ projectId }: TaskBoardProps) => {
  const { message } = AntApp.useApp();
  const { tasks, isLoading } = useTasks({ projectId });
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const tags = useMemo(
    () => [...new Set(tasks.flatMap((task) => task.tags))].sort((a, b) => a.localeCompare(b)),
    [tasks],
  );

  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);

  const stages = useMemo(
    () =>
      DEFAULT_STAGES.map((stage) => ({
        ...stage,
        tasks: filteredTasks.filter((task) => task.status === stage.status),
      })),
    [filteredTasks],
  );

  const activeTask = activeId
    ? (filteredTasks.find((task) => task.id === activeId) ??
      tasks.find((task) => task.id === activeId) ??
      null)
    : null;

  const hasFilters = Boolean(filters.search?.trim() || filters.priority || filters.tag);

  const getTaskTitle = (id: string | number) =>
    tasks.find((task) => task.id === String(id))?.title ?? t("announcements.taskFallback");

  const getOverStatus = (over: DragEndEvent["over"]): TaskStatus | null => {
    if (!over) return null;
    const data = over.data.current as { type?: string; status?: TaskStatus } | undefined;
    if (data?.status) return data.status;
    return filteredTasks.find((task) => task.id === String(over.id))?.status ?? null;
  };

  const getOverLabel = (over: DragEndEvent["over"]) => {
    const status = getOverStatus(over);
    if (!status) return t("announcements.noDestination");
    return DEFAULT_STAGES.find((stage) => stage.status === status)?.title ?? status;
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => t("announcements.dragStart", { task: getTaskTitle(active.id) }),
    onDragOver: ({ active, over }) =>
      over
        ? t("announcements.dragOver", {
            task: getTaskTitle(active.id),
            target: getOverLabel(over),
          })
        : t("announcements.dragOverNoDestination", { task: getTaskTitle(active.id) }),
    onDragEnd: ({ active, over }) =>
      over
        ? t("announcements.dragEnd", {
            task: getTaskTitle(active.id),
            target: getOverLabel(over),
          })
        : t("announcements.dragCancel", { task: getTaskTitle(active.id) }),
    onDragCancel: ({ active }) => t("announcements.dragCancel", { task: getTaskTitle(active.id) }),
  };

  const clearFilters = () => setFilters({});

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: TaskFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        title: values.title.trim(),
        description: values.description?.trim(),
        status: values.status,
        priority: values.priority,
        dueDate: toTaskDueDate(values.dueDate),
        tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
      };

      if (editingTask) {
        await updateTask(editingTask.id, payload);
        message.success(t("taskMessages.updated"));
      } else {
        await createTask({ projectId, ...payload });
        message.success(t("taskMessages.created"));
      }

      setIsModalOpen(false);
      setEditingTask(null);
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : t("taskMessages.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      message.success(t("taskMessages.deleted"));
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : t("taskMessages.deleteFailed"));
    }
  };

  const handleMove = async (taskId: string, status: TaskStatus, index: number): Promise<void> => {
    try {
      await moveTaskInDb(taskId, status, index);
      message.success(t("taskMessages.moved", { id: taskId, status }));
    } catch (caught) {
      message.error(
        t("taskMessages.moveFailed", {
          id: taskId,
          error: caught instanceof Error ? caught.message : String(caught),
        }),
      );
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id));

  const handleDragCancel = () => setActiveId(null);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    if (taskId === String(over.id)) return;

    const targetStatus = getOverStatus(over);
    if (!targetStatus) return;

    const targetTasks = filteredTasks.filter((task) => task.status === targetStatus);
    const overIndex = targetTasks.findIndex((task) => task.id === String(over.id));
    const index = overIndex === -1 ? targetTasks.length : overIndex;

    void handleMove(taskId, targetStatus, index);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Title level={4} className="m-0">
            {t("board.tasks")}
          </Title>
          <Tag
            data-testid="task-count-chip"
            className="m-0 rounded-full px-2 tabular-nums"
            aria-label={
              tasks.length === 1
                ? t("board.countAriaOne")
                : t("board.countAriaOther", { count: tasks.length })
            }
          >
            {tasks.length}
          </Tag>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          {t("board.newTask")}
        </Button>
      </div>

      <TaskFiltersBar
        search={filters.search ?? ""}
        priority={filters.priority}
        tag={filters.tag}
        tags={tags}
        onSearch={(search) => setFilters((current) => ({ ...current, search }))}
        onPriority={(priority: TaskPriority | undefined) =>
          setFilters((current) => ({ ...current, priority }))
        }
        onTag={(tag) => setFilters((current) => ({ ...current, tag }))}
        onClear={clearFilters}
      />

      {hasFilters && filteredTasks.length === 0 && (
        <Alert
          type="info"
          showIcon
          message={t("board.noFilteredTasks")}
          action={
            <Button size="small" onClick={clearFilters}>
              {t("board.clearFilters")}
            </Button>
          }
          className="mb-4 shrink-0"
        />
      )}

      <Spin spinning={isLoading && tasks.length === 0} wrapperClassName="board-spin min-h-0 flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          accessibility={{ announcements }}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full min-h-0 gap-4 overflow-x-auto pb-2">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="flex h-full w-[min(85vw,22rem)] shrink-0 flex-col md:w-auto md:flex-1"
              >
                <TaskBoardStage
                  {...stage}
                  onMoveTask={handleMove}
                  onEditTask={openEditModal}
                  onDeleteTask={(id) => void handleDelete(id)}
                />
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="rounded-lg border border-[var(--brand)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--content)] shadow-lg">
                {activeTask.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Spin>

      <TaskFormModal
        open={isModalOpen}
        task={editingTask}
        isSaving={isSaving}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </div>
  );
};

export { TaskBoard };
