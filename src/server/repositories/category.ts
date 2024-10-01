import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { NotfoundError } from "../lib/action";
import { categoriesTable, TCategory, TCategoryInsert } from "../db/schema";
import { Repo } from "./business";

export class CategoryRepo extends Repo<TCategory> {
  public static async find(where: {
    id: string;
    businessId: string;
  }): Promise<CategoryRepo | null> {
    const category = await db.query.categoriesTable.findFirst({
      where: and(
        eq(categoriesTable.id, where.id),
        eq(categoriesTable.businessId, where.businessId),
      ),
    });

    return category ? new this(category) : null;
  }

  public static async findOrThrow(where: {
    id: string;
    businessId: string;
  }): Promise<CategoryRepo> {
    const category = await this.find(where);

    if (!category) {
      throw new NotfoundError("Category");
    }

    return category;
  }

  public static async create(input: TCategoryInsert): Promise<CategoryRepo[]> {
    const categories = await db
      .insert(categoriesTable)
      .values(input)
      .returning();
    return categories.map((category) => new this(category));
  }

  public static async update(
    where: {
      id: string;
      businessId: string;
    },
    input: Partial<TCategoryInsert>,
  ): Promise<void> {
    await db
      .update(categoriesTable)
      .set(input)
      .where(
        and(
          eq(categoriesTable.id, where.id),
          eq(categoriesTable.businessId, where.businessId),
        ),
      );
  }

  public static async remove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(categoriesTable)
      .set({
        deletedAt: `NOW()`,
      })
      .where(
        and(
          eq(categoriesTable.id, where.id),
          eq(categoriesTable.businessId, where.businessId),
        ),
      );
  }

  public static async restore(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(categoriesTable)
      .set({
        deletedAt: null,
      })
      .where(
        and(
          eq(categoriesTable.id, where.id),
          eq(categoriesTable.businessId, where.businessId),
        ),
      );
  }

  public static async permRemove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .delete(categoriesTable)
      .where(
        and(
          eq(categoriesTable.id, where.id),
          eq(categoriesTable.businessId, where.businessId),
        ),
      );
  }
}
