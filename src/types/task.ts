export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface TaskImage {
  id: string;
  url: string;
  alt?: string;
  width: number;
  height: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  image?: TaskImage;
}

export type TaskUpdate = Pick<Task, "id"> & Partial<Omit<Task, "id">>;

export interface TaskOrderPayload {
  status: TaskStatus;
  ids: Task["id"][];
}

export interface TaskMove {
  taskId: Task["id"];
  status: TaskStatus;
  index: number;
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Task>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    Object.values(TaskStatus).includes(candidate.status as TaskStatus) &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

export function isTaskUpdate(value: unknown): value is TaskUpdate {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<TaskUpdate>;
  return (
    typeof candidate.id === "string" &&
    (candidate.status === undefined ||
      Object.values(TaskStatus).includes(candidate.status)) &&
    (candidate.title === undefined || typeof candidate.title === "string") &&
    (candidate.description === undefined ||
      typeof candidate.description === "string")
  );
}

export function isTaskOrderPayload(value: unknown): value is TaskOrderPayload {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<TaskOrderPayload>;
  return (
    Object.values(TaskStatus).includes(candidate.status as TaskStatus) &&
    Array.isArray(candidate.ids) &&
    candidate.ids.every((id) => typeof id === "string")
  );
}
