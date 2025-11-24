// controllers/notificaciones.cron.js
import cron from "node-cron";
import db from "../db/db.js";
import { enviarPush } from "../utils/push.service.js";

cron.schedule("* * * * *", async () => {
  const horaActual = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date()); // Ej: "00:16"

  console.log("⏱️ CRON revisando recordatorios (hora MX):", horaActual);

  try {
    const [rows] = await db.query(
      `SELECT 
          r.id_paciente, 
          r.hora, 
          t.push_token
       FROM paciente_recordatorios r
       JOIN paciente_push_tokens t ON r.id_paciente = t.id_paciente
       WHERE DATE_FORMAT(r.hora, '%H:%i') = ?`,
      [horaActual]
    );

    for (let row of rows) {
      await enviarPush(
        row.push_token,
        "🌿 Recordatorio diario",
        "No olvides realizar tus actividades del día 💚"
      );
    }

    if (rows.length > 0) {
      console.log(`🔔 Notificaciones enviadas: ${rows.length} a las ${horaActual}`);
    }
  } catch (err) {
    console.error("❌ Error ejecutando CRON:", err);
  }
});
