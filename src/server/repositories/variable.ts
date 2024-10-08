import { eq } from "drizzle-orm";
import { db } from "../db";
import { TVariable, TVariableInsert, variablesTable } from "../db/schema";
import { NotfoundError } from "../lib/action";
import { Repo } from "./repo";

export class VariableRepo extends Repo<TVariable> {
  public static async find(id: string): Promise<VariableRepo | null> {
    const variable = await db.query.variablesTable.findFirst({
      where: eq(variablesTable.id, id),
    });

    return variable ? new VariableRepo(variable) : null;
  }

  public static async findOrThrow(id: string): Promise<VariableRepo> {
    const variable = await this.find(id);

    if (!variable) {
      throw new NotfoundError("Variable");
    }

    return variable;
  }

  public static async findByKey(key: string): Promise<VariableRepo | null> {
    const variable = await db.query.variablesTable.findFirst({
      where: eq(variablesTable.key, key),
    });

    return variable ? new VariableRepo(variable) : null;
  }

  public static async findByKeyOrThrow(key: string): Promise<VariableRepo> {
    const variable = await this.find(key);

    if (!variable) {
      throw new NotfoundError("Variable");
    }

    return variable;
  }

  public static async insert(
    input: TVariableInsert[],
  ): Promise<VariableRepo[]> {
    const variables = await db.insert(variablesTable).values(input).returning();
    return variables.map((variable) => new this(variable));
  }

  public static async update(
    id: string,
    input: TVariableInsert,
  ): Promise<void> {
    await db.update(variablesTable).set(input).where(eq(variablesTable.id, id));
  }

  public static async upsert(input: TVariableInsert) {
    let variable = await this.findByKey(input.key);

    if (!variable) {
      let [newVariable] = await this.insert([input]);
      return newVariable;
    }

    await this.update(variable.data.id, input);

    Object.assign(input, variable.data);
    return variable;
  }
}
