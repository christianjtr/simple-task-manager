import { configureStore } from "@reduxjs/toolkit";

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { App as AntApp } from "antd";
import { Provider } from "react-redux";
import { type MockedFunction, vi } from "vitest";
import { useTaskService } from "../../../hooks/useTaskService";
import taskSlice from "../../../store/taskSlice";
import { type Task, TaskStatus } from "../../../types/task";
import { TaskBoard } from "../TaskBoard";

vi.mock("../../../hooks/useTaskService", () => ({
  useTaskService: vi.fn(),
}));

const mockUseTaskService = useTaskService as MockedFunction<typeof useTaskService>;
const messageMock = { success: vi.fn(), error: vi.fn() };

const task = (id: string, status: TaskStatus): Task => ({
  id,
  title: `Task ${id}`,
  description: "description",
  status,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const reload = vi.fn();
const moveTask = vi.fn();

const renderBoard = () => {
  const store = configureStore({ reducer: { tasks: taskSlice } });
  return render(
    <Provider store={store}>
      <TaskBoard />
    </Provider>,
  );
};

describe("TaskBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reload.mockResolvedValue(undefined);
    vi.spyOn(AntApp, "useApp").mockReturnValue({
      message: messageMock,
    } as never);
    mockUseTaskService.mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
      connectionStatus: "connected",
      reload,
      moveTask,
      createTask: vi.fn(),
      updateTaskById: vi.fn(),
      deleteTask: vi.fn(),
    });
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
    mockUseTaskService.mockReturnValue({
      ...mockUseTaskService(),
      tasks: [
        task("1", TaskStatus.TODO),
        task("2", TaskStatus.IN_PROGRESS),
        task("3", TaskStatus.DONE),
      ],
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
    mockUseTaskService.mockReturnValue({
      ...mockUseTaskService(),
      tasks: [task("1", TaskStatus.TODO)],
    });
    moveTask.mockResolvedValueOnce(undefined);
    renderBoard();

    fireEvent.click(screen.getByLabelText("Move Task 1 to next column"));

    await waitFor(() => expect(moveTask).toHaveBeenCalledWith("1", TaskStatus.IN_PROGRESS, 0));
    await waitFor(() =>
      expect(messageMock.success).toHaveBeenCalledWith("Task 1 moved to IN_PROGRESS"),
    );
  });

  it("reports a failed move without crashing", async () => {
    mockUseTaskService.mockReturnValue({
      ...mockUseTaskService(),
      tasks: [task("1", TaskStatus.TODO)],
    });
    moveTask.mockRejectedValueOnce(new Error("network down"));
    renderBoard();

    fireEvent.click(screen.getByLabelText("Move Task 1 to next column"));
    await waitFor(() => expect(messageMock.error).toHaveBeenCalled());
    expect(messageMock.error.mock.calls[0][0]).toContain("network down");
  });

  it("shows load errors and allows retrying", () => {
    mockUseTaskService.mockReturnValue({
      ...mockUseTaskService(),
      error: "API unavailable",
    });
    renderBoard();

    expect(screen.getByText("API unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
