import { inArray } from "drizzle-orm";
import { taskStatuses, taskTypes } from "./server/db/schema";
import { db } from "./server/db";
import { randomUUID } from "crypto";
import { TASK_STATUSES, TASK_TYPES } from "./common/constants";

export const seed = async () => {
  const types = [TASK_TYPES.BUG, TASK_TYPES.FEATURE];

  const ts = await db.query.taskTypes.findMany({
    where: inArray(taskTypes.name, types),
  });

  if (ts.length !== types.length) {
    await db.insert(taskTypes).values(
      types.map((type) => ({
        name: type,
      })),
    );
  }

  const status = [
    TASK_STATUSES.DONE,
    TASK_STATUSES.IN_PROGRESS,
    TASK_STATUSES.NOT_STARTED,
  ];

  const st = await db.query.taskStatuses.findMany({
    where: inArray(taskStatuses.name, status),
  });

  if (st.length !== status.length) {
    await db.insert(taskStatuses).values(
      status.map((state) => {
        const id = randomUUID();

        return {
          id,
          name: state,
        };
      }),
    );
  }
};
