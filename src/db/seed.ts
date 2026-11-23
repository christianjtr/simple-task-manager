import { db } from "@src/db/database";

import { type Project, type Task, TaskStatus } from "@src/features/tasks/task.types";

export async function loadExampleData(): Promise<void> {
  const projectId = "project_example";
  const now = new Date();
  const project: Project = {
    id: projectId,
    name: "Proyecto de ejemplo",
    color: "#6366f1",
    description: "Proyecto inicial para explorar el tablero.",
    createdAt: now,
    updatedAt: now,
  };

  const examples: Array<Pick<Task, "title" | "description" | "status" | "priority" | "tags">> = [
    {
      title: "Definir alcance",
      description: "Escribir los objetivos del proyecto.",
      status: TaskStatus.TODO,
      priority: "high",
      tags: ["planificación"],
    },
    {
      title: "Diseñar tablero",
      description: "Bocetar las columnas y el diseño de tarjeta.",
      status: TaskStatus.IN_PROGRESS,
      priority: "medium",
      tags: ["diseño"],
    },
    {
      title: "Preparar entorno",
      description: "Instalar dependencias y configurar el repositorio.",
      status: TaskStatus.DONE,
      priority: "low",
      tags: ["setup"],
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
