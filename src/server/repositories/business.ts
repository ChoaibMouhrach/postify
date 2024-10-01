import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { NotfoundError } from "../lib/action";
import { TBusiness, TBusinessInsert, businessesTable } from "../db/schema";

export class Repo<T> {
  public data: T;

  public constructor(data: T) {
    this.data = data;
  }
}

export class BusinessRepo extends Repo<TBusiness> {
  public static async find(where: {
    id: string;
    userId: string;
  }): Promise<BusinessRepo | null> {
    const business = await db.query.businessesTable.findFirst({
      where: and(
        eq(businessesTable.userId, where.userId),
        eq(businessesTable.id, where.id),
      ),
    });

    return business ? new this(business) : null;
  }

  public static async findOrThrow(where: {
    id: string;
    userId: string;
  }): Promise<BusinessRepo> {
    const business = await this.find(where);

    if (!business) {
      throw new NotfoundError("Business");
    }

    return business;
  }

  public static async create(
    input: TBusinessInsert[],
  ): Promise<BusinessRepo[]> {
    const businesses = await db
      .insert(businessesTable)
      .values(input)
      .returning();
    return businesses.map((business) => new this(business));
  }

  public static async update(
    where: {
      id: string;
      userId: string;
    },
    input: Partial<TBusinessInsert>,
  ): Promise<void> {
    await db
      .update(businessesTable)
      .set(input)
      .where(
        and(
          eq(businessesTable.userId, where.userId),
          eq(businessesTable.id, where.id),
        ),
      );
  }

  public static async remove(where: {
    id: string;
    userId: string;
  }): Promise<void> {
    await db
      .update(businessesTable)
      .set({
        deletedAt: `NOW()`,
      })
      .where(
        and(
          eq(businessesTable.userId, where.userId),
          eq(businessesTable.id, where.id),
        ),
      );
  }

  public static async restore(where: {
    id: string;
    userId: string;
  }): Promise<void> {
    await db
      .update(businessesTable)
      .set({
        deletedAt: null,
      })
      .where(
        and(
          eq(businessesTable.userId, where.userId),
          eq(businessesTable.id, where.id),
        ),
      );
  }

  public static async permRemove(where: {
    id: string;
    userId: string;
  }): Promise<void> {
    await db
      .delete(businessesTable)
      .where(
        and(
          eq(businessesTable.userId, where.userId),
          eq(businessesTable.id, where.id),
        ),
      );
  }
}
