import { db } from "@src/db/database";
import { loadExampleData } from "@src/db/seed";
import { t } from "@src/i18n/en";
import { exportBackup } from "../task.import-export";
import {
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  getTask,
  importBackupIntoDb,
  listProjects,
  listTasks,
  MAX_PROJECTS,
  moveTask,
  reorderTasks,
  updateProject,
  updateTask,
} from "../task.repository";
import { TaskStatus } from "../task.types";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

afterAll(() => {
  db.close();
});

describe("task repository", () => {
  it("creates projects and cascade-deletes their tasks", async () => {
    const project = await createProject({ name: "Trabajo", color: "#112233" });
    const task = await createTask({ projectId: project.id, title: "Informe" });

    expect(await listProjects()).toHaveLength(1);
    expect((await listTasks(project.id)).map((item) => item.id)).toEqual([task.id]);

    await deleteProject(project.id);

    expect(await listProjects()).toEqual([]);
    expect(await listTasks()).toEqual([]);
  });

  it("assigns positions per column and supports moving/reordering", async () => {
    const project = await createProject({ name: "Personal" });
    const first = await createTask({ projectId: project.id, title: "A" });
    const second = await createTask({ projectId: project.id, title: "B" });
    const done = await createTask({
      projectId: project.id,
      title: "C",
      status: TaskStatus.DONE,
    });

    expect([first.position, second.position, done.position]).toEqual([0, 1, 0]);

    const moved = await moveTask(first.id, TaskStatus.DONE, 0);
    expect(moved).toMatchObject({ status: TaskStatus.DONE, position: 0 });

    const doneColumn = (await listTasks(project.id)).filter(
      (task) => task.status === TaskStatus.DONE,
    );
    expect(doneColumn.map((task) => task.id)).toEqual([first.id, done.id]);

    const reordered = await reorderTasks(project.id, TaskStatus.DONE, [done.id, first.id]);
    expect(reordered.map((task) => task.id)).toEqual([done.id, first.id]);

    await deleteTask(second.id);
    expect(await getTask(second.id)).toBeUndefined();
  });

  it("updates records and validates project references", async () => {
    const project = await createProject({ name: "Hobby" });
    const task = await createTask({ projectId: project.id, title: "Leer" });

    await expect(createTask({ projectId: "missing", title: "x" })).rejects.toThrow(
      "Project missing not found",
    );

    const renamedProject = await updateProject(project.id, { name: "Lectura" });
    expect(renamedProject.name).toBe("Lectura");
    expect((await createProject({ name: "Otro" })).color).toBe(renamedProject.color);

    const updatedTask = await updateTask(task.id, { title: "Leer más", priority: "high" });
    expect(updatedTask).toMatchObject({ title: "Leer más", priority: "high" });
    await expect(updateTask(task.id, { projectId: "missing" })).rejects.toThrow(
      "Project missing not found",
    );
  });

  it("loads optional example data", async () => {
    await loadExampleData();

    const seededTasks = await listTasks();

    expect(await listProjects()).toHaveLength(1);
    expect(seededTasks).toHaveLength(3);
    expect(seededTasks.find((task) => task.title === t("seed.task2Title"))?.description).toBe(
      t("seed.task2Description"),
    );
    expect(t("seed.task2Description").length).toBeGreaterThan(140);
  });

  it("imports a versioned backup into IndexedDB", async () => {
    const project = await createProject({ name: "Origen" });
    const task = await createTask({ projectId: project.id, title: "Tarea" });
    const backup = exportBackup([project], [task]);

    const result = await importBackupIntoDb(JSON.parse(JSON.stringify(backup)));

    expect(result).toMatchObject({
      importedProjects: 1,
      importedTasks: 1,
      skippedProjects: 0,
      skippedTasks: 0,
    });
    expect(await listProjects()).toHaveLength(1);
    expect(await listTasks()).toHaveLength(1);
  });

  it("caps project creation at 50", async () => {
    for (let index = 0; index < MAX_PROJECTS; index += 1) {
      await createProject({ name: `Project ${index + 1}` });
    }

    expect(await listProjects()).toHaveLength(MAX_PROJECTS);
    await expect(createProject({ name: "One too many" })).rejects.toThrow(
      `Maximum ${MAX_PROJECTS} projects reached`,
    );
    expect(await listProjects()).toHaveLength(MAX_PROJECTS);
  });

  it("rejects imports that would exceed the project cap without writing data", async () => {
    for (let index = 0; index < MAX_PROJECTS - 1; index += 1) {
      await createProject({ name: `Project ${index + 1}` });
    }

    const now = new Date();
    const extras = [1, 2].map((index) => ({
      id: `import-${index}`,
      name: `Imported ${index}`,
      color: "#112233",
      description: "",
      createdAt: now,
      updatedAt: now,
    }));
    const backup = exportBackup(extras, []);

    await expect(importBackupIntoDb(JSON.parse(JSON.stringify(backup)))).rejects.toThrow(
      `Maximum ${MAX_PROJECTS} projects reached`,
    );
    expect(await listProjects()).toHaveLength(MAX_PROJECTS - 1);
  });
});
