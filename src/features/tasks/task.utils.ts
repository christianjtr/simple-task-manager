import type { TaskStatus } from "@src/types/task";
import { DateTime } from "luxon";
import type { Task, TaskFilters } from "./task.types";

export function createId(prefix: string): string {
  const uuid =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${uuid}`;
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    if (left.createdAt.getTime() !== right.createdAt.getTime()) {
      return left.createdAt.getTime() - right.createdAt.getTime();
    }
    return left.id.localeCompare(right.id);
  });
}

export function nextPosition(tasks: Task[], status: TaskStatus): number {
  return (
    tasks.reduce((max, task) => (task.status === status ? Math.max(max, task.position) : max), -1) +
    1
  );
}

export function formatDueDate(date?: Date): string {
  if (!date) return "";
  return DateTime.fromJSDate(date, { zone: "utc" }).toLocaleString(DateTime.DATE_MED);
}

export function toIsoString(date: Date): string {
  return DateTime.fromJSDate(date, { zone: "utc" }).toISO() ?? date.toISOString();
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const search = filters.search?.trim().toLowerCase();
  const tag = filters.tag?.trim().toLowerCase();

  return sortTasks(
    tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (tag && !task.tags.some((item) => item.toLowerCase() === tag)) return false;
      if (!search) return true;

      return [task.title, task.description, ...task.tags].some((value) =>
        value.toLowerCase().includes(search),
      );
    }),
  );
}
