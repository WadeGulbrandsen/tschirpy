import { Request, Response } from "express";
import { config } from "../config.js";
import { UserForbiddenError } from "./errors.js";
import { deleteUsers } from "../db/queries/users.js";

export async function handlerReset(req: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new UserForbiddenError("PLATFORM is not 'dev'");
  }
  await deleteUsers();
  config.api.fileserverHits = 0;
  // res.set("Content-Type", "text/plain; charset=utf-8");
  res.send();
}