import type { Task } from "../task.types";
import { TaskStatus } from "../task.types";
import { filterTasks, formatDueDate, nextPosition, sortTasks, toIsoString } from "../task.utils";

const makeTask = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  projectId: "project_1",
  title: `Tarea ${id}`,
  description: "Descripción",
  status: TaskStatus.TODO,
  position: Number(id),
  priority: "medium",
  tags: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

describe("task utilities", () => {
  it("sorts by position and computes the next slot", () => {
    const tasks = [makeTask("2"), makeTask("1")];

    expect(sortTasks(tasks).map((task) => task.id)).toEqual(["1", "2"]);
    expect(nextPosition(tasks, TaskStatus.TODO)).toBe(3);
    expect(nextPosition(tasks, TaskStatus.DONE)).toBe(0);
  });

  it("filters by text, status, priority and tag", () => {
    const tasks = [
      makeTask("1", { title: "Comprar leche", tags: ["casa"] }),
      makeTask("2", {
        title: "Escribir informe",
        status: TaskStatus.DONE,
        priority: "high",
        tags: ["trabajo"],
      }),
    ];

    expect(filterTasks(tasks, { search: "leche" }).map((task) => task.id)).toEqual(["1"]);
    expect(filterTasks(tasks, { status: TaskStatus.DONE }).map((task) => task.id)).toEqual(["2"]);
    expect(filterTasks(tasks, { priority: "high", tag: "trabajo" })).toHaveLength(1);
    expect(filterTasks(tasks, { tag: "sin coincidencias" })).toEqual([]);
  });

  it("formats dates with Luxon", () => {
    const date = new Date("2026-01-01T00:00:00.000Z");

    expect(formatDueDate()).toBe("");
    expect(formatDueDate(date)).toContain("2026");
    expect(toIsoString(date)).toBe("2026-01-01T00:00:00.000Z");
  });
});
