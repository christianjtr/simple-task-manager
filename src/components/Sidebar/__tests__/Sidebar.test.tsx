import type { Project } from "@src/features/tasks/task.types";
import { render, screen } from "@testing-library/react";
import { App as AntApp } from "antd";
import { vi } from "vitest";
import { Sidebar } from "../Sidebar";

const projects: Project[] = Array.from({ length: 50 }, (_, index) => ({
  id: `project-${index + 1}`,
  name: `Project ${index + 1}`,
  color: "#6366f1",
  description: "",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
}));

describe("Sidebar", () => {
  it("shows the project limit and disables creation when full", () => {
    render(
      <AntApp>
        <Sidebar
          projects={projects}
          collapsed={false}
          theme="light"
          onSelectProject={vi.fn()}
          onLoadExample={vi.fn()}
        />
      </AntApp>,
    );

    expect(screen.getByText("50 / 50")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New project" })).toBeDisabled();
  });
});
