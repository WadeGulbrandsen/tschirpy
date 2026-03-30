import { Request, Response } from "express";
import { createUser, getUser } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken } from "./auth.js";
import { config } from "../config.js";
import { getRefreshToken, revokeToken } from "../db/queries/tokens.js";

export async function handlerNewUser(req: Request, res: Response) {
  type params = {
    password: string;
    email: string;
  };

  const parsed: params = req.body;

  if (!parsed.password) {
    throw new BadRequestError("Invalid password");
  }
  const passwordHash = await hashPassword(parsed.password);

  if (!parsed.email || !parsed.email.includes("@")) {
    throw new BadRequestError("Invalid email");
  }

  const result = await createUser({ email: parsed.email, hash: passwordHash });

  if (!result) {
    throw new Error(`Unable to create user: ${parsed.email}`);
  }
  const { hash, ...user } = result;
  respondWithJSON(res, 201, user);
}

export async function handlerLogin(req: Request, res: Response) {
  type params = {
    password: string;
    email: string;
  };

  const parsed: params = req.body;

  const result = await getUser(parsed.email);
  if (!result || !await checkPasswordHash(parsed.password, result.hash)) {
    throw new UserNotAuthorizedError("incorrect email or password");
  }
  const { hash, ...user } = result;
  const token = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
  const refreshToken = await makeRefreshToken(user.id);
  respondWithJSON(res, 200, { token, refreshToken, ...user });
}

export async function handlerRefresh(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  if (!refreshToken) {
    throw new UserNotAuthorizedError("Missing or invalid refresh token");
  }
  const result = await getRefreshToken(refreshToken);
  const now = new Date();
  if (!result || result.revokedAt !== null || result.expiresAt < now || !result.userId) {
    throw new UserNotAuthorizedError("Missing or invalid refresh token");
  }
  const token = makeJWT(result.userId, config.jwt.defaultDuration, config.jwt.secret);
  respondWithJSON(res, 200, { token });
}

export async function handlerRevoke(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  if (!refreshToken) {
    throw new UserNotAuthorizedError("Missing or invalid refresh token");
  }
  const result = await revokeToken(refreshToken);
  if (!result) {
    throw new UserNotAuthorizedError("Missing or invalid refresh token");
  }
  res.status(204).send();
}