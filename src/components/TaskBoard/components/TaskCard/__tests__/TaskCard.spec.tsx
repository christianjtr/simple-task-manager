import { DndContext } from "@dnd-kit/core";
import { type Task, TaskStatus } from "@src/features/tasks/task.types";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { App as AntApp } from "antd";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskCard } from "../TaskCard";

const longDescription =
  "This description is intentionally long enough to cross the preview limit so the card can offer an expandable view without hiding the full task text from the user.";

const baseTask: Task = {
  id: "task-1",
  projectId: "project_1",
  title: "Design board",
  description: longDescription,
  status: TaskStatus.TODO,
  position: 0,
  priority: "medium",
  tags: ["design"],
  dueDate: undefined,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date(),
};

const renderCard = (overrides: Partial<Task> = {}) => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(
    <AntApp>
      <DndContext>
        <TaskCard {...baseTask} {...overrides} onEdit={onEdit} onDelete={onDelete} />
      </DndContext>
    </AntApp>,
  );

  return { onEdit, onDelete };
};

describe("TaskCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("clamps long descriptions and toggles show more and show less", () => {
    renderCard();

    expect(screen.getByTestId("task-description")).toHaveClass("line-clamp-2");
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));

    expect(screen.getByTestId("task-description")).not.toHaveClass("line-clamp-2");
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("does not offer the toggle for short descriptions", () => {
    renderCard({ description: "Short description" });

    expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
  });

  it("shows the date below the title and tags without a separator", () => {
    renderCard();

    expect(screen.getByTestId("task-card-updated").closest(".ant-card-body")).not.toBeNull();
    expect(screen.getByTestId("task-card-tags")).toHaveTextContent("design");
    expect(screen.getByTestId("task-card-tags")).not.toHaveClass("border-t");
  });

  it("opens the contextual menu and edits the task", async () => {
    const { onEdit } = renderCard();

    fireEvent.click(screen.getByRole("button", { name: "Actions for Design board" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: "task-1", title: "Design board" }),
    );
  });

  it("deletes the task after confirmation from the contextual menu", async () => {
    const { onDelete } = renderCard();

    fireEvent.click(screen.getByRole("button", { name: "Actions for Design board" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /delete/i }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("task-1"));
  });
});
