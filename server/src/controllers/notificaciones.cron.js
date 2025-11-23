// controllers/notificaciones.cron.js
import cron from "node-cron";
import db from "../db/db.js";
import { enviarPush } from "../utils/push.service.js";

/**
 * 🕒 CRON: corre cada minuto
 * Convierte la hora del sistema (UTC) a hora de México.
 */
cron.schedule("* * * * *", async () => {
  // 🕒 Obtener hora actual en México
  const now = new Date();

  const horaActual = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(now);

  console.log("⏱️ CRON revisando recordatorios (hora MX):", horaActual);

  try {
    const [rows] = await db.query(
      `SELECT r.id_paciente, r.hora, t.push_token
       FROM paciente_recordatorios r
       JOIN paciente_push_tokens t ON r.id_paciente = t.id_paciente
       WHERE r.hora LIKE CONCAT(?, '%')`,
      [horaActual]
    );

    // Enviar notificación a cada paciente encontrado
    for (let row of rows) {
      await enviarPush(
        row.push_token,
        "Recordatorio diario",
        "🌿 No olvides realizar tus actividades del día 💚"
      );
    }

    if (rows.length > 0) {
      console.log(`🔔 Notificaciones enviadas: ${rows.length} a las ${horaActual}`);
    }
  } catch (err) {
    console.error("❌ Error ejecutando CRON:", err);
  }
});
