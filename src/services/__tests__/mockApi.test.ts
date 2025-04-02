import { mockApi } from "../mockApi";
import { TaskStatus } from "../../types/task";

describe("mockApi", () => {
  describe("getTasks", () => {
    it("should return an array of tasks", async () => {
      const tasks = await mockApi.getTasks();

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(75);
    });

    it("should return tasks with valid structure", async () => {
      const tasks = await mockApi.getTasks();
      const task = tasks[0];

      expect(task).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          status: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );

      expect(Object.values(TaskStatus)).toContain(task.status);
    });

    it("should maintain consistent data between calls", async () => {
      const firstCall = await mockApi.getTasks();
      const secondCall = await mockApi.getTasks();

      expect(firstCall).toEqual(secondCall);
    });
  });

  describe("updateTask", () => {
    it("should update an existing task", async () => {
      const tasks = await mockApi.getTasks();
      const taskToUpdate = tasks[0];

      const updates = {
        title: "Updated Title",
        description: "Updated Description",
        status: TaskStatus.IN_PROGRESS,
      };

      const updatedTask = await mockApi.updateTask(taskToUpdate.id, updates);

      expect(updatedTask).toEqual(
        expect.objectContaining({
          ...taskToUpdate,
          ...updates,
          updatedAt: expect.any(String),
        })
      );

      const allTasks = await mockApi.getTasks();
      const foundTask = allTasks.find((t) => t.id === taskToUpdate.id);
      expect(foundTask).toEqual(updatedTask);
    });

    it("should throw error when updating non-existent task", async () => {
      await expect(
        mockApi.updateTask("non-existent-id", { title: "New Title" })
      ).rejects.toThrow("Task non-existent-id not found");
    });

    it("should only update specified fields", async () => {
      const tasks = await mockApi.getTasks();
      const taskToUpdate = tasks[0];
      const originalTask = { ...taskToUpdate };

      const updates = {
        title: "Partial Update",
      };

      const updatedTask = await mockApi.updateTask(taskToUpdate.id, updates);

      expect(updatedTask).toEqual(
        expect.objectContaining({
          ...originalTask,
          title: updates.title,
          updatedAt: expect.any(String),
        })
      );

      expect(updatedTask.description).toBe(originalTask.description);
      expect(updatedTask.status).toBe(originalTask.status);
    });

    it("should update timestamps correctly", async () => {
      const tasks = await mockApi.getTasks();
      const taskToUpdate = tasks[0];
      const originalUpdatedAt = taskToUpdate.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedTask = await mockApi.updateTask(taskToUpdate.id, {
        title: "New Title",
      });

      expect(updatedTask.createdAt).toBe(taskToUpdate.createdAt);
      expect(updatedTask.updatedAt).not.toBe(originalUpdatedAt);
      expect(new Date(updatedTask.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });
  });

  describe("_updateTaskState", () => {
    it("should update task state without delay", () => {
      const tasks = mockApi.getTasks();
      return tasks.then((allTasks) => {
        const taskToUpdate = allTasks[0];

        const updates = {
          title: "Instant Update",
        };

        const updatedTask = mockApi._updateTaskState(taskToUpdate.id, updates);

        expect(updatedTask).toEqual(
          expect.objectContaining({
            ...taskToUpdate,
            ...updates,
            updatedAt: expect.any(String),
          })
        );
      });
    });

    it("should throw error for non-existent task", () => {
      expect(() =>
        mockApi._updateTaskState("non-existent-id", { title: "New Title" })
      ).toThrow("Task non-existent-id not found");
    });
  });
});
