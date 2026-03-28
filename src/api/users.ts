import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export async function handlerNewUser(req: Request, res: Response) {
  const user: NewUser = req.body;

  if (!user.email || !user.email.includes("@")) {
    throw new BadRequestError("Invalid email");
  }

  const result = await createUser(user);

  if (!result) {
    throw new Error(`Unable to create user: ${user.email}`);
  }
  respondWithJSON(res, 201, result);
}