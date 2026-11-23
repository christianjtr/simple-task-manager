import { importBackupIntoDb } from "@src/features/tasks/task.repository";
import { useProjects } from "@src/hooks/useProjects";
import { useTasks } from "@src/hooks/useTasks";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { App as AntApp } from "antd";
import { type MockedFunction, vi } from "vitest";
import { BackupActions } from "../BackupActions";

vi.mock("@src/features/tasks/task.repository", () => ({
  importBackupIntoDb: vi.fn(),
}));

vi.mock("@src/hooks/useProjects", () => ({
  useProjects: vi.fn(),
}));

vi.mock("@src/hooks/useTasks", () => ({
  useTasks: vi.fn(),
}));

const mockImport = importBackupIntoDb as MockedFunction<typeof importBackupIntoDb>;
const mockUseProjects = useProjects as MockedFunction<typeof useProjects>;
const mockUseTasks = useTasks as MockedFunction<typeof useTasks>;
const messageMock = { success: vi.fn(), error: vi.fn() };

const renderActions = () =>
  render(
    <AntApp>
      <BackupActions />
    </AntApp>,
  );

const openMenu = () => fireEvent.click(screen.getByRole("button", { name: /Datos/ }));

describe("BackupActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AntApp, "useApp").mockReturnValue({ message: messageMock } as never);
    mockUseProjects.mockReturnValue({ projects: [], isLoading: false });
    mockUseTasks.mockReturnValue({ tasks: [], isLoading: false });
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:test"),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("exports the full backup as a JSON download", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderActions();

    openMenu();
    fireEvent.click(screen.getByText("Exportar JSON"));

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(messageMock.success).toHaveBeenCalledWith("Respaldo exportado");
  });

  it("imports a selected JSON file and reports counts", async () => {
    const backup = { version: 1, exportedAt: "2026-01-01T00:00:00.000Z", projects: [], tasks: [] };
    const file = new File([JSON.stringify(backup)], "backup.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
      value: vi.fn().mockResolvedValue(JSON.stringify(backup)),
    });
    mockImport.mockResolvedValue({
      projects: [],
      tasks: [],
      importedProjects: 1,
      importedTasks: 2,
      skippedProjects: 0,
      skippedTasks: 1,
    });
    renderActions();

    openMenu();
    fireEvent.click(screen.getByText("Importar JSON"));
    fireEvent.change(screen.getByLabelText("Archivo de respaldo"), {
      target: { files: [file] },
    });

    await waitFor(() => expect(mockImport).toHaveBeenCalledWith(backup));
    expect(await screen.findByText("Importación completada")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
