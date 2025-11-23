import { Router } from "express";
import db from "../db/db.js";
import { enviarPush } from "../services/push.service.js";
import "../controllers/notificaciones.cron.js";

const router = Router();

/* ---------------------------------------------
   1. Registrar token push del paciente
----------------------------------------------*/
router.post("/register-token", async (req, res) => {
  const { id_paciente, push_token } = req.body;

  if (!id_paciente || !push_token) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    await db.query(
      `INSERT INTO paciente_push_tokens (id_paciente, push_token)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE push_token = VALUES(push_token)`,
      [id_paciente, push_token]
    );

    return res.json({ success: true, message: "Token registrado correctamente" });
  } catch (err) {
    console.error("❌ Error guardando token:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ---------------------------------------------
   2. Configurar recordatorio diario
----------------------------------------------*/
router.post("/configurar", async (req, res) => {
  const { id_paciente, hora } = req.body;

  if (!id_paciente || !hora) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    await db.query(
      `INSERT INTO paciente_recordatorios (id_paciente, hora)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE hora = VALUES(hora)`,
      [id_paciente, hora]
    );

    return res.json({ success: true, message: "Recordatorio guardado" });
  } catch (err) {
    console.error("❌ Error guardando recordatorio:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ---------------------------------------------
   3. Obtener hora del recordatorio
----------------------------------------------*/
router.get("/recordatorio/:id_paciente", async (req, res) => {
  const { id_paciente } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT hora FROM paciente_recordatorios WHERE id_paciente = ?`,
      [id_paciente]
    );

    if (!rows || rows.length === 0) {
      return res.json({ hora: null });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error obteniendo recordatorio:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ---------------------------------------------
   4. Endpoint opcional para probar notificación
----------------------------------------------*/
router.post("/test", async (req, res) => {
  try {
    const { token } = req.body;

    await enviarPush(token, "Mensaje de prueba", "Esto es una notificación de test ✔");

    return res.json({ success: true, message: "Notificación enviada" });
  } catch (error) {
    return res.status(500).json({ error: "No se pudo enviar la notificación" });
  }
});

export default router;
