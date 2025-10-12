import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar el .env que está en ~/ServerApp/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import app from "./app.js";
import { PORT } from "./db/config.js";

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

// Middleware global para errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).send(err.stack);
});
