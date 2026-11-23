import { type Task, TaskStatus } from "../../types/task";
import reducer, {
  addTask,
  moveTask,
  removeTask,
  reorderTasks,
  setError,
  setLoading,
  setTasks,
  type TaskState,
  updateTask,
} from "../taskSlice";

const makeTask = (id: string, status: TaskStatus): Task => ({
  id,
  title: `Task ${id}`,
  description: "description",
  status,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const state: TaskState = {
  tasks: [
    makeTask("1", TaskStatus.TODO),
    makeTask("2", TaskStatus.TODO),
    makeTask("3", TaskStatus.DONE),
  ],
  isLoading: false,
  error: null,
  connectionStatus: "connected",
};

describe("taskSlice", () => {
  it("merges partial updates without dropping fields", () => {
    const next = reducer(state, updateTask({ id: "1", title: "Renamed" }));
    expect(next.tasks[0]).toMatchObject({
      id: "1",
      title: "Renamed",
      description: "description",
      status: TaskStatus.TODO,
    });
  });

  it("moves a task to another column at the requested index", () => {
    const next = reducer(state, moveTask({ taskId: "1", status: TaskStatus.TODO, index: 2 }));
    expect(next.tasks.filter((task) => task.status === TaskStatus.TODO)).toEqual([
      expect.objectContaining({ id: "2" }),
      expect.objectContaining({ id: "1" }),
    ]);
  });

  it("keeps an empty column renderable by inserting into it", () => {
    const next = reducer(
      { ...state, tasks: [makeTask("1", TaskStatus.TODO)] },
      moveTask({ taskId: "1", status: TaskStatus.IN_PROGRESS, index: 0 }),
    );
    expect(next.tasks[0]).toMatchObject({
      id: "1",
      status: TaskStatus.IN_PROGRESS,
    });
  });

  it("applies an ordered list coming from the realtime channel", () => {
    const next = reducer(state, reorderTasks({ status: TaskStatus.TODO, ids: ["2", "1"] }));
    expect(next.tasks.filter((task) => task.status === TaskStatus.TODO).map((t) => t.id)).toEqual([
      "2",
      "1",
    ]);
  });

  it("adds, removes and tracks loading/error state", () => {
    const withTask = reducer(state, addTask(makeTask("4", TaskStatus.DONE)));
    expect(withTask.tasks).toHaveLength(4);
    const withoutTask = reducer(withTask, removeTask("4"));
    expect(withoutTask.tasks).toHaveLength(3);
    const loading = reducer(withoutTask, setLoading(true));
    expect(loading.isLoading).toBe(true);
    expect(reducer(loading, setError("boom")).error).toBe("boom");
    expect(reducer(loading, setTasks([])).tasks).toEqual([]);
  });
});
