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
