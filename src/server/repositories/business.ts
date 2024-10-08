import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { NotfoundError } from "../lib/action";
import { TBusiness, TBusinessInsert, businessesTable } from "../db/schema";
import { Repo } from "./repo";

export class BusinessesRepo extends Repo<TBusiness> {
  public static async findByEmail(where: {
    email: string;
    userId: string;
  }): Promise<BusinessesRepo | null> {
    const business = await db.query.businessesTable.findFirst({
      where: and(
        eq(businessesTable.userId, where.userId),
        eq(businessesTable.email, where.email),
      ),
    });

    return business ? new this(business) : null;
  }

  public static async find(where: {
    id: string;
    userId: string;
  }): Promise<BusinessesRepo | null> {
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
  }): Promise<BusinessesRepo> {
    const business = await this.find(where);

    if (!business) {
      throw new NotfoundError("Business");
    }

    return business;
  }

  public static async create(
    input: TBusinessInsert[],
  ): Promise<BusinessesRepo[]> {
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

  public async save(): Promise<void> {
    return BusinessesRepo.update(
      {
        id: this.data.id,
        userId: this.data.userId,
      },
      this.data,
    );
  }

  public async remove(): Promise<void> {
    return BusinessesRepo.remove({
      id: this.data.id,
      userId: this.data.userId,
    });
  }

  public async permRemove(): Promise<void> {
    return BusinessesRepo.permRemove({
      id: this.data.id,
      userId: this.data.userId,
    });
  }

  public async restore(): Promise<void> {
    return BusinessesRepo.restore({
      id: this.data.id,
      userId: this.data.userId,
    });
  }
}
