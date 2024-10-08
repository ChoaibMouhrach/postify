import { customersTable, TCustomer, TCustomerInsert } from "../db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NotfoundError } from "../lib/action";
import { db } from "../db";
import { Repo } from "./repo";

export class CustomerRepo extends Repo<TCustomer> {
  public static async findByEmail(where: {
    email: string;
    businessId: string;
  }): Promise<CustomerRepo | null> {
    const customer = await db.query.customersTable.findFirst({
      where: and(
        eq(customersTable.email, where.email),
        eq(customersTable.businessId, where.businessId),
      ),
    });

    return customer ? new this(customer) : null;
  }

  public static async find(where: {
    id: string;
    businessId: string;
  }): Promise<CustomerRepo | null> {
    const customer = await db.query.customersTable.findFirst({
      where: and(
        eq(customersTable.id, where.id),
        eq(customersTable.businessId, where.businessId),
      ),
    });

    return customer ? new this(customer) : null;
  }

  public static async findOrThrow(where: {
    id: string;
    businessId: string;
  }): Promise<CustomerRepo> {
    const customer = await this.find(where);

    if (!customer) {
      throw new NotfoundError("Customer");
    }

    return customer;
  }

  public static async create(
    input: TCustomerInsert[],
  ): Promise<CustomerRepo[]> {
    const customers = await db.insert(customersTable).values(input).returning();
    return customers.map((customer) => new this(customer));
  }

  public static async update(
    where: {
      id: string;
      businessId: string;
    },
    input: Partial<TCustomerInsert>,
  ): Promise<void> {
    await db
      .update(customersTable)
      .set(input)
      .where(
        and(
          eq(customersTable.id, where.id),
          eq(customersTable.businessId, where.businessId),
        ),
      );
  }

  public static async remove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(customersTable)
      .set({
        deletedAt: sql`NOW()`.mapWith(Number),
      })
      .where(
        and(
          eq(customersTable.id, where.id),
          eq(customersTable.businessId, where.businessId),
        ),
      );
  }

  public static async permRemove(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .delete(customersTable)
      .where(
        and(
          eq(customersTable.id, where.id),
          eq(customersTable.businessId, where.businessId),
        ),
      );
  }

  public static async restore(where: {
    id: string;
    businessId: string;
  }): Promise<void> {
    await db
      .update(customersTable)
      .set({
        deletedAt: null,
      })
      .where(
        and(
          eq(customersTable.id, where.id),
          eq(customersTable.businessId, where.businessId),
        ),
      );
  }

  public async restore() {
    await CustomerRepo.restore({
      businessId: this.data.businessId,
      id: this.data.id,
    });
  }

  public async save() {
    await CustomerRepo.update(
      {
        businessId: this.data.businessId,
        id: this.data.id,
      },
      this.data,
    );
  }
}
