import { listProjects } from "@src/features/tasks/task.repository";
import { useLiveQuery } from "dexie-react-hooks";

export function useProjects() {
  const projects = useLiveQuery(() => listProjects(), []);

  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
  };
}
