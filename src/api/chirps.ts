import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";

const badWords = ["kerfuffle", "sharbert", "fornax"];
const maxChirpLength = 140;

export async function handlerValidateChirp(req: Request, res: Response) {
  type params = {
    body: string;
  };

  const parsed: params = req.body;

  if (parsed.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  respondWithJSON(res, 200, { cleanedBody: cleanText(parsed.body) });
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