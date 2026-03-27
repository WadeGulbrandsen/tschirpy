import { NextFunction, Request, Response } from "express";
import { apiConfig } from "../config.js";
import { respondWithError } from "./json.js";
import { HTTPError } from "./errors.js";

export function middlewareLogResponse(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    if (res.statusCode !== 200) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    }
  });
  next();
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
  apiConfig.fileserverHits++;
  next();
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof HTTPError) {
    respondWithError(res, err.code, err.message);
  } else {
    console.error(err);
    respondWithError(res, 500, "Something went wrong on our end");
  }
}