import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { createChirp, getChirp, getChirps } from "../db/queries/chirps.js";
import { NewChirp } from "../db/schema.js";

const badWords = ["kerfuffle", "sharbert", "fornax"];
const maxChirpLength = 140;

export async function handlerChirp(req: Request, res: Response) {
  const chirpId = req.params.chirpId;
  if (!chirpId || Array.isArray(chirpId)) {
    throw new BadRequestError(`Invalid chirpId: ${chirpId}`);
  }
  const chirp = await getChirp(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp not found: chirpId=${chirpId}`);
  }
  respondWithJSON(res, 200, chirp);
}

export async function handlerChirps(req: Request, res: Response) {
  const results = await getChirps();
  respondWithJSON(res, 200, results);
}

export async function handlerNewChirp(req: Request, res: Response) {
  type params = {
    body: string;
    userId: string;
  };

  const parsed: params = req.body;

  if (parsed.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const chirp: NewChirp = { body: cleanText(parsed.body), userId: parsed.userId };

  const result = await createChirp(chirp);

  if (!result) {
    throw new Error(`Unable to create chirp: ${parsed.body}`);
  }

  respondWithJSON(res, 201, result);
}

function cleanText(text: string) {
  const badWords = ["kerfuffle", "sharbert", "fornax"];
  const words = text.split(" ");
  const cleanedText = words.map((word) => {
    return isBadWord(word) ? "****" : word;
  });

  return cleanedText.join(" ");
}

function isBadWord(word: string) {
  const wordLower = word.toLowerCase();
  for (const badWord of badWords) {
    if (wordLower.includes(badWord)) {
      return true;
    }
  }
  return false;
}