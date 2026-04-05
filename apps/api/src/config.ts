import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  corsOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  sessionTimeoutMinutes: 5,
  cookieName: "ocrs_session",
  nodeEnv: process.env.NODE_ENV ?? "development"
};
