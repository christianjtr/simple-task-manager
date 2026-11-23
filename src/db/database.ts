import type { Project, Task } from "@src/features/tasks/task.types";
import Dexie, { type EntityTable } from "dexie";

class TaskDatabase extends Dexie {
  projects!: EntityTable<Project, "id">;
  tasks!: EntityTable<Task, "id">;

  constructor() {
    super("simple-task-manager");

    this.version(1).stores({
      projects: "id, name, createdAt, updatedAt",
      tasks:
        "id, projectId, status, position, priority, *tags, dueDate, createdAt, updatedAt, [projectId+status], [projectId+position]",
    });
  }
}

export const db = new TaskDatabase();
export { TaskDatabase };
