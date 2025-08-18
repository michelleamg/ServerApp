import { createPool } from "mysql2/promise";
import { config } from "./config.js";

export const pool = createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASS,
  port: config.DB_PORT,
  database: config.DB_DATABASE,
});

export default pool;