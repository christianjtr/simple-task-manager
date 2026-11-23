import type { Task, TaskImage, TaskUpdate } from "../types/task";
import { TaskStatus } from "../types/task";
import { taskEventBus, WebSocketEventType } from "./taskEvents";

export const MOCK_TASK_COUNT = 75;

const sampleImages: TaskImage[] = [
  {
    id: "img1",
    url: "https://picsum.photos/400/300",
    alt: "Sample task image 1",
    width: 400,
    height: 300,
  },
  {
    id: "img2",
    url: "https://picsum.photos/500/400",
    alt: "Sample task image 2",
    width: 500,
    height: 400,
  },
  {
    id: "img3",
    url: "https://picsum.photos/600/400",
    alt: "Sample task image 3",
    width: 600,
    height: 400,
  },
];

const taskStore = new Map<string, Task>();

export class TransientApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransientApiError";
  }
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function performRequestWithRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  retryDelay = 1000
): Promise<T> {
  let attempt = 0;

  for (;;) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (!(error instanceof TransientApiError) || attempt >= maxAttempts) {
        throw error;
      }
      await delay(retryDelay * 2 ** (attempt - 1));
    }
  }
}

const generateMockTasks = (count: number): Task[] => {
  const statuses = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ];
  const tasks: Task[] = [];

  for (let i = 0; i < count; i += 1) {
    const status = statuses[i % statuses.length];
    const now = new Date().toISOString();
    const hasImage = i % 3 === 0;
    const sample = sampleImages[i % sampleImages.length];
    const image = hasImage && sample ? { ...sample, id: `img-${i + 1}` } : undefined;

    const task: Task = {
      id: `task-${i + 1}`,
      title: `Task ${i + 1}`,
      description: `This is a description for task ${i + 1}`,
      status,
      createdAt: now,
      updatedAt: now,
      image,
    };

    tasks.push(task);
    taskStore.set(task.id, task);
  }

  return tasks;
};

export const mockApi = {
  getTasks: (): Promise<Task[]> =>
    performRequestWithRetry(async () => {
      await delay(800);
      return Array.from(taskStore.values());
    }),

  updateTask: (taskId: string, updates: TaskUpdate): Promise<Task> =>
    performRequestWithRetry(async () => {
      await delay(300);
      const updatedTask = mockApi._updateTaskState(taskId, updates);
      taskEventBus.publish({
        type: WebSocketEventType.TASK_UPDATE,
        payload: updatedTask,
      });
      return updatedTask;
    }),

  createTask: (newTask: Task): Promise<Task> =>
    performRequestWithRetry(async () => {
      await delay(300);
      const now = new Date().toISOString();
      const task: Task = { ...newTask, createdAt: now, updatedAt: now };
      taskStore.set(task.id, task);
      taskEventBus.publish({
        type: WebSocketEventType.TASK_CREATE,
        payload: task,
      });
      return task;
    }),

  deleteTask: (taskId: string): Promise<void> =>
    performRequestWithRetry(async () => {
      await delay(300);
      const deletedTask = taskStore.get(taskId);
      if (!deletedTask) {
        throw new Error(`Task ${taskId} not found`);
      }
      taskStore.delete(taskId);
      taskEventBus.publish({
        type: WebSocketEventType.TASK_DELETE,
        payload: { id: deletedTask.id },
      });
    }),

  reorderTasks: (status: TaskStatus, ids: string[]): Promise<Task[]> =>
    performRequestWithRetry(async () => {
      await delay(150);
      const ordered = mockApi._reorderTasks(status, ids);
      taskEventBus.publish({
        type: WebSocketEventType.TASK_REORDER,
        payload: { status, ids },
      });
      return ordered;
    }),

  _updateTaskState: (taskId: string, updates: TaskUpdate): Task => {
    const existingTask = taskStore.get(taskId);
    if (!existingTask) {
      throw new Error(`Task ${taskId} not found`);
    }

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    taskStore.set(taskId, updatedTask);
    return updatedTask;
  },

  _reorderTasks: (status: TaskStatus, ids: string[]): Task[] => {
    const reordered = ids
      .map((id) => taskStore.get(id))
      .filter((task): task is Task => Boolean(task && task.status === status));
    const untouched = Array.from(taskStore.values()).filter(
      (task) => !ids.includes(task.id)
    );
    const nextTasks = [...untouched, ...reordered];
    taskStore.clear();
    nextTasks.forEach((task) => taskStore.set(task.id, task));
    return reordered;
  },

  reset: (): void => {
    taskStore.clear();
    generateMockTasks(MOCK_TASK_COUNT);
  },
};

generateMockTasks(MOCK_TASK_COUNT);
