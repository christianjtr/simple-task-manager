import { ClearOutlined, SearchOutlined } from "@ant-design/icons";
import type { TaskPriority } from "@src/features/tasks/task.types";
import { Button, Input, Select, Space } from "antd";

const { Option } = Select;

interface TaskFiltersBarProps {
  search: string;
  priority?: TaskPriority;
  tag?: string;
  tags: string[];
  onSearch: (value: string) => void;
  onPriority: (value?: TaskPriority) => void;
  onTag: (value?: string) => void;
  onClear: () => void;
}

export const TaskFiltersBar = ({
  search,
  priority,
  tag,
  tags,
  onSearch,
  onPriority,
  onTag,
  onClear,
}: TaskFiltersBarProps) => (
  <Space wrap className="mb-4 w-full" size="small">
    <Input.Search
      allowClear
      prefix={<SearchOutlined />}
      placeholder="Buscar tareas..."
      aria-label="Buscar tareas"
      value={search}
      onChange={(event) => onSearch(event.target.value)}
      className="w-full sm:w-64"
    />
    <Select<TaskPriority>
      allowClear
      placeholder="Prioridad"
      aria-label="Filtrar por prioridad"
      value={priority}
      onChange={onPriority}
      className="w-36"
    >
      <Option value="low">Baja</Option>
      <Option value="medium">Media</Option>
      <Option value="high">Alta</Option>
    </Select>
    <Select<string>
      allowClear
      placeholder="Tag"
      aria-label="Filtrar por tag"
      value={tag}
      onChange={onTag}
      className="w-36"
    >
      {tags.map((item) => (
        <Option key={item} value={item}>
          {item}
        </Option>
      ))}
    </Select>
    <Button icon={<ClearOutlined />} onClick={onClear} disabled={!search && !priority && !tag}>
      Limpiar
    </Button>
  </Space>
);
