import { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
  api: APIConfig;
  db: DBConfig;
  jwt: JWTConfig;
}

type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: string;
  refreshTokenExpiryDays: number;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
}

type JWTConfig = {
  defaultDuration: number;
  secret: string;
  issuer: string;
}

process.loadEnvFile(".env");

export const config: Config = {
  api: {
    fileserverHits: 0,
    port: Number(envOrThrow("PORT")),
    platform: envOrThrow("PLATFORM"),
    refreshTokenExpiryDays: 60,
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: { migrationsFolder: "./src/db/migrations" },
  },
  jwt: {
    defaultDuration: 3600, // 1 hour in seconds
    secret: envOrThrow("JWT_SECRET"),
    issuer: "chirpy",
  }
};

function envOrThrow(key: string) {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Enviroinment variables missing key: ${key}`);
  }
  return val;
}