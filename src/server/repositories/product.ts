import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { productsTable, TProduct, TProductInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";
import { Repo } from "./repo";

export class ProductRepo extends Repo<TProduct> {
  public static async find(where: {
    id: string;
    businessId: string;
  }): Promise<ProductRepo | null> {
    const product = await db.query.productsTable.findFirst({
      where: and(
        eq(productsTable.id, where.id),
        eq(productsTable.businessId, where.businessId),
      ),
    });

    return product ? new this(product) : null;
  }

  public static async findOrThrow(where: {
    id: string;
    businessId: string;
  }): Promise<ProductRepo> {
    const product = await this.find(where);

    if (!product) {
      throw new NotfoundError("Product");
    }

    return product;
  }

  public static async create(input: TProductInsert[]): Promise<ProductRepo[]> {
    const products = await db.insert(productsTable).values(input).returning();
    return products.map((product) => new this(product));
  }

  public static async update(
    where: {
      id: string;
      businessId: string;
    },
    input: Partial<TProductInsert>,
  ): Promise<void> {
    await db
      .update(productsTable)
      .set(input)
      .where(
        and(
          eq(productsTable.id, where.id),
          eq(productsTable.businessId, where.businessId),
        ),
      );
  }

  public static async remove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(productsTable)
      .set({
        deletedAt: `NOW()`,
      })
      .where(
        and(
          eq(productsTable.id, where.id),
          eq(productsTable.businessId, where.businessId),
        ),
      );
  }

  public static async permRemove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .delete(productsTable)
      .where(
        and(
          eq(productsTable.id, where.id),
          eq(productsTable.businessId, where.businessId),
        ),
      );
  }

  public static async restore(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(productsTable)
      .set({
        deletedAt: null,
      })
      .where(
        and(
          eq(productsTable.id, where.id),
          eq(productsTable.businessId, where.businessId),
        ),
      );
  }

  public async save(): Promise<void> {
    return ProductRepo.update(
      {
        id: this.data.id,
        businessId: this.data.businessId,
      },
      this.data,
    );
  }

  public async remove(): Promise<void> {
    return ProductRepo.remove({
      id: this.data.id,
      businessId: this.data.businessId,
    });
  }

  public async permRemove(): Promise<void> {
    return ProductRepo.permRemove({
      id: this.data.id,
      businessId: this.data.businessId,
    });
  }

  public async restore(): Promise<void> {
    return ProductRepo.restore({
      id: this.data.id,
      businessId: this.data.businessId,
    });
  }
}
