import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Cargar el .env que está en ~/ServerApp/.env
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("SMTP_HOST:", process.env.SMTP_HOST);
