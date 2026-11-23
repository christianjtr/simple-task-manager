import type { Project } from "@src/features/tasks/task.types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type MockedFunction, vi } from "vitest";
import { useActiveProject } from "../useActiveProject";
import { useProjects } from "../useProjects";

vi.mock("../useProjects", () => ({
  useProjects: vi.fn(),
}));

const mockUseProjects = useProjects as MockedFunction<typeof useProjects>;

const project = (id: string): Project => ({
  id,
  name: `Project ${id}`,
  color: "#6366f1",
  description: "",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

describe("useActiveProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseProjects.mockReturnValue({ projects: [project("p1"), project("p2")], isLoading: false });
  });

  it("falls back to the first project when none is stored", async () => {
    const { result } = renderHook(() => useActiveProject());

    expect(result.current.activeProject?.id).toBe("p1");
    await waitFor(() =>
      expect(localStorage.getItem("simple-task-manager:active-project")).toBe("p1"),
    );
  });

  it("persists an explicit project selection", async () => {
    const { result } = renderHook(() => useActiveProject());

    act(() => result.current.setActiveProject("p2"));

    expect(result.current.activeProject?.id).toBe("p2");
    await waitFor(() =>
      expect(localStorage.getItem("simple-task-manager:active-project")).toBe("p2"),
    );
  });
});
