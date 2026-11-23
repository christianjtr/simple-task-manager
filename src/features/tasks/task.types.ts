import { TaskStatus } from "@src/types/task";

export { TaskStatus };

export type TaskPriority = "low" | "medium" | "high";

export interface Project {
  id: string;
  name: string;
  color: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  priority: TaskPriority;
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
}

export interface ImportCounts {
  importedProjects: number;
  importedTasks: number;
  skippedProjects: number;
  skippedTasks: number;
}
