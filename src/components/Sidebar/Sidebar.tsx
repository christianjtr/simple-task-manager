import {
  AppstoreOutlined,
  DeleteOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  createProject,
  DEFAULT_PROJECT_COLOR,
  deleteProject,
  MAX_PROJECTS,
} from "@src/features/tasks/task.repository";
import type { Project } from "@src/features/tasks/task.types";
import type { ThemeMode } from "@src/hooks/useTheme";
import { t } from "@src/i18n/en";
import {
  App as AntApp,
  Button,
  Form,
  Input,
  Menu,
  type MenuProps,
  Modal,
  Popconfirm,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";

const { Text } = Typography;

interface ProjectFormValues {
  name: string;
  color: string;
  description?: string;
}

interface SidebarProps {
  projects: Project[];
  activeProjectId?: string;
  collapsed: boolean;
  theme: ThemeMode;
  isLoading?: boolean;
  onSelectProject: (id: string) => void;
  onLoadExample: () => void;
}

export const Sidebar = ({
  projects,
  activeProjectId,
  collapsed,
  theme,
  isLoading,
  onSelectProject,
  onLoadExample,
}: SidebarProps) => {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<ProjectFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (values: ProjectFormValues) => {
    if (projects.length >= MAX_PROJECTS) {
      message.warning(t("sidebar.limitReached"));
      return;
    }

    setIsSaving(true);
    try {
      const project = await createProject({
        name: values.name.trim(),
        color: values.color || DEFAULT_PROJECT_COLOR,
        description: values.description?.trim(),
      });
      onSelectProject(project.id);
      setIsModalOpen(false);
      form.resetFields();
      message.success(t("sidebar.projectCreated"));
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : t("sidebar.projectCreateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      message.success(t("sidebar.projectDeleted"));
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : t("sidebar.projectDeleteFailed"));
    }
  };

  const items: MenuProps["items"] = projects.map((project) => ({
    key: project.id,
    label: (
      <div className="flex items-center justify-between gap-2 pr-1">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <span className="truncate">{project.name}</span>
        </span>
        <Popconfirm
          title={t("sidebar.deleteProjectTitle")}
          description={t("sidebar.deleteProjectDescription")}
          okText={t("sidebar.delete")}
          cancelText={t("sidebar.cancel")}
          okButtonProps={{ danger: true }}
          onConfirm={() => void handleDelete(project.id)}
        >
          <Tooltip title={t("sidebar.deleteProjectTooltip")}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={t("sidebar.deleteProjectAria", { name: project.name })}
              onClick={(event) => event.stopPropagation()}
            />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  }));

  const atLimit = projects.length >= MAX_PROJECTS;

  return (
    <aside className="flex h-full flex-col bg-white dark:bg-slate-900">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white">
          <AppstoreOutlined />
        </span>
        {!collapsed && (
          <Text strong className="truncate text-slate-900 dark:text-slate-50">
            {t("sidebar.brand")}
          </Text>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        {!collapsed && (
          <div className="mb-2 flex items-center justify-between gap-2 px-4">
            <Text type="secondary" className="text-xs font-semibold uppercase tracking-wide">
              {t("sidebar.projects")}
            </Text>
            <Text type="secondary" className="text-xs tabular-nums">
              {t("sidebar.projectCount", { count: projects.length, limit: MAX_PROJECTS })}
            </Text>
          </div>
        )}
        <Menu
          mode="inline"
          theme={theme}
          selectedKeys={activeProjectId ? [activeProjectId] : []}
          items={items}
          onClick={({ key }) => onSelectProject(key)}
          className="border-0 bg-transparent"
        />
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <Space direction="vertical" size="small" className="w-full">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            block={!collapsed}
            disabled={atLimit}
            title={atLimit ? t("sidebar.limitReached") : undefined}
            aria-label={t("sidebar.newProject")}
            onClick={() => setIsModalOpen(true)}
          >
            {!collapsed && t("sidebar.newProject")}
          </Button>
          {projects.length === 0 && (
            <Button
              icon={<ThunderboltOutlined />}
              block={!collapsed}
              loading={isLoading}
              aria-label={t("sidebar.loadExample")}
              onClick={onLoadExample}
            >
              {!collapsed && t("sidebar.loadExample")}
            </Button>
          )}
        </Space>
      </div>

      <Modal
        title={t("sidebar.newProject")}
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ color: DEFAULT_PROJECT_COLOR }}
          onFinish={(values) => void handleCreate(values)}
        >
          <Form.Item
            name="name"
            label={t("sidebar.name")}
            rules={[
              { required: true, message: t("sidebar.enterName") },
              { max: 80, message: t("sidebar.nameMax") },
            ]}
          >
            <Input placeholder={t("sidebar.nameExample")} maxLength={80} autoFocus />
          </Form.Item>
          <Form.Item name="color" label={t("sidebar.color")}>
            <Input type="color" className="h-10 cursor-pointer p-1" />
          </Form.Item>
          <Form.Item name="description" label={t("sidebar.description")}>
            <Input.TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder={t("sidebar.optional")}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isSaving}>
            {t("sidebar.createProject")}
          </Button>
        </Form>
      </Modal>
    </aside>
  );
};
