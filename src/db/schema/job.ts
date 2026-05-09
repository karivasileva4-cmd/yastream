import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { providerContent } from "./provider_content.js";

export enum JOB_TYPE {
  MKVDRAMA_STREAM = "MKVDRAMA_STREAM",
}
export enum JOB_STATUS {
  PENDING = "pending",
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed",
}

export const job = sqliteTable("job", {
  id: text("id").primaryKey(),
  status: text("status", {
    enum: [
      JOB_STATUS.PENDING,
      JOB_STATUS.RUNNING,
      JOB_STATUS.SUCCESS,
      JOB_STATUS.FAILED,
    ],
  }).notNull(),
  type: text("type", {
    enum: [JOB_TYPE.MKVDRAMA_STREAM],
  }).notNull(),
  data: text("data").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const jobRelations = relations(job, ({ one }) => ({
  providerContent: one(providerContent),
}));

export type EJob = typeof job.$inferSelect;
export type EJobInsert = typeof job.$inferInsert;
