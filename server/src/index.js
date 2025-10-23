// src/index.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PORT } from "./db/config.js";
import app from "./app.js";

// 🧭 Definir __dirname correctamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Cargar el .env que está en ~/ServerApp/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 🚀 Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
