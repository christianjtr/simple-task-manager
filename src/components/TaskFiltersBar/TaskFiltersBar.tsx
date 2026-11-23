import { ClearOutlined, SearchOutlined } from "@ant-design/icons";
import type { TaskPriority } from "@src/features/tasks/task.types";
import { t } from "@src/i18n/en";
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
      placeholder={t("filters.searchPlaceholder")}
      aria-label={t("filters.searchAria")}
      value={search}
      onChange={(event) => onSearch(event.target.value)}
      className="w-full sm:w-64"
    />
    <Select<TaskPriority>
      allowClear
      placeholder={t("filters.priorityPlaceholder")}
      aria-label={t("filters.priorityAria")}
      value={priority}
      onChange={onPriority}
      className="w-36"
    >
      <Option value="low">{t("priority.low")}</Option>
      <Option value="medium">{t("priority.medium")}</Option>
      <Option value="high">{t("priority.high")}</Option>
    </Select>
    <Select<string>
      allowClear
      placeholder={t("filters.tagPlaceholder")}
      aria-label={t("filters.tagAria")}
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
      {t("filters.clear")}
    </Button>
  </Space>
);
