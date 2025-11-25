import cron from "node-cron";
import db from "../db/db.js";
import { enviarPush } from "../utils/push.service.js";

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const horaActual = now.toLocaleTimeString("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  console.log(`⏱️ CRON ejecutado (hora MX): ${horaActual}`);

  try {
    // CONSULTA MEJORADA - Maneja diferentes formatos de hora
    const [rows] = await db.query(
      `SELECT 
          r.id_paciente, 
          r.hora,
          t.push_token
       FROM paciente_recordatorios r
       INNER JOIN paciente_push_tokens t ON r.id_paciente = t.id_paciente
       WHERE 
         TIME_FORMAT(r.hora, '%H:%i') = ?`,
      [horaActual]
    );

    console.log(`🔍 Encontrados ${rows.length} recordatorios para las ${horaActual}`);

    if (rows.length === 0) {
      console.log(`🔔 No hay notificaciones para enviar a las ${horaActual}`);
      
      // TEST: Enviar notificación cada 15 minutos para verificar
      if (horaActual.endsWith(':00') || horaActual.endsWith(':15') || 
          horaActual.endsWith(':30') || horaActual.endsWith(':45')) {
        const [tokens] = await db.query(
          "SELECT push_token FROM paciente_push_tokens WHERE push_token IS NOT NULL LIMIT 1"
        );
        
        if (tokens.length > 0) {
          console.log(`🧪 Enviando notificación de diagnóstico a las ${horaActual}`);
          await enviarPush(
            tokens[0].push_token,
            "🔔 Diagnóstico CRON",
            `CRON funcionando - Hora: ${horaActual}`
          );
        }
      }
      return;
    }

    // Enviar notificaciones reales
    for (let row of rows) {
      console.log(`📤 Enviando recordatorio a paciente ${row.id_paciente}`);
      await enviarPush(
        row.push_token,
        "🌿 Recordatorio diario", 
        "No olvides realizar tus actividades del día 💚"
      );
    }

    console.log(`✅ ${rows.length} notificaciones enviadas a las ${horaActual}`);

  } catch (err) {
    console.error("❌ Error en CRON:", err);
  }
});