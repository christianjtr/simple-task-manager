import { configureStore } from "@reduxjs/toolkit";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { App as AntApp } from "antd";
import { Provider } from "react-redux";

import { TaskBoard } from "@src/components/TaskBoard/TaskBoard";
import { mockApi } from "@src/services/mockApi";
import { mockWebSocket } from "@src/services/mockWebSocket";
import taskSlice from "@src/store/taskSlice";
import { TaskStatus } from "@src/types/task";

const setup = () => {
  const store = configureStore({ reducer: { tasks: taskSlice } });
  return render(
    <Provider store={store}>
      <AntApp>
        <TaskBoard />
      </AntApp>
    </Provider>
  );
};

describe("realtime task board integration", () => {
  beforeEach(() => {
    mockApi.reset();
  });

  afterEach(() => {
    cleanup();
    mockWebSocket.disconnect();
  });

  it("loads tasks from the API and reflects a remote update in the UI", async () => {
    setup();

    expect(
      await screen.findByTestId("task_card_item_task-1", {}, { timeout: 3000 })
    ).toBeInTheDocument();

    await act(async () => {
      await mockApi.updateTask("task-1", {
        id: "task-1",
        title: "Renamed remotely",
      });
    });

    expect(await screen.findByText("Renamed remotely", {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it("propagates a drag between columns through the service and store", async () => {
    const { container } = setup();
    await screen.findByTestId("task_card_item_task-1", {}, { timeout: 3000 });

    const dataTransfer = {
      setData: jest.fn(),
      getData: jest.fn().mockReturnValue("task-1"),
      effectAllowed: "",
    };
    fireEvent.dragStart(screen.getByTestId("task_card_item_task-1"), {
      dataTransfer,
    });

    const doneColumn = screen.getByTestId("task_board_stage_item_DONE");
    fireEvent.drop(doneColumn, { dataTransfer });

    await waitFor(
      () =>
        expect(
          within(doneColumn).getByTestId("task_card_item_task-1")
        ).toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(container.querySelectorAll('[data-testid^="task_card_item_"]')).toHaveLength(75);
    expect(
      await screen.findByText(/moved to DONE/, {}, { timeout: 2000 })
    ).toBeInTheDocument();
  });

  it("keeps all three columns when a status has no tasks", async () => {
    setup();
    await screen.findByTestId("task_card_item_task-1", {}, { timeout: 3000 });

    await act(async () => {
      await mockApi.updateTask("task-1", {
        id: "task-1",
        status: TaskStatus.DONE,
      });
    });

    expect(
      screen.getByTestId("task_board_stage_item_TODO")
    ).toBeInTheDocument();
  });
});
