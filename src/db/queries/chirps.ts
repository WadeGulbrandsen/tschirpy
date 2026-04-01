import { asc, desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteChirp(chirpId: string) {
  const [result] = await db
    .delete(chirps)
    .where(eq(chirps.id, chirpId))
    .returning();
  return result;
}

export async function getChirps(reverse: boolean = false) {
  return await db
    .select()
    .from(chirps)
    .orderBy((reverse ? desc : asc)(chirps.createdAt));
}

export async function getChirpsByAuthor(userId: string, reverse: boolean = false) {
  return await db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, userId))
    .orderBy((reverse ? desc : asc)(chirps.createdAt));
}

export async function getChirp(chirpId: string) {
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId));
  return result;
}