import { db } from "@src/db/database";

import { projectSchema, taskSchema } from "./task.schema";
import { type Project, type Task, TaskStatus } from "./task.types";
import { createId, nextPosition, sortTasks } from "./task.utils";

export const DEFAULT_PROJECT_COLOR = "#6366f1";

export type ProjectInput = Pick<Project, "name"> & Partial<Pick<Project, "color" | "description">>;

export type TaskInput = Pick<Task, "projectId" | "title"> &
  Partial<Pick<Task, "description" | "status" | "priority" | "position" | "tags" | "dueDate">>;

export type TaskPatch = Partial<Omit<Task, "id" | "createdAt">>;

export async function listProjects(): Promise<Project[]> {
  return db.projects.orderBy("name").toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const now = new Date();
  const project = projectSchema.parse({
    id: createId("project"),
    name: input.name,
    color: input.color ?? DEFAULT_PROJECT_COLOR,
    description: input.description ?? "",
    createdAt: now,
    updatedAt: now,
  });

  await db.projects.add(project);
  return project;
}

export async function updateProject(id: string, patch: Partial<ProjectInput>): Promise<Project> {
  const current = await db.projects.get(id);
  if (!current) throw new Error(`Project ${id} not found`);

  const project = projectSchema.parse({
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date(),
  });

  await db.projects.put(project);
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  await db.transaction("rw", db.projects, db.tasks, async () => {
    await db.tasks.where("projectId").equals(id).delete();
    await db.projects.delete(id);
  });
}

export async function listTasks(projectId?: string): Promise<Task[]> {
  const tasks = projectId
    ? await db.tasks.where("projectId").equals(projectId).toArray()
    : await db.tasks.toArray();
  return sortTasks(tasks);
}

export async function getTask(id: string): Promise<Task | undefined> {
  return db.tasks.get(id);
}

export async function createTask(input: TaskInput): Promise<Task> {
  if (!(await db.projects.get(input.projectId))) {
    throw new Error(`Project ${input.projectId} not found`);
  }

  const status = input.status ?? TaskStatus.TODO;
  const column = await db.tasks
    .where("[projectId+status]")
    .equals([input.projectId, status])
    .toArray();
  const now = new Date();
  const task = taskSchema.parse({
    id: createId("task"),
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? "",
    status,
    position: input.position ?? nextPosition(column, status),
    priority: input.priority ?? "medium",
    tags: input.tags ?? [],
    dueDate: input.dueDate,
    createdAt: now,
    updatedAt: now,
  });

  await db.tasks.add(task);
  return task;
}

export async function updateTask(id: string, patch: TaskPatch): Promise<Task> {
  const current = await db.tasks.get(id);
  if (!current) throw new Error(`Task ${id} not found`);

  const projectId = patch.projectId ?? current.projectId;
  if (!(await db.projects.get(projectId))) {
    throw new Error(`Project ${projectId} not found`);
  }

  const task = taskSchema.parse({
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date(),
  });

  await db.tasks.put(task);
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

export async function moveTask(id: string, status: TaskStatus, index: number): Promise<Task> {
  await db.transaction("rw", db.tasks, async () => {
    const task = await db.tasks.get(id);
    if (!task) throw new Error(`Task ${id} not found`);

    const column = sortTasks(
      (
        await db.tasks.where("[projectId+status]").equals([task.projectId, status]).toArray()
      ).filter((item) => item.id !== id),
    );
    const target = Math.max(0, Math.min(index, column.length));
    column.splice(target, 0, { ...task, status });

    await Promise.all(
      column.map((item, position) =>
        db.tasks.update(item.id, {
          status,
          position,
          updatedAt: item.id === id ? new Date() : item.updatedAt,
        }),
      ),
    );
  });

  const moved = await db.tasks.get(id);
  if (!moved) throw new Error(`Task ${id} not found`);
  return moved;
}

export async function reorderTasks(
  projectId: string,
  status: TaskStatus,
  ids: string[],
): Promise<Task[]> {
  await db.transaction("rw", db.tasks, async () => {
    const column = sortTasks(
      await db.tasks.where("[projectId+status]").equals([projectId, status]).toArray(),
    );
    const byId = new Map(column.map((task) => [task.id, task]));
    const ordered = ids.map((id) => byId.get(id)).filter((task): task is Task => Boolean(task));
    const remaining = column.filter((task) => !ids.includes(task.id));
    const next = [...ordered, ...remaining];

    await Promise.all(
      next.map((task, position) =>
        db.tasks.update(task.id, { position, updatedAt: task.updatedAt }),
      ),
    );
  });

  return sortTasks(
    await db.tasks.where("[projectId+status]").equals([projectId, status]).toArray(),
  );
}
