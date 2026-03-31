import argon2 from "argon2";
import { Request } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UserNotAuthorizedError } from "./errors.js";
import { config } from "../config.js";
import { randomBytes } from "node:crypto";
import { NewToken } from "../db/schema.js";
import { createRefreshToken } from "../db/queries/tokens.js";

export async function hashPassword(password: string) {
  return await argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string) {
  return await argon2.verify(hash, password);
}

export function makeJWT(userId: string, expiresIn: number, secret: string) {
  const payload = {
    iss: config.jwt.issuer,
    sub: userId,
  }
  return jwt.sign(payload, secret, { expiresIn });
}

export function validateJWT(tokenString: string, secret: string) {
  let payload: JwtPayload
  try {
    payload = jwt.verify(tokenString, secret) as JwtPayload;
  } catch {
    throw new UserNotAuthorizedError("Invalid token");
  }
  if (payload.iss !== config.jwt.issuer) {
    throw new UserNotAuthorizedError("No issuer");
  }
  if (!payload.sub) {
    throw new UserNotAuthorizedError("No user ID in token");
  }
  return payload.sub;
}

export function getBearerToken(req: Request) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UserNotAuthorizedError("Authorization header missing");
  }
  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const [authType, token] = header.split(" ");
  if (authType !== "Bearer" || !token) {
    throw new BadRequestError("Malformed authorization header");
  }
  return token;
}

export async function makeRefreshToken(userId: string) {
  const token = randomBytes(256).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.api.refreshTokenExpiryDays);
  const newToken: NewToken = {
    token,
    userId,
    expiresAt,
  };
  const result = await createRefreshToken(newToken);
  return result.token;
}