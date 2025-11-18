import { Router } from "express";
import db from "../db/db.js";

const router = Router();

router.post("/register-token", async (req, res) => {
  const { id_paciente, push_token } = req.body;

  if (!id_paciente || !push_token) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    await db.query(
      "INSERT INTO paciente_push_tokens (id_paciente, push_token) VALUES (?, ?)",
      [id_paciente, push_token]
    );

    return res.json({ success: true, message: "Token registrado" });
  } catch (err) {
    console.error("❌ Error guardando token:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
