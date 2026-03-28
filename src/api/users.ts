import { Request, Response } from "express";
import { createUser, getUser } from "../db/queries/users.js";
import { NewUser, UserResponse } from "../db/schema.js";
import { BadRequestError, UserNotAuthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { checkPasswordHash, hashPassword } from "./auth.js";

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
  respondWithJSON(res, 200, user);
}