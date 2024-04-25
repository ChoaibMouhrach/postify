import { inArray } from "drizzle-orm";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // eslint-disable-next-line no-console
    console.log("SEEDING");

    const { db } = await import("@/server/db");
    const { taskTypes } = await import("@/server/db/schema");

    const types = ["Bug", "Feature"];

    const ts = await db.query.taskTypes.findMany({
      where: inArray(taskTypes.name, types),
    });

    if (ts.length === types.length) {
      return;
    }

    await db.insert(taskTypes).values(
      types.map((type) => ({
        name: type,
      })),
    );

    // eslint-disable-next-line no-console
    console.log("SEEDED");
  }
}
