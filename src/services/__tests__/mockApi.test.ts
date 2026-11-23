import { TaskStatus } from "../../types/task";
import { MOCK_TASK_COUNT, mockApi } from "../mockApi";

describe("mockApi", () => {
  beforeEach(() => mockApi.reset());

  it("loads a pre-populated list within the required range", async () => {
    const tasks = await mockApi.getTasks();
    expect(tasks).toHaveLength(MOCK_TASK_COUNT);
    expect(tasks.length).toBeGreaterThanOrEqual(50);
    expect(tasks.length).toBeLessThanOrEqual(100);
    expect(tasks[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        status: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
    expect(Object.values(TaskStatus)).toContain(tasks[0].status);
  });

  it("returns a stable snapshot between calls", async () => {
    expect(await mockApi.getTasks()).toEqual(await mockApi.getTasks());
  });

  it("updates only the requested fields", async () => {
    const [target] = await mockApi.getTasks();
    const updated = await mockApi.updateTask(target.id, {
      id: target.id,
      title: "New title",
    });

    expect(updated).toMatchObject({
      id: target.id,
      title: "New title",
      description: target.description,
      status: target.status,
    });
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(target.updatedAt).getTime(),
    );
  });

  it("fails immediately for a permanently missing task", async () => {
    await expect(mockApi.updateTask("missing", { id: "missing", title: "x" })).rejects.toThrow(
      "Task missing not found",
    );
    await expect(mockApi.deleteTask("missing")).rejects.toThrow("Task missing not found");
  });

  it("reorders a column and reports the new order", async () => {
    const tasks = await mockApi.getTasks();
    const ids = tasks
      .filter((task) => task.status === TaskStatus.TODO)
      .map((task) => task.id)
      .reverse();

    const reordered = await mockApi.reorderTasks(TaskStatus.TODO, ids);
    expect(reordered.map((task) => task.id)).toEqual(ids);

    const after = await mockApi.getTasks();
    expect(after.filter((task) => task.status === TaskStatus.TODO).map((t) => t.id)).toEqual(ids);
  });

  it("creates and deletes a task", async () => {
    const newTask = {
      id: "custom-task",
      title: "Custom",
      description: "Custom description",
      status: TaskStatus.TODO,
      createdAt: "",
      updatedAt: "",
    };
    const created = await mockApi.createTask(newTask);
    expect(created.createdAt).not.toBe("");
    expect((await mockApi.getTasks()).some((t) => t.id === created.id)).toBe(true);

    await mockApi.deleteTask(created.id);
    expect((await mockApi.getTasks()).some((t) => t.id === created.id)).toBe(false);
  });
});
