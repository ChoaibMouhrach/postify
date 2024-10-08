import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  magicTokensTable,
  TMagicToken,
  TUser,
  TUserInsert,
  usersTable,
} from "../db/schema";
import { Repo } from "./repo";
import { NotfoundError } from "../lib/action";
import { randomUUID } from "crypto";
import { Mailer } from "../lib/mailer";
import { lucia } from "../lib/auth";
import { Cookie } from "lucia";

export class UserRepo extends Repo<TUser> {
  public mail: Mailer;

  public constructor(data: TUser) {
    super(data);
    this.mail = new Mailer(data.email);
  }

  public static async find(id: string): Promise<UserRepo | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });

    return user ? new this(user) : null;
  }

  public static async findorThrow(id: string): Promise<UserRepo | null> {
    const user = this.find(id);

    if (!user) {
      throw new NotfoundError("User");
    }

    return user;
  }

  public static async findByEmail(email: string): Promise<UserRepo | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    return user ? new this(user) : null;
  }

  public static async findByEmailOrThrow(
    email: string,
  ): Promise<UserRepo | null> {
    const user = this.findByEmail(email);

    if (!user) {
      throw new NotfoundError("User");
    }

    return user;
  }

  public static async create(input: TUserInsert[]): Promise<UserRepo[]> {
    const users = await db.insert(usersTable).values(input).returning();
    return users.map((user) => new this(user));
  }

  public static async update(id: string, input: TUserInsert): Promise<void> {
    await db.update(usersTable).set(input).where(eq(usersTable.id, id));
  }

  public static async remove(id: string): Promise<void> {
    await db.delete(usersTable).where(eq(usersTable.id, id));
  }

  public static async findMagicToken(
    token: string,
  ): Promise<(TMagicToken & { user: UserRepo }) | null> {
    const magicToken = await db.query.magicTokensTable.findFirst({
      where: eq(magicTokensTable.token, token),
      with: {
        user: true,
      },
    });

    return magicToken
      ? {
          ...magicToken,
          user: new UserRepo(magicToken.user),
        }
      : null;
  }

  public async save(): Promise<void> {
    return UserRepo.update(this.data.id, this.data);
  }

  public async createMagicToken(): Promise<TMagicToken> {
    const [magicToken] = await db
      .insert(magicTokensTable)
      .values({
        token: randomUUID(),
        expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
        userId: this.data.id,
      })
      .returning();

    return magicToken;
  }

  public async removeMagicToken(token: string): Promise<void> {
    await db
      .delete(magicTokensTable)
      .where(
        and(
          eq(magicTokensTable.token, token),
          eq(magicTokensTable.userId, this.data.id),
        ),
      );
  }

  public async createSession(): Promise<Cookie> {
    const session = await lucia.createSession(this.data.id, {});
    return lucia.createSessionCookie(session.id);
  }
}
