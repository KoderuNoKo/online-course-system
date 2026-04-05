import { createHash, randomBytes } from "crypto";

export const createSalt = () => randomBytes(16).toString("hex");
export const hashPassword = (password: string, salt: string) =>
  createHash("sha256").update(`${salt}:${password}`).digest("hex");
export const createSessionToken = () => randomBytes(32).toString("hex");
