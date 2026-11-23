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
import { Alert, App as AntApp, Button, Col, Row, Spin, Typography } from "antd";
import { useMemo, useState } from "react";

import { TaskFiltersBar } from "../TaskFiltersBar/TaskFiltersBar";
import { TaskFormModal, type TaskFormValues, toTaskDueDate } from "../TaskFormModal/TaskFormModal";
import { TaskBoardStage } from "./components/TaskBoardStage/TaskBoardStage";
import { DEFAULT_STAGES } from "./stages";

const { Text, Title } = Typography;

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
    tasks.find((task) => task.id === String(id))?.title ?? "tarea";

  const getOverStatus = (over: DragEndEvent["over"]): TaskStatus | null => {
    if (!over) return null;
    const data = over.data.current as { type?: string; status?: TaskStatus } | undefined;
    if (data?.status) return data.status;
    return filteredTasks.find((task) => task.id === String(over.id))?.status ?? null;
  };

  const getOverLabel = (over: DragEndEvent["over"]) => {
    const status = getOverStatus(over);
    if (!status) return "ningún destino";
    return DEFAULT_STAGES.find((stage) => stage.status === status)?.title ?? status;
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Se levantó ${getTaskTitle(active.id)}`,
    onDragOver: ({ active, over }) =>
      over
        ? `${getTaskTitle(active.id)} está sobre ${getOverLabel(over)}`
        : `${getTaskTitle(active.id)} no tiene destino`,
    onDragEnd: ({ active, over }) =>
      over
        ? `${getTaskTitle(active.id)} se movió a ${getOverLabel(over)}`
        : `Movimiento de ${getTaskTitle(active.id)} cancelado`,
    onDragCancel: ({ active }) => `Movimiento de ${getTaskTitle(active.id)} cancelado`,
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
        message.success("Tarea actualizada");
      } else {
        await createTask({ projectId, ...payload });
        message.success("Tarea creada");
      }

      setIsModalOpen(false);
      setEditingTask(null);
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : "No se pudo guardar la tarea");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      message.success("Tarea eliminada");
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : "No se pudo eliminar la tarea");
    }
  };

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
    <Spin spinning={isLoading && tasks.length === 0}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title level={4} className="m-0">
            Tareas
          </Title>
          <Text type="secondary">
            {tasks.length} {tasks.length === 1 ? "tarea" : "tareas"}
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Nueva tarea
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
          message="No hay tareas con estos filtros"
          action={
            <Button size="small" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          }
          className="mb-4"
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        accessibility={{ announcements }}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <Row gutter={[16, 16]}>
          {stages.map((stage) => (
            <Col key={stage.id} xs={24} md={8}>
              <TaskBoardStage
                {...stage}
                onMoveTask={handleMove}
                onEditTask={openEditModal}
                onDeleteTask={(id) => void handleDelete(id)}
              />
            </Col>
          ))}
        </Row>
        <DragOverlay>
          {activeTask ? (
            <div className="rounded-lg border border-indigo-400 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-lg dark:border-indigo-500 dark:bg-slate-800 dark:text-slate-50">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
    </Spin>
  );
};

export { TaskBoard };
