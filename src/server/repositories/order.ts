import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { ordersTable, TOrder, TOrderInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";
import { Repo } from "./repo";

export class OrderRepo extends Repo<TOrder> {
  public static async find(where: {
    id: string;
    businessId: string;
  }): Promise<OrderRepo | null> {
    const order = await db.query.ordersTable.findFirst({
      where: and(
        eq(ordersTable.businessId, where.businessId),
        eq(ordersTable.id, where.id),
      ),
    });

    return order ? new this(order) : null;
  }

  public static async findOrThrow(where: {
    id: string;
    businessId: string;
  }): Promise<OrderRepo> {
    const order = await this.find(where);

    if (!order) {
      throw new NotfoundError("order");
    }

    return order;
  }

  public static async create(input: TOrderInsert[]): Promise<OrderRepo[]> {
    const orders = await db.insert(ordersTable).values(input).returning();
    return orders.map((order) => new this(order));
  }

  public static async update(
    where: {
      id: string;
      businessId: string;
    },
    input: Partial<TOrderInsert>,
  ): Promise<void> {
    await db
      .update(ordersTable)
      .set(input)
      .where(
        and(
          eq(ordersTable.businessId, where.businessId),
          eq(ordersTable.id, where.id),
        ),
      );
  }

  public static async remove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(ordersTable)
      .set({
        deletedAt: `NOW()`,
      })
      .where(
        and(
          eq(ordersTable.businessId, where.businessId),
          eq(ordersTable.id, where.id),
        ),
      );
  }

  public static async restore(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(ordersTable)
      .set({
        deletedAt: null,
      })
      .where(
        and(
          eq(ordersTable.businessId, where.businessId),
          eq(ordersTable.id, where.id),
        ),
      );
  }

  public static async permRemove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .delete(ordersTable)
      .where(
        and(
          eq(ordersTable.businessId, where.businessId),
          eq(ordersTable.id, where.id),
        ),
      );
  }
}
