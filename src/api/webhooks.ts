import { Request, Response } from "express";
import { getUserById, upgradeToRed } from "../db/queries/users.js";
import { NotFoundError, UserNotAuthorizedError } from "./errors.js";
import { getApiKey } from "./auth.js";
import { config } from "../config.js";

export async function handlerPolka(req:Request, res: Response) {
  const apiKey = getApiKey(req);
  if (apiKey != config.api.polkaKey) {
    throw new UserNotAuthorizedError("Invalid Polka Key");
  }
  type params = {
    event: string;
    data: {
      userId: string;
    };
  };

  const parsed: params = req.body;

  switch (parsed.event) {
    case "user.upgraded":
      const user = await getUserById(parsed.data.userId);
      if (!user) {
        throw new NotFoundError(`Unknown user ${parsed.data.userId}`);
      }
      const result = await upgradeToRed(user.id);
      if (!result || !result.isChirpyRed) {
        throw new Error(`Couldn't upgrade ${user.email} to red`);
      }
      res.status(204).send();
      break;
    default:
      res.status(204).send();
  }
}