import { inArray } from "drizzle-orm";
import { taskStatuses, taskTypes } from "./server/db/schema";
import { db } from "./server/db";
import { randomUUID } from "crypto";

export const seed = async () => {
  const types = ["Bug", "Feature"];

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

  const status = ["Done", "In Progress", "Not Started"];

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
