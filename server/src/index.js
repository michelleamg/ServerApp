import dotenv from "dotenv";
dotenv.config();

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
