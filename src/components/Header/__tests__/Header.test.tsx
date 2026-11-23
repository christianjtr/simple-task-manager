import { importBackupIntoDb } from "@src/features/tasks/task.repository";
import type { Project } from "@src/features/tasks/task.types";
import { useProjects } from "@src/hooks/useProjects";
import { useTasks } from "@src/hooks/useTasks";
import { fireEvent, render, screen } from "@testing-library/react";
import { App as AntApp } from "antd";
import { type MockedFunction, vi } from "vitest";
import { Header } from "../Header";

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

const activeProject: Project = {
  id: "project-1",
  name: "Work",
  color: "#6366f1",
  description: "Project description",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const renderHeader = (theme: "light" | "dark" = "light", onToggleTheme = vi.fn()) => {
  render(
    <AntApp>
      <Header
        activeProject={activeProject}
        collapsed={false}
        theme={theme}
        onToggleSidebar={vi.fn()}
        onToggleTheme={onToggleTheme}
      />
    </AntApp>,
  );
  return { onToggleTheme };
};

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockImport.mockResolvedValue({
      projects: [],
      tasks: [],
      importedProjects: 0,
      importedTasks: 0,
      skippedProjects: 0,
      skippedTasks: 0,
    });
    mockUseProjects.mockReturnValue({ projects: [], isLoading: false });
    mockUseTasks.mockReturnValue({ tasks: [], isLoading: false });
  });

  it("uses the light surface token and ordered icon-only actions", () => {
    renderHeader();

    expect(screen.getByRole("banner")).toHaveClass("bg-[var(--surface)]");
    expect(
      screen.getAllByRole("button").map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Toggle sidebar", "Help", "Data", "Toggle theme"]);
    expect(screen.queryByText("Data")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Work" })).toBeInTheDocument();
  });

  it("uses the sun icon in dark mode and toggles the theme", () => {
    const { onToggleTheme } = renderHeader("dark");
    const themeButton = screen.getByRole("button", { name: "Toggle theme" });

    expect(themeButton.querySelector('[data-icon="sun"]')).toBeInTheDocument();
    fireEvent.click(themeButton);
    expect(onToggleTheme).toHaveBeenCalledOnce();
  });
});
