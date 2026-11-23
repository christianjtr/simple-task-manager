import { db } from "./database";

export async function openTaskDatabase() {
  await db.open();
  return db;
}

export function closeTaskDatabase(): void {
  db.close();
}

export async function resetTaskDatabase() {
  await db.delete();
  await db.open();
  return db;
}
