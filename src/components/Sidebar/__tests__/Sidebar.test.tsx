import { db } from "@src/db/database";
import { createProject, getProject, MAX_PROJECTS } from "@src/features/tasks/task.repository";
import type { Project } from "@src/features/tasks/task.types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { App as AntApp } from "antd";
import { vi } from "vitest";
import { Sidebar } from "../Sidebar";

const projects: Project[] = Array.from({ length: MAX_PROJECTS }, (_, index) => ({
  id: `project-${index + 1}`,
  name: `Project ${index + 1}`,
  color: "#6366f1",
  description: "",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
}));

beforeEach(async () => {
  await db.delete();
  await db.open();
});

afterAll(() => {
  db.close();
});

const renderSidebar = (
  items: Project[],
  onSelectProject = vi.fn(),
  collapsed = false,
  onToggleSidebar = vi.fn(),
) => {
  render(
    <AntApp>
      <Sidebar
        projects={items}
        collapsed={collapsed}
        theme="light"
        onSelectProject={onSelectProject}
        onLoadExample={vi.fn()}
        onToggleSidebar={onToggleSidebar}
      />
    </AntApp>,
  );
  return { onSelectProject, onToggleSidebar };
};

describe("Sidebar", () => {
  it("shows the project limit and disables creation when full", () => {
    renderSidebar(projects);

    expect(screen.getByRole("heading", { name: "Tasklane" })).toHaveStyle({
      fontSize: "28px",
      marginBottom: "0px",
    });
    expect(screen.getByTestId("sidebar-brand")).toHaveClass("items-center");
    expect(screen.getByText("50 / 50")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New project" })).toBeDisabled();
  });

  it("toggles the sidebar from the top control with a collapse chevron", () => {
    const { onToggleSidebar } = renderSidebar([], vi.fn(), false, vi.fn());
    const toggle = screen.getByRole("button", { name: "Toggle sidebar" });

    expect(toggle.querySelector('[data-icon="double-left"]')).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(onToggleSidebar).toHaveBeenCalledOnce();
  });

  it("shows an expand chevron and hides the brand when collapsed", () => {
    renderSidebar([], vi.fn(), true, vi.fn());

    expect(
      screen
        .getByRole("button", { name: "Toggle sidebar" })
        .querySelector('[data-icon="double-right"]'),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tasklane" })).not.toBeInTheDocument();
  });

  it("edits a project from its context menu without selecting it", async () => {
    const project = await createProject({
      name: "Work",
      color: "#111111",
      description: "Old description",
    });
    const { onSelectProject } = renderSidebar([project]);

    fireEvent.click(screen.getByRole("button", { name: "Actions for Work" }));
    fireEvent.click(await screen.findByText("Edit project"));

    expect(onSelectProject).not.toHaveBeenCalled();
    expect(await screen.findByDisplayValue("Work")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Work Updated" } });
    fireEvent.change(screen.getByLabelText("Color"), { target: { value: "#222222" } });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Updated description" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(async () => {
      expect((await getProject(project.id))?.name).toBe("Work Updated");
    });
    expect((await getProject(project.id))?.color).toBe("#222222");
    expect((await getProject(project.id))?.description).toBe("Updated description");
  });

  it("deletes a project from its context menu after confirmation", async () => {
    const project = await createProject({ name: "Temporary" });
    renderSidebar([project]);

    fireEvent.click(screen.getByRole("button", { name: "Actions for Temporary" }));
    fireEvent.click(await screen.findByText("Delete"));

    expect((await screen.findAllByText("Delete project?")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(async () => {
      expect(await getProject(project.id)).toBeUndefined();
    });
  });
});
