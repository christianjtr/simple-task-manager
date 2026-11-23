import { DatabaseOutlined, ExportOutlined, ImportOutlined } from "@ant-design/icons";
import { exportBackup, type ImportResult } from "@src/features/tasks/task.import-export";
import { importBackupIntoDb } from "@src/features/tasks/task.repository";
import { useProjects } from "@src/hooks/useProjects";
import { useTasks } from "@src/hooks/useTasks";
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
    anchor.download = `simple-task-manager-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    message.success("Respaldo exportado");
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const value: unknown = JSON.parse(await file.text());
      const result = await importBackupIntoDb(value);
      setImportResult(result);
      message.success("Respaldo importado");
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : "No se pudo importar el respaldo");
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
              label: "Exportar JSON",
              onClick: handleExport,
            },
            {
              key: "import",
              icon: <ImportOutlined />,
              label: isImporting ? "Importando..." : "Importar JSON",
              disabled: isImporting,
              onClick: () => fileInputRef.current?.click(),
            },
          ],
        }}
      >
        <Button icon={<DatabaseOutlined />} aria-label="Datos">
          Datos
        </Button>
      </Dropdown>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Archivo de respaldo"
        onChange={(event) => void handleFileChange(event)}
      />

      <Modal
        title="Importación completada"
        open={Boolean(importResult)}
        onCancel={() => setImportResult(null)}
        footer={
          <Button type="primary" onClick={() => setImportResult(null)}>
            Cerrar
          </Button>
        }
      >
        <Paragraph>
          Proyectos importados: <Text strong>{importResult?.importedProjects ?? 0}</Text>
        </Paragraph>
        <Paragraph>
          Tareas importadas: <Text strong>{importResult?.importedTasks ?? 0}</Text>
        </Paragraph>
        <Paragraph type="secondary">
          Omitidos: {importResult?.skippedProjects ?? 0} proyectos,{" "}
          {importResult?.skippedTasks ?? 0} tareas
        </Paragraph>
      </Modal>
    </>
  );
};
