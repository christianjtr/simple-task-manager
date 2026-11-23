import { DatabaseOutlined, ExportOutlined, ImportOutlined } from "@ant-design/icons";
import { exportBackup, type ImportResult } from "@src/features/tasks/task.import-export";
import { importBackupIntoDb } from "@src/features/tasks/task.repository";
import { useProjects } from "@src/hooks/useProjects";
import { useTasks } from "@src/hooks/useTasks";
import { t } from "@src/i18n/en";
import { App as AntApp, Button, Dropdown, Modal, Typography } from "antd";
import { type ChangeEvent, useRef, useState } from "react";

const { Paragraph, Text } = Typography;

export const BackupActions = () => {
  const { message } = AntApp.useApp();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleExport = () => {
    const backup = exportBackup(projects, tasks);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tasklane-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    message.success(t("backup.exportSuccess"));
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const value: unknown = JSON.parse(await file.text());
      const result = await importBackupIntoDb(value);
      setImportResult(result);
      message.success(t("backup.importSuccess"));
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : t("backup.importFailed"));
    } finally {
      event.target.value = "";
      setIsImporting(false);
    }
  };

  return (
    <>
      <Dropdown
        trigger={["click"]}
        menu={{
          items: [
            {
              key: "export",
              icon: <ExportOutlined />,
              label: t("backup.exportJson"),
              onClick: handleExport,
            },
            {
              key: "import",
              icon: <ImportOutlined />,
              label: isImporting ? t("backup.importing") : t("backup.importJson"),
              disabled: isImporting,
              onClick: () => fileInputRef.current?.click(),
            },
          ],
        }}
      >
        <Button icon={<DatabaseOutlined />} aria-label={t("backup.data")}>
          {t("backup.data")}
        </Button>
      </Dropdown>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label={t("backup.fileAria")}
        onChange={(event) => void handleFileChange(event)}
      />

      <Modal
        title={t("backup.importComplete")}
        open={Boolean(importResult)}
        onCancel={() => setImportResult(null)}
        footer={
          <Button type="primary" onClick={() => setImportResult(null)}>
            {t("backup.close")}
          </Button>
        }
      >
        <Paragraph>
          {t("backup.importedProjects")} <Text strong>{importResult?.importedProjects ?? 0}</Text>
        </Paragraph>
        <Paragraph>
          {t("backup.importedTasks")} <Text strong>{importResult?.importedTasks ?? 0}</Text>
        </Paragraph>
        <Paragraph type="secondary">
          {t("backup.skipped", {
            projects: importResult?.skippedProjects ?? 0,
            tasks: importResult?.skippedTasks ?? 0,
          })}
        </Paragraph>
      </Modal>
    </>
  );
};
