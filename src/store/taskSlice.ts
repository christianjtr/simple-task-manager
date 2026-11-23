import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ConnectionStatus,
  Task,
  TaskMove,
  TaskOrderPayload,
  TaskUpdate,
} from "../types/task";

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
}

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
  connectionStatus: "disconnected",
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      if (!state.tasks.some((task) => task.id === action.payload.id)) {
        state.tasks.push(action.payload);
      }
    },
    updateTask: (state, action: PayloadAction<TaskUpdate>) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
      }
    },
    removeTask: (state, action: PayloadAction<Task["id"]>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    moveTask: (state, action: PayloadAction<TaskMove>) => {
      const { taskId, status, index } = action.payload;
      const currentIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (currentIndex === -1) return;

      const task = state.tasks[currentIndex];
      const remaining = state.tasks.filter((item) => item.id !== taskId);
      const column = remaining.filter((item) => item.status === status);
      const insertAt = clamp(index, 0, column.length);
      const nextTask: Task = {
        ...task,
        status,
        updatedAt: new Date().toISOString(),
      };

      if (column.length === 0) {
        remaining.push(nextTask);
      } else if (insertAt === column.length) {
        const last = column[column.length - 1];
        const lastIndex = remaining.findIndex((item) => item.id === last.id);
        remaining.splice(lastIndex + 1, 0, nextTask);
      } else {
        const before = column[insertAt];
        const beforeIndex = remaining.findIndex((item) => item.id === before.id);
        remaining.splice(beforeIndex, 0, nextTask);
      }

      state.tasks = remaining;
    },
    reorderTasks: (state, action: PayloadAction<TaskOrderPayload>) => {
      const { ids, status } = action.payload;
      const byId = new Map(state.tasks.map((task) => [task.id, task]));
      const ordered = ids
        .map((id) => byId.get(id))
        .filter((task): task is Task => Boolean(task && task.status === status));
      const others = state.tasks.filter((task) => !ids.includes(task.id));
      state.tasks = [...others, ...ordered];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setConnectionStatus: (
      state,
      action: PayloadAction<ConnectionStatus>
    ) => {
      state.connectionStatus = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  moveTask,
  reorderTasks,
  setLoading,
  setError,
  setConnectionStatus,
} = taskSlice.actions;

export default taskSlice.reducer;
