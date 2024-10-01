import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { TSupplier, TSupplierInsert, suppliersTable } from "../db/schema";
import { NotfoundError } from "../lib/action";
import { Repo } from "./business";

export class SupplierRepo extends Repo<TSupplier> {
  public static async find(where: {
    id: string;
    businessId: string;
  }): Promise<SupplierRepo | null> {
    const supplier = await db.query.suppliersTable.findFirst({
      where: and(
        eq(suppliersTable.id, where.id),
        eq(suppliersTable.businessId, where.businessId),
      ),
    });

    return supplier ? new this(supplier) : null;
  }

  public static async findOrThrow(where: {
    id: string;
    businessId: string;
  }): Promise<SupplierRepo> {
    const supplier = await this.find(where);

    if (!supplier) {
      throw new NotfoundError("Supplier");
    }

    return supplier;
  }

  public static async create(
    input: TSupplierInsert[],
  ): Promise<SupplierRepo[]> {
    const suppliers = await db.insert(suppliersTable).values(input).returning();
    return suppliers.map((supplier) => new this(supplier));
  }

  public static async update(
    where: {
      id: string;
      businessId: string;
    },
    input: Partial<TSupplierInsert>,
  ): Promise<void> {
    await db
      .update(suppliersTable)
      .set(input)
      .where(
        and(
          eq(suppliersTable.id, where.id),
          eq(suppliersTable.businessId, where.businessId),
        ),
      );
  }

  public static async remove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(suppliersTable)
      .set({
        deletedAt: `NOW()`,
      })
      .where(
        and(
          eq(suppliersTable.id, where.id),
          eq(suppliersTable.businessId, where.businessId),
        ),
      );
  }

  public static async permRemove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .delete(suppliersTable)
      .where(
        and(
          eq(suppliersTable.id, where.id),
          eq(suppliersTable.businessId, where.businessId),
        ),
      );
  }

  public static async restore(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(suppliersTable)
      .set({
        deletedAt: null,
      })
      .where(
        and(
          eq(suppliersTable.id, where.id),
          eq(suppliersTable.businessId, where.businessId),
        ),
      );
  }

  public async remove() {
    return SupplierRepo.remove({
      id: this.data.id,
      businessId: this.data.businessId,
    });
  }

  public async permRemove() {
    return SupplierRepo.permRemove({
      id: this.data.id,
      businessId: this.data.businessId,
    });
  }
}
