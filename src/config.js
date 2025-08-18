import { config } from "dotenv";
config();

export const PORT = Number(process.env.PORT) || 3000;

// Usa los nombres tal cual están en tu .env
export const DB_HOST = process.env.DB_HOST || "20.84.60.252";
export const DB_USER = process.env.DB_USER || "dev_user";
export const DB_PASS = process.env.DB_PASSWORD || "P4ssw0rd-S3gur0!";        // <- importante
export const DB_DATABASE = process.env.DB_NAME || "TTAPOYOALDUELO"; // <- importante
export const DB_PORT = Number(process.env.DB_PORT) || 3306;

// (opcional) otras envs que ya tienes
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
export const JWT_SECRET = process.env.JWT_SECRET || "rHyVbUyzNK5K39r4%2m84j";
