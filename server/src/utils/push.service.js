import axios from "axios";

export async function enviarPush(token, title, body) {
  if (!token) {
    console.warn("⚠️ No se envió push porque token es null/undefined");
    return;
  }

  try {
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      {
        // ✔️ Expo recomienda arreglo
        to: [token],

        // ✔️ No usar parámetros avanzados
        title: title || "🌿 Recordatorio",
        body: body || "No olvides revisar tus actividades 💚",

        // ✔️ Canal por defecto, SIEMPRE funciona
        channelId: "default",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("📨 Expo respuesta:", response.data);
  } catch (err) {
    console.error("❌ Error enviando push:", err.response?.data || err.message);
  }
}
