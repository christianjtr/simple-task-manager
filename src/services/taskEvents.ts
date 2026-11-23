import type { Task, TaskOrderPayload, TaskUpdate } from "@src/types/task";

export enum WebSocketEventType {
  TASK_UPDATE = "TASK_UPDATE",
  TASK_CREATE = "TASK_CREATE",
  TASK_DELETE = "TASK_DELETE",
  TASK_REORDER = "TASK_REORDER",
}

export type WebSocketMessage =
  | { type: WebSocketEventType.TASK_UPDATE; payload: TaskUpdate }
  | { type: WebSocketEventType.TASK_CREATE; payload: Task }
  | { type: WebSocketEventType.TASK_DELETE; payload: Pick<Task, "id"> }
  | { type: WebSocketEventType.TASK_REORDER; payload: TaskOrderPayload };

export type MessageHandler = (message: WebSocketMessage) => void;

class TaskEventBus {
  private handlers = new Set<MessageHandler>();

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  publish(message: WebSocketMessage): void {
    [...this.handlers].forEach((handler) => {
      handler(message);
    });
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const taskEventBus = new TaskEventBus();
