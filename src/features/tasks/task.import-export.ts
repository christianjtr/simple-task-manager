import type { z } from "zod";

import { backupSchema, projectJsonSchema, taskJsonSchema } from "./task.schema";
import type { ImportCounts, Project, Task } from "./task.types";
import { toIsoString } from "./task.utils";

type ProjectJson = z.infer<typeof projectJsonSchema>;
type TaskJson = z.infer<typeof taskJsonSchema>;

export interface Backup {
  version: 1;
  exportedAt: string;
  projects: ProjectJson[];
  tasks: TaskJson[];
}

export interface ImportResult extends ImportCounts {
  projects: Project[];
  tasks: Task[];
}

export function exportBackup(projects: Project[], tasks: Task[]): Backup {
  return {
    version: 1,
    exportedAt: toIsoString(new Date()),
    projects: projects.map((project) =>
      projectJsonSchema.parse({
        ...project,
        createdAt: toIsoString(project.createdAt),
        updatedAt: toIsoString(project.updatedAt),
      }),
    ),
    tasks: tasks.map((task) =>
      taskJsonSchema.parse({
        ...task,
        dueDate: task.dueDate ? toIsoString(task.dueDate) : undefined,
        createdAt: toIsoString(task.createdAt),
        updatedAt: toIsoString(task.updatedAt),
      }),
    ),
  };
}

export function importBackup(value: unknown): ImportResult {
  const parsed = backupSchema.safeParse(value);
  if (!parsed.success) throw new Error("Invalid backup file");

  const projects: Project[] = [];
  const projectIds = new Set<string>();
  let skippedProjects = 0;

  for (const project of parsed.data.projects) {
    if (projectIds.has(project.id)) {
      skippedProjects += 1;
      continue;
    }
    projectIds.add(project.id);
    projects.push(project);
  }

  const tasks: Task[] = [];
  const taskIds = new Set<string>();
  let skippedTasks = 0;

  for (const task of parsed.data.tasks) {
    if (taskIds.has(task.id) || !projectIds.has(task.projectId)) {
      skippedTasks += 1;
      continue;
    }
    taskIds.add(task.id);
    tasks.push(task);
  }

  return {
    projects,
    tasks,
    importedProjects: projects.length,
    importedTasks: tasks.length,
    skippedProjects,
    skippedTasks,
  };
}
