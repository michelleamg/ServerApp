import { Router } from "express";
import db from "../db/db.js";
import { enviarPush } from "../utils/push.service.js";

// 🟢 Importar el CRON desde controllers (tu nueva ubicación)
import "../controllers/notificaciones.cron.js";

const router = Router();

// 🟢 Registrar o actualizar token manualmente
router.post("/push/update-token", async (req, res) => {
  const { id_paciente, token } = req.body;

  if (!id_paciente || !token) {
    return res.status(400).json({ error: "Falta id_paciente o token" });
  }

  try {
    await db.query(
      `REPLACE INTO paciente_push_tokens (id_paciente, push_token, fecha_registro)
       VALUES (?, ?, NOW())`,
      [id_paciente, token]
    );

    res.json({
      ok: true,
      message: "Token actualizado exitosamente",
      id_paciente,
      token
    });
  } catch (err) {
    console.error("❌ Error actualizando token:", err);
    res.status(500).json({ error: "Error al actualizar token" });
  }
});
// 🧪 Endpoint para probar un token manualmente
router.post("/push/test", async (req, res) => {
  try {
    const { token, title, body } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token es requerido" });
    }

    console.log("🔍 Probando envío de push manual:");
    console.log("➡️ Token recibido:", token);

    const resultado = await enviarPush(
      token,
      title || "🔔 Test de Push",
      body || "Este es un mensaje de prueba enviado desde el backend"
    );

    return res.json({
      ok: true,
      tokenEnviado: token,
      resultado,
    });
  } catch (err) {
    console.error("❌ Error en /push/test:", err);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});
/* ---------------------------------------------
   1. Registrar token
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
   2. Guardar recordatorio
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
   3. Obtener recordatorio
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

export default router;
