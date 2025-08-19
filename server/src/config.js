import { config } from "dotenv";

config();

export const PORT = process.env.PORT || 3000;

export const DB_HOST = process.env.DB_HOST || "20.84.60.252";
export const DB_USER = process.env.DB_USER || "dev_user";
export const DB_PASS = process.env.DB_PASS || "P4ssw0rd-S3gur0!";
export const DB_DATABASE = process.env.DB_DATABASE || "TTAPOYOALDUELO";
export const DB_PORT = process.env.DB_PORT || 3306;