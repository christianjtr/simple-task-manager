import { exportBackup, importBackup } from "../task.import-export";
import { backupSchema, projectFileSchema, taskFileSchema } from "../task.schema";
import type { Project, Task } from "../task.types";
import { TaskStatus } from "../task.types";

const project: Project = {
  id: "project_1",
  name: "Proyecto",
  color: "#6366f1",
  description: "Descripción",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
};

const task: Task = {
  id: "task_1",
  projectId: project.id,
  title: "Tarea",
  description: "Detalle",
  status: TaskStatus.TODO,
  position: 0,
  priority: "medium",
  tags: ["demo"],
  dueDate: new Date("2026-01-10T00:00:00.000Z"),
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
};

describe("task schemas and backup", () => {
  it("parses ISO dates into Date objects", () => {
    const parsedProject = projectFileSchema.parse({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
    const parsedTask = taskFileSchema.parse({
      ...task,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    });

    expect(parsedProject.createdAt).toEqual(project.createdAt);
    expect(parsedTask.dueDate).toEqual(task.dueDate);
  });

  it("rejects invalid colors and statuses", () => {
    expect(() => projectFileSchema.parse({ ...project, color: "red" })).toThrow();
    expect(() =>
      taskFileSchema.parse({
        ...task,
        status: "UNKNOWN",
        dueDate: undefined,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }),
    ).toThrow();
  });

  it("round-trips a versioned backup", () => {
    const backup = exportBackup([project], [task]);
    const parsed = JSON.parse(JSON.stringify(backup));

    expect(backup.version).toBe(1);
    expect(backup.projects[0].createdAt).toBe(project.createdAt.toISOString());
    expect(backupSchema.safeParse(parsed).success).toBe(true);

    const result = importBackup(parsed);
    expect(result.importedProjects).toBe(1);
    expect(result.importedTasks).toBe(1);
    expect(result.projects[0].createdAt).toEqual(project.createdAt);
    expect(result.tasks[0].dueDate).toEqual(task.dueDate);
  });

  it("skips duplicate ids and orphan tasks", () => {
    const backup = exportBackup([project, project], [task, task]);
    const orphan = exportBackup([], [{ ...task, id: "task_orphan", projectId: "missing" }]);
    const value = {
      ...backup,
      tasks: [...backup.tasks, ...orphan.tasks],
    };

    const result = importBackup(value);

    expect(result.skippedProjects).toBe(1);
    expect(result.skippedTasks).toBe(2);
    expect(result.tasks.map((item) => item.id)).toEqual([task.id]);
  });
});
