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
        // 🔥 Siempre enviar como arreglo aunque sea 1 token
        to: [token],

        sound: "default",
        priority: "high",

        // Canal por defecto (ya existe en Android)
        channelId: "default",

        // Mensaje sencillo
        title: title || "🌿 Recordatorio",
        body: body || "No olvides revisar tus actividades 💚",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.data?.status === "ok") {
      console.log(`📨 Push enviado a: ${token}`);
    } else {
      console.warn("⚠️ Expo devolvió advertencia:", response.data);
    }
  } catch (err) {
    if (err.response) {
      console.error("❌ Error de Expo:", err.response.data);
    } else {
      console.error("❌ Error enviando push:", err.message);
    }
  }
}
