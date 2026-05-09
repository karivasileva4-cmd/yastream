import { CronJob } from "cron";
import { deleteJob, getJob, upsertJobs } from "../../db/query/job.js";
import { EJob, EJobInsert, JOB_STATUS, JOB_TYPE } from "../../db/schema/job.js";
import { ContentDetail } from "../../source/meta.js";
import MkvdramaScraper from "../../source/mkvdrama.js";
import { Provider } from "../../source/provider.js";
import { ENV } from "../../utils/env.js";
import { handleError } from "../../utils/error.js";
import { Logger } from "../../utils/logger.js";

export interface JobMkvdrama {
  mkvdramaId: string;
  content: ContentDetail;
}

const logger = new Logger("JOB");

export function upsertJob(job: EJobInsert) {
  upsertJobs([job]);
}

export function startCronJob() {
  if (!ENV.JOB_ENABLED) return;
  const CRON = ENV.JOB_CRON;
  logger.log(`Starting cron job ${CRON}`);
  const cronJob = new CronJob(
    CRON,
    function () {
      runCronJob();
    },
    null, // onComplete
    false,
    "Europe/Berlin",
  );
  cronJob.start();
}
const jobMap = new Map<string, EJob>();

async function runCronJob() {
  const job = await getJob();
  if (!job) return;
  if (jobMap.has(job.id)) return;
  jobMap.set(job.id, job);

  const start = Date.now();
  const mkvdrama = new MkvdramaScraper(Provider.MKVDRAMA);
  switch (job.type) {
    case JOB_TYPE.MKVDRAMA_STREAM:
      upsertJob({ ...job, status: JOB_STATUS.RUNNING });
      try {
        logger.log(`Running job ${job.type}`);
        await mkvdrama.runMkvdramaStream(job);
      } catch (error) {
        handleError(error, logger, `Failed to run job ${job.type}`);
        upsertJob({ ...job, status: JOB_STATUS.FAILED });
        break;
      }
      deleteJob(job.id);
      break;
    default:
      break;
  }
  const end = Date.now();
  logger.log(`Job ${job.type} took ${end - start}ms`);
}

startCronJob();
