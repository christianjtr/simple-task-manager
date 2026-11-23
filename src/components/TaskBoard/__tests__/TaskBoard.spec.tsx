import { moveTask } from "@src/features/tasks/task.repository";
import { type Task, TaskStatus } from "@src/features/tasks/task.types";
import { useTasks } from "@src/hooks/useTasks";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { App as AntApp } from "antd";
import { type MockedFunction, vi } from "vitest";
import { TaskBoard } from "../TaskBoard";

vi.mock("@src/hooks/useTasks", () => ({
  useTasks: vi.fn(),
}));

vi.mock("@src/features/tasks/task.repository", () => ({
  moveTask: vi.fn(),
}));

const mockUseTasks = useTasks as MockedFunction<typeof useTasks>;
const mockMoveTask = moveTask as MockedFunction<typeof moveTask>;
const messageMock = { success: vi.fn(), error: vi.fn() };

const task = (id: string, status: TaskStatus): Task => ({
  id,
  projectId: "project_1",
  title: `Task ${id}`,
  description: "description",
  status,
  position: 0,
  priority: "medium",
  tags: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

const renderBoard = () =>
  render(
    <AntApp>
      <TaskBoard />
    </AntApp>,
  );

describe("TaskBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AntApp, "useApp").mockReturnValue({
      message: messageMock,
    } as never);
    mockUseTasks.mockReturnValue({ tasks: [], isLoading: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("always renders the three columns", () => {
    renderBoard();

    expect(screen.getByTestId("task_board_stage_item_TODO")).toBeInTheDocument();
    expect(screen.getByTestId("task_board_stage_item_IN_PROGRESS")).toBeInTheDocument();
    expect(screen.getByTestId("task_board_stage_item_DONE")).toBeInTheDocument();
    expect(screen.getAllByText("Drop tasks here")).toHaveLength(3);
  });

  it("groups tasks by status", () => {
    mockUseTasks.mockReturnValue({
      tasks: [
        task("1", TaskStatus.TODO),
        task("2", TaskStatus.IN_PROGRESS),
        task("3", TaskStatus.DONE),
      ],
      isLoading: false,
    });
    renderBoard();

    expect(
      within(screen.getByTestId("task_board_stage_item_TODO")).getByTestId("task_card_item_1"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("task_board_stage_item_IN_PROGRESS")).getByTestId(
        "task_card_item_2",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("task_board_stage_item_DONE")).getByTestId("task_card_item_3"),
    ).toBeInTheDocument();
  });

  it("moves a task with the keyboard control and reports success", async () => {
    mockUseTasks.mockReturnValue({
      tasks: [task("1", TaskStatus.TODO)],
      isLoading: false,
    });
    mockMoveTask.mockResolvedValue(task("1", TaskStatus.IN_PROGRESS));
    renderBoard();

    fireEvent.click(screen.getByLabelText("Move Task 1 to next column"));

    await waitFor(() => expect(mockMoveTask).toHaveBeenCalledWith("1", TaskStatus.IN_PROGRESS, 0));
    await waitFor(() =>
      expect(messageMock.success).toHaveBeenCalledWith("Task 1 moved to IN_PROGRESS"),
    );
  });

  it("reports a failed move without crashing", async () => {
    mockUseTasks.mockReturnValue({
      tasks: [task("1", TaskStatus.TODO)],
      isLoading: false,
    });
    mockMoveTask.mockRejectedValue(new Error("network down"));
    renderBoard();

    fireEvent.click(screen.getByLabelText("Move Task 1 to next column"));
    await waitFor(() => expect(messageMock.error).toHaveBeenCalled());
    expect(messageMock.error.mock.calls[0][0]).toContain("network down");
  });
});
