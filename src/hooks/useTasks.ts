import { listTasks } from "@src/features/tasks/task.repository";
import { useLiveQuery } from "dexie-react-hooks";

export interface UseTasksOptions {
  projectId?: string;
}

export function useTasks({ projectId }: UseTasksOptions = {}) {
  const tasks = useLiveQuery(() => listTasks(projectId), [projectId]);

  return {
    tasks: tasks ?? [],
    isLoading: tasks === undefined,
  };
}
