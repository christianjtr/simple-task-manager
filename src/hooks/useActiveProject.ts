import { useEffect, useState } from "react";

import { useProjects } from "./useProjects";

const STORAGE_KEY = "simple-task-manager:active-project";

export function useActiveProject() {
  const { projects, isLoading } = useProjects();
  const [storedId, setStoredId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  const activeProject = projects.find((project) => project.id === storedId) ?? projects[0] ?? null;

  useEffect(() => {
    if (activeProject) localStorage.setItem(STORAGE_KEY, activeProject.id);
    else localStorage.removeItem(STORAGE_KEY);
  }, [activeProject]);

  return {
    projects,
    isLoading,
    activeProject,
    setActiveProject: (id: string) => setStoredId(id),
  };
}
