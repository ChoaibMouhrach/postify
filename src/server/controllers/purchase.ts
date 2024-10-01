"use server";

import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from "@/common/schemas/purchase";
import { db } from "@/server/db";
import {
  productsTable,
  purchasesTable,
  purchasesItems,
  suppliersTable,
} from "@/server/db/schema";
import { action, auth, rscAuth } from "@/server/lib/action";
import {
  and,
  between,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";
import { BusinessRepo } from "../repositories/business";
import { PurchaseRepo } from "../repositories/purchase";
import { SupplierRepo } from "../repositories/supplier";

const schema = z.object({
  businessId: z.string().uuid(),
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
  from: fromSchema,
  to: toSchema,
});

export const getPurchasesActiopn = async (input: unknown) => {
  const { page, query, trash, from, to, businessId } = schema.parse(input);

  const user = await rscAuth();

  const business = await BusinessRepo.findOrThrow({
    id: businessId,
    userId: user.id,
  });

  const suppliersReauest = db
    .select({
      id: suppliersTable.id,
    })
    .from(suppliersTable)
    .where(
      and(
        eq(suppliersTable.businessId, business.data.id),
        ilike(suppliersTable.name, `%${query}%`),
      ),
    );

  const where = and(
    eq(purchasesTable.businessId, business.data.id),
    trash
      ? isNotNull(purchasesTable.deletedAt)
      : isNull(purchasesTable.deletedAt),
    from && to
      ? between(
          purchasesTable.createdAt,
          new Date(parseInt(from)).toISOString().slice(0, 10),
          new Date(parseInt(to)).toISOString().slice(0, 10),
        )
      : undefined,
    query ? inArray(purchasesTable.supplierId, suppliersReauest) : undefined,
  );

  const dataPromise = db.query.purchasesTable.findMany({
    where,
    orderBy: desc(purchasesTable.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
    with: {
      supplier: true,
    },
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(purchasesTable)
    .where(where)
    .then((recs) => parseInt(recs[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return {
    // data
    data,
    business,
    // meta
    query,
    trash,
    from,
    to,
    // pagination
    page,
    lastPage,
  };
};

const restorePurchaseSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const restorePurchaseAction = action
  .schema(restorePurchaseSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const purchase = await PurchaseRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (!purchase.data.deletedAt) {
      return;
    }

    const items = await db.query.purchasesItems.findMany({
      where: eq(purchasesItems.purchaseId, purchase.data.id),
    });

    await Promise.all(
      items.map((item) => {
        return db
          .update(productsTable)
          .set({
            stock: sql<string>`${productsTable.stock} + ${item.quantity}`,
          })
          .where(
            and(
              eq(productsTable.id, item.productId),
              eq(productsTable.businessId, business.data.id),
            ),
          );
      }),
    );

    await db
      .update(purchasesTable)
      .set({
        deletedAt: null,
      })
      .where(
        and(
          eq(purchasesTable.id, parsedInput.id),
          eq(purchasesTable.businessId, business.data.id),
        ),
      );

    revalidatePath("/purchases");
    revalidatePath(`/purchases/${purchase.data.id}/edit`);
  });

export const createPurchaseAction = action
  .schema(createPurchaseSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    let ps = await db.query.productsTable.findMany({
      where: and(
        eq(productsTable.businessId, business.data.id),
        inArray(
          productsTable.id,
          parsedInput.products.map((product) => product.id),
        ),
      ),
    });

    const items = ps.map((p) => {
      const product = parsedInput.products.find(
        (product) => product.id === p.id,
      )!;

      return {
        ...p,
        quantity: product.quantity,
        cost: product.cost,
      };
    });

    const totalCost = items
      .map((p) => p.quantity * p.cost)
      .reduce((a, b) => a + b);

    const [purchase] = await PurchaseRepo.create([
      {
        supplierId: parsedInput.supplierId,
        businessId: business.data.id,
        totalCost,
      },
    ]);

    await db.insert(purchasesItems).values(
      items.map((p) => {
        return {
          purchaseId: purchase.data.id,
          cost: p.cost,
          productId: p.id,
          quantity: p.quantity,
        };
      }),
    );

    await Promise.all(
      items.map((item) => {
        return db
          .update(productsTable)
          .set({
            stock: sql<string>`${productsTable.stock} + ${item.quantity}`,
          })
          .where(eq(productsTable.id, item.id));
      }),
    );

    // revalidate products
    revalidatePath("/products");

    // revalidate purchases
    revalidatePath("/purchases");
    revalidatePath(`/dashboard`);
    revalidatePath(`/purchases/${purchase.data.id}/edit`);
  });

export const updatePurchaseAction = action
  .schema(updatePurchaseSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const purchase = await PurchaseRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (purchase.data.supplierId !== parsedInput.supplierId) {
      const supplier = await SupplierRepo.findOrThrow({
        id: parsedInput.supplierId,
        businessId: business.data.id,
      });

      await PurchaseRepo.update(
        {
          id: parsedInput.id,
          businessId: business.data.id,
        },
        {
          supplierId: supplier.data.id,
        },
      );
    }

    const oldItems = await db.query.purchasesItems.findMany({
      where: eq(purchasesItems.purchaseId, purchase.data.id),
    });

    await db
      .delete(purchasesItems)
      .where(eq(purchasesItems.purchaseId, purchase.data.id));

    await db.insert(purchasesItems).values(
      parsedInput.products.map((product) => ({
        productId: product.id,
        purchaseId: purchase.data.id,
        cost: product.cost,
        quantity: product.quantity,
      })),
    );

    const newItems = await db.query.productsTable.findMany({
      where: and(
        eq(productsTable.businessId, business.data.id),
        inArray(
          productsTable.id,
          parsedInput.products.map((product) => product.id),
        ),
      ),
    });

    await Promise.all([
      ...newItems.map((item) => {
        const product = parsedInput.products.find(
          (product) => product.id === item.id,
        )!;

        const oldItem = oldItems.find(
          (oldItem) => oldItem.productId === item.id,
        );

        if (oldItem) {
          const q = Math.abs(product.quantity - oldItem.quantity);

          if (oldItem.quantity === product.quantity) {
            return;
          }

          if (oldItem.quantity > product.quantity) {
            return db
              .update(productsTable)
              .set({
                stock: sql<string>`${productsTable.stock} - ${q}`,
              })
              .where(
                and(
                  eq(productsTable.id, product.id),
                  eq(productsTable.businessId, business.data.id),
                ),
              );
          }

          return db
            .update(productsTable)
            .set({
              stock: sql<string>`${productsTable.stock} + ${q}`,
            })
            .where(
              and(
                eq(productsTable.id, product.id),
                eq(productsTable.businessId, business.data.id),
              ),
            );
        }

        return db
          .update(productsTable)
          .set({
            stock: sql<string>`${productsTable.stock} + ${product.quantity}`,
          })
          .where(
            and(
              eq(productsTable.id, product.id),
              eq(productsTable.businessId, business.data.id),
            ),
          );
      }),
      ...oldItems.map((oldItem) => {
        const product = parsedInput.products.find(
          (product) => product.id === oldItem.productId,
        );

        if (product) {
          return;
        }

        return db
          .update(productsTable)
          .set({
            stock: sql<string>`${productsTable.stock} - ${oldItem.quantity}`,
          })
          .where(
            and(
              eq(productsTable.businessId, business.data.id),
              eq(productsTable.id, oldItem.productId),
            ),
          );
      }),
    ]);

    revalidatePath("/products");
    revalidatePath("/purchases");
    revalidatePath(`/purchases/${purchase.data.id}/edit`);
  });

const deletePurchaseSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deletePurchaseAction = action
  .schema(deletePurchaseSchema)
  .action(async ({ parsedInput }) => {
    const user = await auth();

    const business = await BusinessRepo.findOrThrow({
      id: parsedInput.businessId,
      userId: user.id,
    });

    const purchase = await PurchaseRepo.findOrThrow({
      id: parsedInput.id,
      businessId: business.data.id,
    });

    if (purchase.data.deletedAt) {
      await PurchaseRepo.permRemove({
        id: parsedInput.id,
        businessId: business.data.id,
      });
    } else {
      const items = await db.query.purchasesItems.findMany({
        where: eq(purchasesItems.purchaseId, purchase.data.id),
      });

      await Promise.all(
        items.map((item) => {
          return db
            .update(productsTable)
            .set({
              stock: sql<string>`${productsTable.stock} - ${item.quantity}`,
            })
            .where(
              and(
                eq(productsTable.id, item.productId),
                eq(productsTable.businessId, business.data.id),
              ),
            );
        }),
      );

      await PurchaseRepo.remove({
        id: parsedInput.id,
        businessId: business.data.id,
      });
    }

    revalidatePath("/products");
    revalidatePath(`/dashboard`);
    revalidatePath(`/purchases`);
  });
