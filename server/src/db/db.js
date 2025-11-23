import { createPool } from "mysql2/promise";
import { DB_DATABASE, DB_HOST, DB_PASS, DB_PORT, DB_USER } from "./config.js";

export const pool = createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  port: DB_PORT,
  database: DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000, // 60 segundos
  timeout: 60000, // 60 segundos
  reconnect: true
});

export default pool;