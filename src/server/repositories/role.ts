import { eq } from "drizzle-orm";
import { db } from "../db";
import { rolesTable, TRole } from "../db/schema";
import { Repo } from "./repo";
import { NotfoundError } from "../lib/action";

export class RoleRepo extends Repo<TRole> {
  public static async find(id: string): Promise<RoleRepo | null> {
    const role = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.id, id),
    });

    return role ? new RoleRepo(role) : null;
  }

  public static async findByName(name: string): Promise<RoleRepo | null> {
    const role = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.name, name),
    });

    return role ? new RoleRepo(role) : null;
  }

  public static async findOrThrow(id: string): Promise<RoleRepo> {
    const role = await this.find(id);

    if (!role) {
      throw new NotfoundError("Role");
    }

    return role;
  }

  public static async findByNameOrThrow(name: string): Promise<RoleRepo> {
    const role = await this.findByName(name);

    if (!role) {
      throw new NotfoundError("Role");
    }

    return role;
  }
}
