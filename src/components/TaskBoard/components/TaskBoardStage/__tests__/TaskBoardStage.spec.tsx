import { DndContext } from "@dnd-kit/core";
import { type Task, TaskStatus } from "@src/features/tasks/task.types";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { TaskBoardStage } from "../TaskBoardStage";

vi.mock("@components/OptimizedImage/OptimizedImage", () => ({
  OptimizedImage: () => <div data-testid="optimized-image" />,
}));

const task = (id: string, status: TaskStatus): Task => ({
  id: `task-${id}`,
  projectId: "project_1",
  title: `Task ${id}`,
  description: "description",
  status,
  position: Number(id),
  priority: "medium",
  tags: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

const onMoveTask = vi.fn().mockResolvedValue(undefined);

const renderStage = (tasks: Task[], status = TaskStatus.TODO) =>
  render(
    <DndContext>
      <TaskBoardStage
        id={status}
        title="To Do"
        status={status}
        tasks={tasks}
        onMoveTask={onMoveTask}
      />
    </DndContext>,
  );

describe("TaskBoardStage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders an empty column with a drop hint", () => {
    renderStage([]);
    expect(screen.getByText("Drop tasks here")).toBeInTheDocument();
  });

  it("exposes a keyboard-accessible drag handle for each task", () => {
    renderStage([task("1", TaskStatus.TODO)]);

    const handle = screen.getByRole("button", { name: "Arrastrar Task 1" });
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute("tabindex", "0");
  });

  it("moves to the next column and reorders with keyboard controls", () => {
    renderStage([task("1", TaskStatus.TODO), task("2", TaskStatus.TODO)]);

    fireEvent.click(screen.getByLabelText("Move Task 1 to next column"));
    expect(onMoveTask).toHaveBeenCalledWith("task-1", TaskStatus.IN_PROGRESS, 0);

    fireEvent.click(screen.getByLabelText("Move Task 1 down"));
    expect(onMoveTask).toHaveBeenCalledWith("task-1", TaskStatus.TODO, 1);
  });

  it("does not offer a previous column in the first stage", () => {
    renderStage([task("1", TaskStatus.TODO)]);
    expect(screen.getByLabelText("Move Task 1 to previous column")).toBeDisabled();
    expect(screen.getByLabelText("Move Task 1 to next column")).toBeEnabled();
  });
});
