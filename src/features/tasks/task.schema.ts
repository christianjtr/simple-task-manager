import { TaskStatus } from "@src/types/task";
import { z } from "zod";

const isoDateStringSchema = z.iso.datetime({ offset: true });
const isoDateSchema = isoDateStringSchema.transform((value) => new Date(value));
const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const projectFields = {
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  color: hexColorSchema,
  description: z.string().max(500).default(""),
};

const taskFields = {
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  description: z.string().max(1000).default(""),
  status: z.nativeEnum(TaskStatus),
  position: z.number().int().nonnegative(),
  priority: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string().trim().min(1)).max(10).default([]),
};

export const projectSchema = z.object({
  ...projectFields,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const projectFileSchema = z.object({
  ...projectFields,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const projectJsonSchema = z.object({
  ...projectFields,
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
});

export const taskSchema = z.object({
  ...taskFields,
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const taskFileSchema = z.object({
  ...taskFields,
  dueDate: isoDateSchema.optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const taskJsonSchema = z.object({
  ...taskFields,
  dueDate: isoDateStringSchema.optional(),
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
});

export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: isoDateSchema,
  projects: z.array(projectFileSchema),
  tasks: z.array(taskFileSchema),
});

export { isoDateStringSchema };
