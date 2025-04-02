import { mockWebSocket, WebSocketEventType } from "../mockWebSocket";
import { mockApi } from "../mockApi";
import { TaskStatus } from "../../types/task";

describe("mockWebSocket", () => {
  let consoleWarnSpy: jest.SpyInstance;
  let testTask: Awaited<ReturnType<typeof mockApi.getTasks>>[0];

  beforeAll(async () => {
    const tasks = await mockApi.getTasks();
    testTask = tasks[0];
  });

  beforeEach(() => {
    jest.useFakeTimers();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    mockWebSocket.disconnect();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    jest.useRealTimers();
  });

  describe("connection handling", () => {
    it("should connect successfully", async () => {
      const connectPromise = mockWebSocket.connect();
      jest.advanceTimersByTime(500);
      await connectPromise;

      // Send a test message to verify connection
      const handler = jest.fn();
      mockWebSocket.subscribe(handler);

      mockWebSocket.send({
        type: WebSocketEventType.TASK_UPDATE,
        payload: { ...testTask, title: "Updated Title" },
      });

      jest.advanceTimersByTime(100);
      expect(handler).toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should not deliver messages when disconnected", async () => {
      // First connect
      const connectPromise = mockWebSocket.connect();
      jest.advanceTimersByTime(500);
      await connectPromise;

      const handler = jest.fn();
      mockWebSocket.subscribe(handler);

      // Then disconnect
      mockWebSocket.disconnect();

      // Try to send a message
      mockWebSocket.send({
        type: WebSocketEventType.TASK_UPDATE,
        payload: { ...testTask, title: "Updated Title" },
      });

      jest.advanceTimersByTime(100);
      expect(handler).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith("WebSocket is not connected");
    });
  });

  describe("message handling", () => {
    beforeEach(async () => {
      const connectPromise = mockWebSocket.connect();
      jest.advanceTimersByTime(500);
      await connectPromise;
    });

    it("should deliver messages to all subscribers", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      mockWebSocket.subscribe(handler1);
      mockWebSocket.subscribe(handler2);

      const message = {
        type: WebSocketEventType.TASK_UPDATE,
        payload: { ...testTask, title: "Updated Title" },
      };

      mockWebSocket.send(message);
      jest.advanceTimersByTime(100);

      expect(handler1).toHaveBeenCalledWith(message);
      expect(handler2).toHaveBeenCalledWith(message);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should allow unsubscribing", () => {
      const handler = jest.fn();
      const unsubscribe = mockWebSocket.subscribe(handler);

      // Send first message
      mockWebSocket.send({
        type: WebSocketEventType.TASK_UPDATE,
        payload: { ...testTask, title: "Updated Title" },
      });
      jest.advanceTimersByTime(100);
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      // Send second message
      mockWebSocket.send({
        type: WebSocketEventType.TASK_UPDATE,
        payload: { ...testTask, title: "Another Update" },
      });
      jest.advanceTimersByTime(100);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should update task state when receiving task updates", async () => {
      // Temporarily restore real timers for the API call
      jest.useRealTimers();

      const updates = {
        title: "Updated via WebSocket",
        status: TaskStatus.IN_PROGRESS,
      };

      // Use fake timers for WebSocket operations
      jest.useFakeTimers();
      mockWebSocket.send({
        type: WebSocketEventType.TASK_UPDATE,
        payload: { ...testTask, ...updates },
      });

      jest.advanceTimersByTime(100);

      // Restore real timers for API verification
      jest.useRealTimers();

      // Verify the update was applied to the store
      const updatedTasks = await mockApi.getTasks();
      const updatedTask = updatedTasks.find((t) => t.id === testTask.id);

      expect(updatedTask).toEqual(
        expect.objectContaining({
          ...testTask,
          ...updates,
          updatedAt: expect.any(String),
        })
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    }, 10000);

    it("should handle non-existent task updates gracefully", () => {
      const handler = jest.fn();
      mockWebSocket.subscribe(handler);

      const message = {
        type: WebSocketEventType.TASK_UPDATE,
        payload: { id: "non-existent", title: "test" },
      };

      mockWebSocket.send(message);
      jest.advanceTimersByTime(100);

      // The message should still be delivered to handlers
      expect(handler).toHaveBeenCalledWith(message);
      // No warning should be logged
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe("simulation", () => {
    beforeEach(async () => {
      const connectPromise = mockWebSocket.connect();
      jest.advanceTimersByTime(500);
      await connectPromise;
    });

    it("should start simulating updates after connection", async () => {
      const handler = jest.fn();
      mockWebSocket.subscribe(handler);

      // Mock getTasks to return synchronously to work with fake timers
      const mockGetTasks = jest
        .spyOn(mockApi, "getTasks")
        .mockImplementation(async () => {
          return [testTask];
        });

      // Advance past the maximum initial delay (15 seconds)
      jest.advanceTimersByTime(15000);
      // Run any pending promises
      await Promise.resolve();

      // If no update yet, advance through potential interval
      if (!handler.mock.calls.length) {
        jest.advanceTimersByTime(15000);
        // Run any pending promises again
        await Promise.resolve();
      }

      expect(handler).toHaveBeenCalled();
      const call = handler.mock.calls[0][0];
      expect(call.type).toBe(WebSocketEventType.TASK_UPDATE);
      expect(call.payload).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.stringContaining("(edited by another user)"),
          updatedAt: expect.any(String),
        })
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      mockGetTasks.mockRestore();
    });

    it("should stop simulating updates after disconnection", async () => {
      const handler = jest.fn();
      mockWebSocket.subscribe(handler);

      // Mock getTasks to return synchronously
      const mockGetTasks = jest
        .spyOn(mockApi, "getTasks")
        .mockImplementation(async () => {
          return [testTask];
        });

      // Advance past the maximum initial delay
      jest.advanceTimersByTime(15000);
      // Run any pending promises
      await Promise.resolve();

      // If no update yet, advance through potential interval
      if (!handler.mock.calls.length) {
        jest.advanceTimersByTime(15000);
        // Run any pending promises again
        await Promise.resolve();
      }

      expect(handler).toHaveBeenCalled();
      const callCount = handler.mock.calls.length;

      // Disconnect
      mockWebSocket.disconnect();

      // Try to trigger more updates
      jest.advanceTimersByTime(30000);
      await Promise.resolve();

      // Should not have received any more updates
      expect(handler.mock.calls.length).toBe(callCount);

      // Cleanup
      mockGetTasks.mockRestore();
    });
  });

  describe("error handling", () => {
    beforeEach(async () => {
      const connectPromise = mockWebSocket.connect();
      jest.advanceTimersByTime(500);
      await connectPromise;
    });

    it("should warn when sending message while disconnected", () => {
      mockWebSocket.disconnect();

      mockWebSocket.send({
        type: WebSocketEventType.TASK_UPDATE,
        payload: { ...testTask, title: "Updated Title" },
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith("WebSocket is not connected");
    });

    it("should handle non-existent task updates", () => {
      mockWebSocket.send({
        type: WebSocketEventType.TASK_UPDATE,
        payload: { id: "non-existent", title: "test" },
      });

      jest.advanceTimersByTime(100);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
