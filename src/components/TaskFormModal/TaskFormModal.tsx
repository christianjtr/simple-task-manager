import { type Task, type TaskPriority, TaskStatus } from "@src/features/tasks/task.types";
import { Button, Form, Input, Modal, Select, Space } from "antd";
import { DateTime } from "luxon";
import { useEffect } from "react";

const { Option } = Select;

export interface TaskFormValues {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
}

interface TaskFormModalProps {
  open: boolean;
  task?: Task | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

function toDateInput(date?: Date): string | undefined {
  return date ? DateTime.fromJSDate(date, { zone: "utc" }).toFormat("yyyy-MM-dd") : undefined;
}

export function toTaskDueDate(value?: string): Date | undefined {
  return value ? DateTime.fromISO(`${value}T00:00:00`, { zone: "utc" }).toJSDate() : undefined;
}

export const TaskFormModal = ({ open, task, isSaving, onClose, onSubmit }: TaskFormModalProps) => {
  const [form] = Form.useForm<TaskFormValues>();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? TaskStatus.TODO,
      priority: task?.priority ?? "medium",
      dueDate: toDateInput(task?.dueDate),
      tags: task?.tags ?? [],
    });
  }, [form, open, task]);

  return (
    <Modal
      title={task ? "Editar tarea" : "Nueva tarea"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ priority: "medium", status: TaskStatus.TODO }}
      >
        <Form.Item
          name="title"
          label="Título"
          rules={[
            { required: true, message: "Ingresa un título" },
            { max: 120, message: "Máximo 120 caracteres" },
          ]}
        >
          <Input placeholder="Ej. Preparar reunión" maxLength={120} autoFocus />
        </Form.Item>

        <Form.Item name="description" label="Descripción">
          <Input.TextArea rows={3} maxLength={1000} showCount placeholder="Opcional" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item name="status" label="Estado">
            <Select>
              <Option value={TaskStatus.TODO}>To Do</Option>
              <Option value={TaskStatus.IN_PROGRESS}>In Progress</Option>
              <Option value={TaskStatus.DONE}>Done</Option>
            </Select>
          </Form.Item>

          <Form.Item name="priority" label="Prioridad">
            <Select>
              <Option value="low">Baja</Option>
              <Option value="medium">Media</Option>
              <Option value="high">Alta</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item name="dueDate" label="Fecha de entrega">
            <Input type="date" aria-label="Fecha de entrega" />
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select mode="tags" tokenSeparators={[","]} placeholder="Escribe y pulsa Enter" />
          </Form.Item>
        </div>

        <Space className="mt-2 w-full justify-end">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={isSaving}>
            {task ? "Guardar cambios" : "Crear tarea"}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};
