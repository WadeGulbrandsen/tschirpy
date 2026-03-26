import { Request, Response } from "express";
import { apiConfig } from "./config.js";

export async function handlerReadiness(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

export async function handlerMetrics(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(`Hits: ${apiConfig.fileserverHits}`);
}

export async function handlerReset(req: Request, res: Response) {
  apiConfig.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send();
}