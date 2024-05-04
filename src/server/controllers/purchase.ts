"use server";

import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from "@/common/schemas/purchase";
import { db } from "@/server/db";
import {
  products,
  purchases,
  purchasesItems,
  suppliers,
} from "@/server/db/schema";
import { action, auth, rscAuth } from "@/server/lib/action";
import { purchaseRepository } from "@/server/repositories/purchase";
import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { businessRepository } from "../repositories/business";
import { supplierRepository } from "../repositories/supplier";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";

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

  const business = await businessRepository.findOrThrow(businessId, user.id);

  const suppliersReauest = db
    .select({
      id: suppliers.id,
    })
    .from(suppliers)
    .where(
      and(
        eq(suppliers.businessId, business.id),
        ilike(suppliers.name, `%${query}%`),
      ),
    );

  const where = and(
    eq(purchases.businessId, business.id),
    trash ? isNotNull(purchases.deletedAt) : isNull(purchases.deletedAt),
    from || to
      ? and(
          from
            ? gte(purchases.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            purchases.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,
    query ? inArray(purchases.supplierId, suppliersReauest) : undefined,
  );

  const dataPromise = db.query.purchases.findMany({
    where,
    orderBy: desc(purchases.createdAt),
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
    .from(purchases)
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

export const restorePurchaseAction = action(
  restorePurchaseSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const purchase = await purchaseRepository.findOrThrow(
      input.id,
      business.id,
    );

    if (!purchase.deletedAt) {
      return;
    }

    const items = await db.query.purchasesItems.findMany({
      where: eq(purchasesItems.purchaseId, purchase.id),
    });

    await Promise.all(
      items.map((item) => {
        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} + ${item.quantity}`,
          })
          .where(
            and(
              eq(products.id, item.productId),
              eq(products.businessId, business.id),
            ),
          );
      }),
    );

    await db
      .update(purchases)
      .set({
        deletedAt: null,
      })
      .where(
        and(eq(purchases.id, input.id), eq(purchases.businessId, business.id)),
      );

    revalidatePath("/purchases");
    revalidatePath(`/purchases/${purchase.id}/edit`);
  },
);

export const createPurchaseAction = action(
  createPurchaseSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    let ps = await db.query.products.findMany({
      where: and(
        eq(products.businessId, business.id),
        inArray(
          products.id,
          input.products.map((product) => product.id),
        ),
      ),
    });

    const items = ps.map((p) => {
      const product = input.products.find((product) => product.id === p.id)!;

      return {
        ...p,
        quantity: product.quantity,
        cost: product.cost,
      };
    });

    const totalCost = items
      .map((p) => p.quantity * p.cost)
      .reduce((a, b) => a + b);

    const purchaseId = await purchaseRepository
      .create({
        supplierId: input.supplierId,
        businessId: business.id,
        totalCost,
      })
      .returning({ id: purchases.id })
      .then((ps) => ps[0].id);

    await db.insert(purchasesItems).values(
      items.map((p) => {
        return {
          purchaseId,
          cost: p.cost,
          productId: p.id,
          quantity: p.quantity,
        };
      }),
    );

    await Promise.all(
      items.map((item) => {
        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} + ${item.quantity}`,
          })
          .where(eq(products.id, item.id));
      }),
    );

    // revalidate products
    revalidatePath("/products");

    // revalidate purchases
    revalidatePath("/purchases");
    revalidatePath(`/dashboard`);
    revalidatePath(`/purchases/${purchaseId}/edit`);
  },
);

export const updatePurchaseAction = action(
  updatePurchaseSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const purchase = await purchaseRepository.findOrThrow(
      input.id,
      business.id,
    );

    if (purchase.supplierId !== input.supplierId) {
      const supplier = await supplierRepository.findOrThrow(
        input.supplierId,
        business.id,
      );

      await purchaseRepository.update(purchase.id, business.id, {
        supplierId: supplier.id,
      });
    }

    const oldItems = await db.query.purchasesItems.findMany({
      where: eq(purchasesItems.purchaseId, purchase.id),
    });

    await db
      .delete(purchasesItems)
      .where(eq(purchasesItems.purchaseId, purchase.id));

    await db.insert(purchasesItems).values(
      input.products.map((product) => ({
        productId: product.id,
        purchaseId: purchase.id,
        cost: product.cost,
        quantity: product.quantity,
      })),
    );

    const newItems = await db.query.products.findMany({
      where: and(
        eq(products.businessId, business.id),
        inArray(
          products.id,
          input.products.map((product) => product.id),
        ),
      ),
    });

    await Promise.all([
      ...newItems.map((item) => {
        const product = input.products.find(
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
              .update(products)
              .set({
                stock: sql<string>`${products.stock} - ${q}`,
              })
              .where(
                and(
                  eq(products.id, product.id),
                  eq(products.businessId, business.id),
                ),
              );
          }

          return db
            .update(products)
            .set({
              stock: sql<string>`${products.stock} + ${q}`,
            })
            .where(
              and(
                eq(products.id, product.id),
                eq(products.businessId, business.id),
              ),
            );
        }

        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} + ${product.quantity}`,
          })
          .where(
            and(
              eq(products.id, product.id),
              eq(products.businessId, business.id),
            ),
          );
      }),
      ...oldItems.map((oldItem) => {
        const product = input.products.find(
          (product) => product.id === oldItem.productId,
        );

        if (product) {
          return;
        }

        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} - ${oldItem.quantity}`,
          })
          .where(
            and(
              eq(products.businessId, business.id),
              eq(products.id, oldItem.productId),
            ),
          );
      }),
    ]);

    revalidatePath("/products");
    revalidatePath("/purchases");
    revalidatePath(`/purchases/${purchase.id}/edit`);
  },
);

const deletePurchaseSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
});

export const deletePurchaseAction = action(
  deletePurchaseSchema,
  async (input) => {
    const user = await auth();

    const business = await businessRepository.findOrThrow(
      input.businessId,
      user.id,
    );

    const purchase = await purchaseRepository.findOrThrow(
      input.id,
      business.id,
    );

    const items = await db.query.purchasesItems.findMany({
      where: eq(purchasesItems.purchaseId, purchase.id),
    });

    await Promise.all(
      items.map((item) => {
        return db
          .update(products)
          .set({
            stock: sql<string>`${products.stock} - ${item.quantity}`,
          })
          .where(
            and(
              eq(products.id, item.productId),
              eq(products.businessId, business.id),
            ),
          );
      }),
    );

    if (purchase.deletedAt) {
      await purchaseRepository.permRemove(input.id, business.id);
    } else {
      await purchaseRepository.remove(input.id, business.id);
    }

    revalidatePath("/products");

    revalidatePath(`/dashboard`);
    revalidatePath(`/purchases`);
    revalidatePath(`/purchases/${purchase.id}/edit`);
  },
);
