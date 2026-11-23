import { TaskStatus } from "@src/types/task";

export const STAGE_ORDER: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
];

export const DEFAULT_STAGES: {
  id: TaskStatus;
  title: string;
  status: TaskStatus;
}[] = [
  { id: TaskStatus.TODO, title: "To Do", status: TaskStatus.TODO },
  {
    id: TaskStatus.IN_PROGRESS,
    title: "In Progress",
    status: TaskStatus.IN_PROGRESS,
  },
  { id: TaskStatus.DONE, title: "Done", status: TaskStatus.DONE },
];
