import { config } from "dotenv";

config();

export const PORT = process.env.PORT || 4001;
export const DB_HOST = process.env.DB_HOST || "52.188.186.87";
export const DB_USER = process.env.DB_USER || "Michelle";
export const DB_PASS = process.env.DB_PASS || "hD*F9jBw@U6dS6Ym";
export const DB_DATABASE = process.env.DB_DATABASE || "miduelo";
export const DB_PORT = process.env.DB_PORT || 3306;
