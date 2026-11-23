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
} from "@src/features/tasks/task.repository";
import type { Project } from "@src/features/tasks/task.types";
import type { ThemeMode } from "@src/hooks/useTheme";
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
      message.success("Proyecto creado");
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : "No se pudo crear el proyecto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      message.success("Proyecto eliminado");
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : "No se pudo eliminar el proyecto");
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
          title="¿Eliminar proyecto?"
          description="Se eliminarán también sus tareas."
          okText="Eliminar"
          cancelText="Cancelar"
          okButtonProps={{ danger: true }}
          onConfirm={() => void handleDelete(project.id)}
        >
          <Tooltip title="Eliminar proyecto">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Eliminar ${project.name}`}
              onClick={(event) => event.stopPropagation()}
            />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  }));

  return (
    <aside className="flex h-full flex-col bg-white dark:bg-slate-900">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white">
          <AppstoreOutlined />
        </span>
        {!collapsed && (
          <Text strong className="truncate text-slate-900 dark:text-slate-50">
            Simple Tasks
          </Text>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        {!collapsed && (
          <Text
            type="secondary"
            className="mb-2 block px-4 text-xs font-semibold uppercase tracking-wide"
          >
            Proyectos
          </Text>
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
            aria-label="Nuevo proyecto"
            onClick={() => setIsModalOpen(true)}
          >
            {!collapsed && "Nuevo proyecto"}
          </Button>
          {projects.length === 0 && (
            <Button
              icon={<ThunderboltOutlined />}
              block={!collapsed}
              loading={isLoading}
              aria-label="Cargar ejemplo"
              onClick={onLoadExample}
            >
              {!collapsed && "Cargar ejemplo"}
            </Button>
          )}
        </Space>
      </div>

      <Modal
        title="Nuevo proyecto"
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ color: DEFAULT_PROJECT_COLOR }}
          onFinish={(values) => void handleCreate(values)}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[
              { required: true, message: "Ingresa un nombre" },
              { max: 80, message: "Máximo 80 caracteres" },
            ]}
          >
            <Input placeholder="Ej. Trabajo" maxLength={80} autoFocus />
          </Form.Item>
          <Form.Item name="color" label="Color">
            <Input type="color" className="h-10 cursor-pointer p-1" />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={3} maxLength={500} showCount placeholder="Opcional" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isSaving}>
            Crear proyecto
          </Button>
        </Form>
      </Modal>
    </aside>
  );
};
