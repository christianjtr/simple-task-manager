import { db } from "@src/db/database";

import { type Project, type Task, TaskStatus } from "@src/features/tasks/task.types";
import { t } from "@src/i18n/en";

export async function loadExampleData(): Promise<void> {
  const projectId = "project_example";
  const now = new Date();
  const project: Project = {
    id: projectId,
    name: t("seed.projectName"),
    color: "#6366f1",
    description: t("seed.projectDescription"),
    createdAt: now,
    updatedAt: now,
  };

  const examples: Array<Pick<Task, "title" | "description" | "status" | "priority" | "tags">> = [
    {
      title: t("seed.task1Title"),
      description: t("seed.task1Description"),
      status: TaskStatus.TODO,
      priority: "high",
      tags: [t("seed.task1Tag")],
    },
    {
      title: t("seed.task2Title"),
      description: t("seed.task2Description"),
      status: TaskStatus.IN_PROGRESS,
      priority: "medium",
      tags: [t("seed.task2Tag")],
    },
    {
      title: t("seed.task3Title"),
      description: t("seed.task3Description"),
      status: TaskStatus.DONE,
      priority: "low",
      tags: [t("seed.task3Tag")],
    },
  ];

  const tasks: Task[] = examples.map((example, index) => ({
    ...example,
    id: `task_example_${index + 1}`,
    projectId,
    position: index,
    createdAt: now,
    updatedAt: now,
  }));

  await db.transaction("rw", db.projects, db.tasks, async () => {
    await db.projects.put(project);
    await db.tasks.bulkPut(tasks);
  });
}
