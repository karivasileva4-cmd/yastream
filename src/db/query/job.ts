import { asc, count, eq, or, sql } from "drizzle-orm";
import { handleError } from "../../utils/error.js";
import { Logger } from "../../utils/logger.js";
import { db } from "../drizzle.js";
import { EJobInsert, job, JOB_STATUS } from "../schema/job.js";

const logger = new Logger("DB");
export async function upsertJobs(jobs: EJobInsert[]) {
  if (!db) return;
  try {
    await db
      .insert(job)
      .values(jobs)
      .onConflictDoUpdate({
        target: job.id,
        set: {
          status: sql.raw(`excluded.${job.status.name}`),
          data: sql.raw(`excluded.${job.data.name}`),
        },
      })
      .run();
  } catch (e) {
    handleError(e, logger, `Failed to upsert job`);
  }
}

export function getJob() {
  if (!db) return;
  const row = db.query.job.findFirst({
    where: or(
      eq(job.status, JOB_STATUS.PENDING),
      eq(job.status, JOB_STATUS.RUNNING),
      eq(job.status, JOB_STATUS.FAILED),
    ),
    orderBy: asc(job.createdAt),
  });
  return row;
}

export async function countjob() {
  if (!db) return;
  const number = await db.select({ count: count(job.id) }).from(job);
  return number;
}

export async function deleteJob(id: string) {
  if (!db) return;
  const row = db.delete(job).where(eq(job.id, id));
  return row;
}
