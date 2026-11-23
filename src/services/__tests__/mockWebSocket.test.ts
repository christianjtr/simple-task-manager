import { waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { mockApi } from "../mockApi";
import { mockWebSocket, WebSocketEventType } from "../mockWebSocket";
import type { WebSocketMessage } from "../taskEvents";

const updateMessage: WebSocketMessage = {
  type: WebSocketEventType.TASK_UPDATE,
  payload: { id: "task-1", title: "Updated" },
};

describe("mockWebSocket", () => {
  beforeEach(() => mockApi.reset());

  afterEach(() => mockWebSocket.disconnect());

  it("exposes connection status transitions", async () => {
    const statuses: string[] = [];
    const unsubscribe = mockWebSocket.subscribeStatus((status) => statuses.push(status));

    await mockWebSocket.connect();
    expect(mockWebSocket.getStatus()).toBe("connected");
    expect(statuses).toContain("connecting");
    expect(statuses).toContain("connected");

    mockWebSocket.disconnect();
    expect(mockWebSocket.getStatus()).toBe("disconnected");
    unsubscribe();
  });

  it("is idempotent under repeated connects", async () => {
    const first = mockWebSocket.connect();
    const second = mockWebSocket.connect();
    expect(first).toBe(second);
    await first;
    expect(mockWebSocket.getStatus()).toBe("connected");
  });

  it("delivers messages to subscribers and removes them on unsubscribe", async () => {
    const handler = vi.fn();
    const unsubscribe = mockWebSocket.subscribe(handler);
    await mockWebSocket.connect();

    mockWebSocket.send(updateMessage);
    await waitFor(() => expect(handler).toHaveBeenCalledWith(updateMessage));

    unsubscribe();
    mockWebSocket.send(updateMessage);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores sends while disconnected", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockWebSocket.send(updateMessage);
    expect(warn).toHaveBeenCalledWith("WebSocket is not connected");
    warn.mockRestore();
  });

  it("reconnects after a simulated disconnection", async () => {
    await mockWebSocket.connect();
    mockWebSocket.simulateDisconnect();
    expect(mockWebSocket.getStatus()).toBe("reconnecting");

    await waitFor(() => expect(mockWebSocket.getStatus()).toBe("connected"), {
      timeout: 2500,
    });
  });
});
