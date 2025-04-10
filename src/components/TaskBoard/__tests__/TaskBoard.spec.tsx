import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import toastr from "toastr";

import taskSlice, { TaskState } from "../../../store/taskSlice";
import { useAppSelector } from "../../../hooks/useReduxStore";
import { Task, TaskStatus } from "../../../types/task";
import { TaskBoardStage } from "../components/TaskBoardStage/TaskBoardStage";

import { TaskBoard } from "../TaskBoard";

function setupStore(preloadedState: { tasks: TaskState }) {
    return configureStore({
        reducer: {
            tasks: taskSlice,
        },
        preloadedState,
    });
}

jest.mock("toastr", () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

jest.mock("antd", () => ({
    Col: ({ children, ...rest }: { children: React.ReactNode }) => <div data-testid="col" {...rest}>{children}</div>,
    Row: ({ children, ...rest }: { children: React.ReactNode }) => <div data-testid="row" {...rest}>{children}</div>,
}));

jest.mock("../../../hooks/useReduxStore", () => ({
    useAppSelector: jest.fn(),
}));

jest.mock("../components/TaskBoardStage/TaskBoardStage", () => ({
    TaskBoardStage: jest.fn((props) => {
        if (props.tasks && props.tasks.length > 0) {
            return <div data-testid="task-board-stage">TaskBoardStage</div>;
        }
        return null;
    }),
}));

describe("TaskBoard component", () => {
    const mockTasks = [
        { id: "1", title: "Task 1", status: TaskStatus.TODO },
        { id: "2", title: "Task 2", status: TaskStatus.IN_PROGRESS },
        { id: "3", title: "Task 3", status: TaskStatus.DONE },
    ];

    const mockTransitionTask = jest.fn(() => Promise.resolve());

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render TaskBoard stages with tasks", () => {
        const store = setupStore({ tasks: { tasks: mockTasks as Task[], isLoading: false, error: null } });
        (useAppSelector as jest.Mock) = jest.fn().mockReturnValue(mockTasks);

        render(
            <Provider store={store}>
                <TaskBoard onTransitionTask={mockTransitionTask} />
            </Provider>
        );

        expect(TaskBoardStage).toHaveBeenCalledTimes(3);

        const expectedStages = [
            {
                title: "To Do",
                status: TaskStatus.TODO,
                tasks: [{ id: "1", title: "Task 1", status: TaskStatus.TODO, selected: false, chosen: false, filtered: false }],
            },
            {
                title: "In Progress",
                status: TaskStatus.IN_PROGRESS,
                tasks: [{ id: "2", title: "Task 2", status: TaskStatus.IN_PROGRESS, selected: false, chosen: false, filtered: false }],
            },
            {
                title: "Done",
                status: TaskStatus.DONE,
                tasks: [{ id: "3", title: "Task 3", status: TaskStatus.DONE, selected: false, chosen: false, filtered: false }],
            },
        ];

        expectedStages.forEach((expectedStage) => {
            expect(TaskBoardStage).toHaveBeenCalledWith(
                expect.objectContaining(expectedStage),
                expect.anything()
            );
        });
    });

    it("should call onTransitionTask and shows success toastr on successful transition", async () => {
        const store = setupStore({ tasks: { tasks: mockTasks as Task[], isLoading: false, error: null } });
        (useAppSelector as jest.Mock) = jest.fn().mockReturnValue(mockTasks);

        render(
            <Provider store={store}>
                <TaskBoard onTransitionTask={mockTransitionTask} />
            </Provider>
        );

        const mockHandleTransition = (TaskBoardStage as jest.Mock).mock.calls[0][0].onTransitionTask;

        await mockHandleTransition("1", TaskStatus.IN_PROGRESS);

        expect(mockTransitionTask).toHaveBeenCalledWith("1", { status: TaskStatus.IN_PROGRESS });
        expect(toastr.success).toHaveBeenCalledWith(`Task: 1, moved to ${TaskStatus.IN_PROGRESS}`, "Success");
    });

    it("should call onTransitionTask and shows error toastr on failed transition", async () => {
        const error = new Error("Transition failed");
        mockTransitionTask.mockRejectedValue(error);

        const store = setupStore({ tasks: { tasks: mockTasks as Task[], isLoading: false, error: null } });
        (useAppSelector as jest.Mock) = jest.fn().mockReturnValue(mockTasks);

        render(
            <Provider store={store}>
                <TaskBoard onTransitionTask={mockTransitionTask} />
            </Provider>
        );

        const mockHandleTransition = (TaskBoardStage as jest.Mock).mock.calls[0][0].onTransitionTask;

        await expect(mockHandleTransition("1", TaskStatus.IN_PROGRESS)).rejects.toThrow(error);

        expect(mockTransitionTask).toHaveBeenCalledWith("1", { status: TaskStatus.IN_PROGRESS });
        expect(toastr.error).toHaveBeenCalledWith(`Cannot transition task: 1, Issue: ${error}`, "Ups!");
    });

    it("should render empty stages if no data is provided", () => {
        const store = setupStore({ tasks: { tasks: [], isLoading: false, error: null } });
        (useAppSelector as jest.Mock) = jest.fn().mockReturnValue([]);

        render(
            <Provider store={store}>
                <TaskBoard onTransitionTask={mockTransitionTask} />
            </Provider>
        );

        const colElements = screen.getAllByTestId("col");

        colElements.forEach((colElement) => {
            expect(colElement.textContent).toBe("");
        });
    });
});
