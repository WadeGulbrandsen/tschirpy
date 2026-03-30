import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewToken, refreshTokens } from "../schema.js";
import { UserNotAuthorizedError } from "../../api/errors.js";

export async function createRefreshToken(newToken: NewToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(newToken)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return result;
}

export async function revokeToken(token: string) {
  const [result] = await db
    .update(refreshTokens)
    .set({
      updatedAt: new Date(),
      revokedAt: new Date(),
    })
    .where(eq(refreshTokens.token, token))
    .returning();
  return result;
}