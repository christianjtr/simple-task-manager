import { Task, TaskStatus, TaskImage } from "../types/task";
import { mockWebSocket, WebSocketEventType } from "./mockWebSocket";

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

// Shared state to maintain consistency between API and WebSocket
const taskStore = new Map<string, Task>();

const generateMockTasks = (count: number): Task[] => {
  const statuses: TaskStatus[] = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ];
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const now = new Date().toISOString();

    // Randomly decide if this task should have an image (30% chance)
    const hasImage = Math.random() < 0.3;
    const image = hasImage
      ? {
        ...sampleImages[Math.floor(Math.random() * sampleImages.length)],
        id: `img-${i + 1}`,
      }
      : undefined;

    const task = {
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function performRequestWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, retryDelay = 1000): Promise<T> {
  let retries = 0;
  let lastError: unknown;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Request failed, retrying in ${retryDelay}ms...`, error);
      retries++;
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      retryDelay *= 2;
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

export const mockApi = {
  getTasks: async (): Promise<Task[]> => {
    return performRequestWithRetry(async () => {
      await delay(800);
      return Array.from(taskStore.values());
    });
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    return performRequestWithRetry(async () => {
      await delay(300);

      const existingTask = taskStore.get(taskId);
      if (!existingTask) {
        throw new Error(`Task ${taskId} not found`);
      }

      const updatedTask = {
        ...existingTask,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      taskStore.set(taskId, updatedTask);

      mockWebSocket.send({
        type: WebSocketEventType.TASK_UPDATE,
        payload: updatedTask,
      });

      return updatedTask;
    });
  },

  createTask: async (newTask: Task): Promise<Task> => {
    return performRequestWithRetry(async () => {
      await delay(300);

      const task = {
        ...newTask,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      taskStore.set(task.id, task);

      mockWebSocket.send({
        type: WebSocketEventType.TASK_CREATE,
        payload: task,
      });

      return task;
    });
  },

  deleteTask: async (taskId: string): Promise<void> => {
    return performRequestWithRetry(async () => {
      await delay(300);

      if (!taskStore.has(taskId)) {
        throw new Error(`Task ${taskId} not found`);
      }

      const deletedTask = taskStore.get(taskId);
      taskStore.delete(taskId);

      taskStore.delete(taskId);

      mockWebSocket.send({
        type: WebSocketEventType.TASK_DELETE,
        payload: deletedTask!,
      });
    });
  },

  // Internal method to update task state without delay
  _updateTaskState: (taskId: string, updates: Partial<Task>): Task => {
    const existingTask = taskStore.get(taskId);
    if (!existingTask) {
      throw new Error(`Task ${taskId} not found`);
    }

    const updatedTask = {
      ...existingTask,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    taskStore.set(taskId, updatedTask);
    return updatedTask;
  },
};

// Initialize the store
generateMockTasks(75);
