import type {
  ConnectionStatus,
  TaskOrderPayload,
  TaskUpdate,
} from "@src/types/task";
import { mockApi } from "./mockApi";
import {
  taskEventBus,
  WebSocketEventType,
  type MessageHandler,
  type WebSocketMessage,
} from "./taskEvents";

export { WebSocketEventType };
export type { MessageHandler, WebSocketMessage };

type Timer = ReturnType<typeof setTimeout>;

class MockWebSocket {
  private status: ConnectionStatus = "disconnected";
  private statusHandlers = new Set<(status: ConnectionStatus) => void>();
  private connectPromise: Promise<void> | null = null;
  private cancelConnect: (() => void) | null = null;
  private connectTimer: Timer | null = null;
  private firstUpdateTimer: Timer | null = null;
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: Timer | null = null;
  private pendingSends = new Set<Timer>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;

  getStatus = (): ConnectionStatus => this.status;

  subscribe = (handler: MessageHandler): (() => void) =>
    taskEventBus.subscribe(handler);

  subscribeStatus = (handler: (status: ConnectionStatus) => void): (() => void) => {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  };

  connect(): Promise<void> {
    if (this.connectPromise) return this.connectPromise;
    if (this.status === "connected") return Promise.resolve();

    this.setStatus(
      this.reconnectAttempts > 0 ? "reconnecting" : "connecting"
    );

    this.connectPromise = new Promise<void>((resolve) => {
      let canceled = false;
      this.cancelConnect = () => {
        canceled = true;
      };
      this.connectTimer = setTimeout(() => {
        this.connectTimer = null;
        this.cancelConnect = null;
        this.connectPromise = null;
        if (canceled) {
          resolve();
          return;
        }
        this.reconnectAttempts = 0;
        this.setStatus("connected");
        this.startSimulation();
        resolve();
      }, 500);
    });

    return this.connectPromise;
  }

  disconnect(): void {
    this.cancelConnect?.();
    this.cancelConnect = null;
    this.connectPromise = null;
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.connectTimer = null;
    if (this.firstUpdateTimer) clearTimeout(this.firstUpdateTimer);
    this.firstUpdateTimer = null;
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.simulationInterval = null;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.pendingSends.forEach((timer) => clearTimeout(timer));
    this.pendingSends.clear();
    this.setStatus("disconnected");
  }

  simulateDisconnect(): void {
    this.disconnect();
    this.reconnect();
  }

  reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts += 1;
    this.setStatus("reconnecting");
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  send(message: WebSocketMessage): void {
    if (this.status !== "connected") {
      console.warn("WebSocket is not connected");
      return;
    }

    const timer = setTimeout(() => {
      this.pendingSends.delete(timer);
      this.simulateIncomingMessage(message);
    }, 100);
    this.pendingSends.add(timer);
  }

  simulateIncomingMessage(message: WebSocketMessage): void {
    if (this.status !== "connected") return;

    if (message.type === WebSocketEventType.TASK_UPDATE) {
      const payload: TaskUpdate = message.payload;
      try {
        mockApi._updateTaskState(payload.id, payload);
      } catch {
        console.debug(`Ignoring update for non-existent task: ${payload.id}`);
      }
    }

    if (message.type === WebSocketEventType.TASK_REORDER) {
      const payload: TaskOrderPayload = message.payload;
      mockApi._reorderTasks(payload.status, payload.ids);
    }

    taskEventBus.publish(message);
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }

  private startSimulation(): void {
    if (this.firstUpdateTimer || this.simulationInterval) return;

    const initialDelay = Math.random() * 10_000 + 5_000;
    const intervalDelay = Math.random() * 10_000 + 5_000;

    this.firstUpdateTimer = setTimeout(() => {
      this.firstUpdateTimer = null;
      void this.simulateRandomUpdate();
      if (this.status === "connected" && !this.simulationInterval) {
        this.simulationInterval = setInterval(() => {
          void this.simulateRandomUpdate();
        }, intervalDelay);
      }
    }, initialDelay);
  }

  private async simulateRandomUpdate(): Promise<void> {
    if (this.status !== "connected") return;

    try {
      const allTasks = await mockApi.getTasks();
      const randomTask = allTasks[Math.floor(Math.random() * allTasks.length)];
      if (!randomTask) return;

      this.simulateIncomingMessage({
        type: WebSocketEventType.TASK_UPDATE,
        payload: {
          id: randomTask.id,
          title: `${randomTask.title} (edited by another user)`,
        },
      });
    } catch (error) {
      console.error("Failed to simulate random update:", error);
    }
  }
}

export const mockWebSocket = new MockWebSocket();
