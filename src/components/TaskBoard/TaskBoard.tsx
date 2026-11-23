import { PlusOutlined } from "@ant-design/icons";
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

  const hasFilters = Boolean(filters.search?.trim() || filters.priority || filters.tag);

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
