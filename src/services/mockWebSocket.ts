import { Task, TaskUpdate } from "../types/task";
import { mockApi } from "./mockApi";

export enum WebSocketEventType {
  TASK_UPDATE = "TASK_UPDATE",
  TASK_CREATE = "TASK_CREATE",
  TASK_DELETE = "TASK_DELETE",
}

interface WebSocketMessage {
  type: WebSocketEventType;
  payload: Task | TaskUpdate;
}

type MessageHandler = (message: WebSocketMessage) => void;

class MockWebSocket {
  private handlers: MessageHandler[] = [];
  private isConnected: boolean = false;
  private simulationInterval: NodeJS.Timeout | null = null;

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.startSimulation();
        resolve();
      }, 500);
    });
  }

  disconnect(): void {
    this.isConnected = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  simulateIncomingMessage(message: WebSocketMessage): void {
    if (!this.isConnected) return;

    // If it's a task update, try to update the internal state
    if (
      message.type === WebSocketEventType.TASK_UPDATE &&
      "id" in message.payload
    ) {
      try {
        mockApi._updateTaskState(message.payload.id, message.payload);
      } catch {
        // Silently ignore updates for non-existent tasks
        // This simulates the behavior of a real system where some tasks
        // might have been deleted by other users
        console.debug(
          "Ignoring update for non-existent task:",
          message.payload.id
        );
      }
    }

    this.handlers.forEach((handler) => {
      handler(message);
    });
  }

  send(message: WebSocketMessage): void {
    if (!this.isConnected) {
      console.warn("WebSocket is not connected");
      return;
    }

    setTimeout(() => {
      this.simulateIncomingMessage(message);
    }, 100);
  }

  private startSimulation(): void {
    // Schedule first update with random delay
    const initialDelay = Math.random() * 10_000 + 5_000;
    const intervalDelay = Math.random() * 10_000 + 5_000;

    const firstUpdate = setTimeout(async () => {
      await this.simulateRandomUpdate();

      // Then start regular interval updates if still connected
      if (this.isConnected) {
        this.simulationInterval = setInterval(async () => {
          await this.simulateRandomUpdate();
        }, intervalDelay);
      }
    }, initialDelay);

    // Clean up first update timeout if disconnected
    if (!this.isConnected && firstUpdate) {
      clearTimeout(firstUpdate);
    }
  }

  private async simulateRandomUpdate(): Promise<void> {
    if (!this.isConnected) return;

    try {
      const allTasks = await mockApi.getTasks();

      // Randomly select a task to update
      const randomTask = allTasks[Math.floor(Math.random() * allTasks.length)];
      if (!randomTask) return;

      // Simulate a random update
      const updates: Partial<Task> = {
        title: `${randomTask.title} (edited by another user)`,
        updatedAt: new Date().toISOString(),
      };

      // Send the simulated update
      this.simulateIncomingMessage({
        type: WebSocketEventType.TASK_UPDATE,
        payload: { ...randomTask, ...updates },
      });
    } catch (error) {
      console.error("Failed to simulate random update:", error);
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached.");
      return;
    }

    console.log(`Attempting reconnection in ${this.reconnectDelay}ms...`);
    setTimeout(() => {
      this.connect().then(() => {
        console.log("Reconnected.");
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startSimulation();
      }).catch(() => {
        this.reconnectAttempts++;
        this.reconnectDelay *= 2;
        this.reconnect();
      });
    }, this.reconnectDelay);
  }
}

export const mockWebSocket = new MockWebSocket();
