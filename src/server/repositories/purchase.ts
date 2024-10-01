import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { purchasesTable, TPurchase, TPurchaseInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";
import { Repo } from "./business";

export class PurchaseRepo extends Repo<TPurchase> {
  public static async find(where: {
    id: string;
    businessId: string;
  }): Promise<PurchaseRepo | null> {
    const purchase = await db.query.purchasesTable.findFirst({
      where: and(
        eq(purchasesTable.id, where.id),
        eq(purchasesTable.businessId, where.businessId),
      ),
    });

    return purchase ? new this(purchase) : null;
  }

  public static async findOrThrow(where: {
    id: string;
    businessId: string;
  }): Promise<PurchaseRepo> {
    const purchase = await this.find(where);

    if (!purchase) {
      throw new NotfoundError("Purchase");
    }

    return purchase;
  }

  public static async create(
    input: TPurchaseInsert[],
  ): Promise<PurchaseRepo[]> {
    const purchases = await db.insert(purchasesTable).values(input).returning();
    return purchases.map((purchase) => new this(purchase));
  }

  public static async remove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(purchasesTable)
      .set({
        deletedAt: sql`NOW()`,
      })
      .where(
        and(
          eq(purchasesTable.id, where.id),
          eq(purchasesTable.businessId, where.businessId),
        ),
      );
  }

  public static async permRemove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .delete(purchasesTable)
      .where(
        and(
          eq(purchasesTable.id, where.id),
          eq(purchasesTable.businessId, where.businessId),
        ),
      );
  }

  public static async restore(where: { id: string; businessId: string }) {
    await db
      .update(purchasesTable)
      .set({
        deletedAt: null,
      })
      .where(
        and(
          eq(purchasesTable.id, where.id),
          eq(purchasesTable.businessId, where.businessId),
        ),
      );
  }

  public static async update(
    where: {
      id: string;
      businessId: string;
    },
    input: Partial<TPurchaseInsert>,
  ): Promise<void> {
    await db
      .update(purchasesTable)
      .set(input)
      .where(
        and(
          eq(purchasesTable.id, where.id),
          eq(purchasesTable.businessId, where.businessId),
        ),
      );
  }
}
