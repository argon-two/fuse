import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  SOCKET_PORT: z.coerce.number().int().positive().optional(),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  FILE_STORAGE_PATH: z.string().default("./uploads"),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(100),
  APP_ORIGIN: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed. Check your .env file.");
}

const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  socketPort: env.SOCKET_PORT ?? env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
  accessTokenTtlMinutes: env.ACCESS_TOKEN_TTL_MINUTES,
  fileStoragePath: env.FILE_STORAGE_PATH,
  maxUploadBytes: env.MAX_UPLOAD_MB * 1024 * 1024,
  appOrigin: env.APP_ORIGIN,
};

export type AppConfig = typeof config;
