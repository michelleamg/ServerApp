import cron from "node-cron";
import db from "../db/db.js";
import { enviarPush } from "../utils/push.service.js";

cron.schedule("* * * * *", async () => {
  const ahora = new Date();
  const hh = ahora.getHours().toString().padStart(2, "0");
  const mm = ahora.getMinutes().toString().padStart(2, "0");
  const horaActual = `${hh}:${mm}`;

  try {
    const [rows] = await db.query(
      `SELECT r.id_paciente, r.hora, t.push_token
       FROM paciente_recordatorios r
       JOIN paciente_push_tokens t ON r.id_paciente = t.id_paciente
       WHERE r.hora = ?`,
      [horaActual]
    );

    for (let row of rows) {
      await enviarPush(
        row.push_token,
        "Recordatorio diario",
        "🌿 No olvides realizar tus actividades del día 💚"
      );
    }

    if (rows.length > 0) {
      console.log(`🔔 ${rows.length} recordatorios enviados a las ${horaActual}`);
    }
  } catch (error) {
    console.error("❌ Error ejecutando CRON:", error);
  }
});
