import { describe, it, expect, beforeAll } from "vitest";
import { checkPasswordHash, extractBearerToken, hashPassword, makeJWT, validateJWT } from "./auth.js";
import { BadRequestError, UserNotAuthorizedError } from "./errors.js";

describe("Generating JWTs", () => {
  const userId = "user-id-0000-0001";
  const secret = "theSecret";
  let jwt1: string;
  let jwt2: string;

  beforeAll(async () => {
    jwt1 = makeJWT(userId, 3600, secret);
    jwt2 = makeJWT(userId, 1, secret);
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it("should return the userId for the correct secret", async () => {
    const result = validateJWT(jwt1, secret);
    expect(result).toBe(userId);
  });

  it("should throw an error for the incorrect secret", async () => {
    expect(() => validateJWT(jwt1, "notTheSecret")).toThrow(UserNotAuthorizedError);
  });

  it("should throw an error for and expired token", async () => {
    expect(() => validateJWT(jwt2, secret)).toThrow(UserNotAuthorizedError);
  });
});

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for the incorrect password", async () => {
    const result = await checkPasswordHash("wrongPassword789!", hash2);
    expect(result).toBe(false);
  });
});

describe("extractBearerToken", () => {
  it("should extract the token from a valid header", () => {
    const token = "mySecretToken";
    const header = `Bearer ${token}`;
    expect(extractBearerToken(header)).toBe(token);
  });

  it("should extract the token even if there are extra parts", () => {
    const token = "mySecretToken";
    const header = `Bearer ${token} extra-data`;
    expect(extractBearerToken(header)).toBe(token);
  });

  it("should throw a BadRequestError if the header does not contain at least two parts", () => {
    const header = "Bearer";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it('should throw a BadRequestError if the header does not start with "Bearer"', () => {
    const header = "Basic mySecretToken";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it("should throw a BadRequestError if the header is an empty string", () => {
    const header = "";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });
});