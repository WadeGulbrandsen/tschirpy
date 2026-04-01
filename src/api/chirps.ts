import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UserForbiddenError, UserNotAuthorizedError } from "./errors.js";
import { createChirp, deleteChirp, getChirp, getChirps, getChirpsByAuthor } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";

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

export async function handlerDeleteChirp(req:Request, res: Response) {
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);
  const chirpId = req.params.chirpId;
  if (!chirpId || Array.isArray(chirpId)) {
    throw new BadRequestError(`Invalid chirpId: ${chirpId}`);
  }
  const chirp = await getChirp(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp not found: chirpId=${chirpId}`);
  }
  if (chirp.userId !== userId) {
    throw new UserForbiddenError("Permission denied");
  }
  const result = await deleteChirp(chirpId);
  res.status(204).send();
}

export async function handlerChirps(req: Request, res: Response) {
  const authorId = req.query.authorId;
  const reverse = req.query.sort === "desc";
  const results = typeof authorId === "string"
    ? await getChirpsByAuthor(authorId, reverse)
    : await getChirps(reverse);
  respondWithJSON(res, 200, results);
}

export async function handlerNewChirp(req: Request, res: Response) {
  type params = {
    body: string;
  };

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const parsed: params = req.body;

  const result = await createChirp({ body: cleanText(parsed.body), userId });

  if (!result) {
    throw new Error(`Unable to create chirp: ${parsed.body}`);
  }

  respondWithJSON(res, 201, result);
}

function cleanText(text: string) {
  if (text.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }
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