import { type Task, type TaskPriority, TaskStatus } from "@src/features/tasks/task.types";
import { t } from "@src/i18n/en";
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
      title={task ? t("taskForm.editTask") : t("taskForm.newTask")}
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
          label={t("taskForm.title")}
          rules={[
            { required: true, message: t("taskForm.enterTitle") },
            { max: 120, message: t("taskForm.titleMax") },
          ]}
        >
          <Input placeholder={t("taskForm.titleExample")} maxLength={120} autoFocus />
        </Form.Item>

        <Form.Item name="description" label={t("taskForm.description")}>
          <Input.TextArea
            rows={3}
            maxLength={1000}
            showCount
            placeholder={t("taskForm.optional")}
          />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item name="status" label={t("taskForm.status")}>
            <Select>
              <Option value={TaskStatus.TODO}>To Do</Option>
              <Option value={TaskStatus.IN_PROGRESS}>In Progress</Option>
              <Option value={TaskStatus.DONE}>Done</Option>
            </Select>
          </Form.Item>

          <Form.Item name="priority" label={t("taskForm.priority")}>
            <Select>
              <Option value="low">{t("priority.low")}</Option>
              <Option value="medium">{t("priority.medium")}</Option>
              <Option value="high">{t("priority.high")}</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item name="dueDate" label={t("taskForm.dueDate")}>
            <Input type="date" aria-label={t("taskForm.dueDate")} />
          </Form.Item>

          <Form.Item name="tags" label={t("taskForm.tags")}>
            <Select
              mode="tags"
              tokenSeparators={[","]}
              placeholder={t("taskForm.tagsPlaceholder")}
            />
          </Form.Item>
        </div>

        <Space className="mt-2 w-full justify-end">
          <Button onClick={onClose}>{t("taskForm.cancel")}</Button>
          <Button type="primary" htmlType="submit" loading={isSaving}>
            {task ? t("taskForm.saveChanges") : t("taskForm.createTask")}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};
