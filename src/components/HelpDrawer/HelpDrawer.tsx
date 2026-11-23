import { QuestionCircleOutlined } from "@ant-design/icons";
import { t } from "@src/i18n/en";
import { Button, Drawer, Space, Tooltip, Typography } from "antd";
import { useState } from "react";

const { Paragraph, Text, Title } = Typography;

const BACKUP_EXAMPLE = `{
  "version": 1,
  "exportedAt": "2026-11-23T12:00:00.000Z",
  "projects": [
    {
      "id": "project_1",
      "name": "Work",
      "color": "#6366f1",
      "description": "",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "tasks": [
    {
      "id": "task_1",
      "projectId": "project_1",
      "title": "Prepare meeting",
      "description": "",
      "status": "TODO",
      "position": 0,
      "priority": "medium",
      "tags": [],
      "dueDate": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}`;

export const HelpDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip title={t("help.buttonTooltip")}>
        <Button
          type="text"
          aria-label={t("help.buttonAria")}
          icon={<QuestionCircleOutlined />}
          onClick={() => setIsOpen(true)}
        />
      </Tooltip>

      <Drawer
        title={t("help.title")}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width={480}
        destroyOnHidden
        footer={
          <Button type="primary" onClick={() => setIsOpen(false)}>
            {t("help.close")}
          </Button>
        }
      >
        <Space direction="vertical" size="large" className="w-full">
          <section>
            <Title level={5} className="mb-2">
              {t("help.aboutTitle")}
            </Title>
            <Paragraph className="mb-0">{t("help.aboutText")}</Paragraph>
          </section>

          <section>
            <Title level={5} className="mb-2">
              {t("help.storageTitle")}
            </Title>
            <Paragraph>{t("help.storageText")}</Paragraph>
            <ul className="mb-0 list-disc space-y-1 pl-5">
              <li>{t("help.storageItem1")}</li>
              <li>{t("help.storageItem2")}</li>
              <li>{t("help.storageItem3")}</li>
            </ul>
          </section>

          <section>
            <Title level={5} className="mb-2">
              {t("help.contractTitle")}
            </Title>
            <Paragraph>{t("help.contractText")}</Paragraph>
            <Text className="mb-2 block text-xs font-semibold uppercase tracking-wide">
              {t("help.exampleLabel")}
            </Text>
            <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-950">
              <code>{BACKUP_EXAMPLE}</code>
            </pre>
            <Paragraph type="secondary" className="mb-0 mt-2">
              {t("help.contractValues")}
            </Paragraph>
          </section>

          <section>
            <Title level={5} className="mb-2">
              {t("help.rulesTitle")}
            </Title>
            <ul className="mb-0 list-disc space-y-1 pl-5">
              <li>{t("help.rulesItem1")}</li>
              <li>{t("help.rulesItem2")}</li>
              <li>{t("help.rulesItem3")}</li>
              <li>{t("help.rulesItem4")}</li>
            </ul>
          </section>
        </Space>
      </Drawer>
    </>
  );
};
