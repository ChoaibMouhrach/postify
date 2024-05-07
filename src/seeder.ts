import { inArray } from "drizzle-orm";
import { roles, taskStatuses, taskTypes } from "./server/db/schema";
import { db } from "./server/db";
import { randomUUID } from "crypto";
import { ROLES, TASK_STATUSES, TASK_TYPES } from "./common/constants";

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
    TASK_STATUSES.NOT_STARTED,
    TASK_STATUSES.IN_PROGRESS,
    TASK_STATUSES.DONE,
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

  const cr = [ROLES.MEMBER, ROLES.ADMIN];

  const rs = await db.query.roles.findMany({
    where: inArray(roles.name, cr),
  });

  if (rs.length !== cr.length) {
    await db.insert(roles).values(cr.map((name) => ({ name })));
  }
};
