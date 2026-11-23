import { mockApi } from "@src/services/mockApi";
import {
  mockWebSocket,
  WebSocketEventType,
  type WebSocketMessage,
} from "@src/services/mockWebSocket";
import type { ConnectionStatus, Task, TaskStatus } from "@src/types/task";
import { isTask, isTaskOrderPayload, isTaskUpdate } from "@src/types/task";
import { useCallback, useEffect } from "react";
import * as store from "../store/taskSlice";
import { useAppDispatch, useAppSelector, useAppStore } from "./useReduxStore";

interface UseTaskService {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  reload: () => Promise<void>;
  createTask: (task: Task) => Promise<void>;
  updateTaskById: (taskId: Task["id"], task: Partial<Task>) => Promise<void>;
  deleteTask: (task: Task["id"]) => Promise<void>;
  moveTask: (taskId: Task["id"], status: TaskStatus, index: number) => Promise<void>;
}

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const useTaskService = (): UseTaskService => {
  const dispatch = useAppDispatch();
  const appStore = useAppStore();

  const tasks = useAppSelector((state) => state.tasks.tasks);
  const isLoading = useAppSelector((state) => state.tasks.isLoading);
  const error = useAppSelector((state) => state.tasks.error);
  const connectionStatus = useAppSelector((state) => state.tasks.connectionStatus);

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case WebSocketEventType.TASK_UPDATE:
          if (isTaskUpdate(message.payload)) {
            dispatch(store.updateTask(message.payload));
          }
          break;
        case WebSocketEventType.TASK_CREATE:
          if (isTask(message.payload)) {
            dispatch(store.addTask(message.payload));
          }
          break;
        case WebSocketEventType.TASK_DELETE:
          if (typeof message.payload.id === "string") {
            dispatch(store.removeTask(message.payload.id));
          }
          break;
        case WebSocketEventType.TASK_REORDER:
          if (isTaskOrderPayload(message.payload)) {
            dispatch(store.reorderTasks(message.payload));
          }
          break;
      }
    },
    [dispatch],
  );

  const reload = useCallback(async (): Promise<void> => {
    dispatch(store.setError(null));
    dispatch(store.setLoading(true));
    try {
      dispatch(store.setTasks(await mockApi.getTasks()));
    } catch (caught) {
      dispatch(store.setError(toErrorMessage(caught)));
      throw caught;
    } finally {
      dispatch(store.setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    let active = true;

    dispatch(store.setError(null));
    dispatch(store.setLoading(true));
    mockApi
      .getTasks()
      .then((loaded) => {
        if (active) dispatch(store.setTasks(loaded));
      })
      .catch((caught) => {
        if (active) dispatch(store.setError(toErrorMessage(caught)));
      })
      .finally(() => {
        if (active) dispatch(store.setLoading(false));
      });

    const unsubscribe = mockWebSocket.subscribe(handleMessage);
    const unsubscribeStatus = mockWebSocket.subscribeStatus((status) => {
      if (active) dispatch(store.setConnectionStatus(status));
    });
    dispatch(store.setConnectionStatus(mockWebSocket.getStatus()));
    void mockWebSocket.connect().catch((caught) => {
      if (active) dispatch(store.setError(toErrorMessage(caught)));
    });

    return () => {
      active = false;
      unsubscribe();
      unsubscribeStatus();
      mockWebSocket.disconnect();
    };
  }, [dispatch, handleMessage]);

  const createTask = useCallback(
    async (task: Task): Promise<void> => {
      try {
        dispatch(store.addTask(await mockApi.createTask(task)));
      } catch (caught) {
        dispatch(store.setError(toErrorMessage(caught)));
        throw caught;
      }
    },
    [dispatch],
  );

  const updateTaskById = useCallback(
    async (taskId: Task["id"], task: Partial<Task>): Promise<void> => {
      try {
        dispatch(store.updateTask(await mockApi.updateTask(taskId, { ...task, id: taskId })));
      } catch (caught) {
        dispatch(store.setError(toErrorMessage(caught)));
        throw caught;
      }
    },
    [dispatch],
  );

  const deleteTask = useCallback(
    async (taskId: Task["id"]): Promise<void> => {
      try {
        await mockApi.deleteTask(taskId);
        dispatch(store.removeTask(taskId));
      } catch (caught) {
        dispatch(store.setError(toErrorMessage(caught)));
        throw caught;
      }
    },
    [dispatch],
  );

  const moveTask = useCallback(
    async (taskId: Task["id"], status: TaskStatus, index: number): Promise<void> => {
      const previous = appStore.getState().tasks.tasks;
      const task = previous.find((item) => item.id === taskId);
      dispatch(store.moveTask({ taskId, status, index }));

      try {
        if (!task) throw new Error(`Task ${taskId} not found`);
        if (task.status !== status) {
          await mockApi.updateTask(taskId, { id: taskId, status });
          return;
        }
        const ids = appStore
          .getState()
          .tasks.tasks.filter((item) => item.status === status)
          .map((item) => item.id);
        await mockApi.reorderTasks(status, ids);
      } catch (caught) {
        dispatch(store.setTasks(previous));
        dispatch(store.setError(toErrorMessage(caught)));
        throw caught;
      }
    },
    [appStore, dispatch],
  );

  return {
    tasks,
    isLoading,
    error,
    connectionStatus,
    reload,
    createTask,
    updateTaskById,
    deleteTask,
    moveTask,
  };
};

export { useTaskService };
