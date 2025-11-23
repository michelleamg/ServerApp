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
        to: token,
        sound: "default",
        priority: "high",

        // 🟩 TÍTULO Y CUERPO
        title: title, // ej: "Recordatorio diario"
        subtitle: "MiDuelo — Tu espacio para sanar 💚", // 🟩 AÑADIDO
        body: body,

        // 🟦 IMAGEN GRANDE A COLOR (Big Picture)
        channelId: "default",
        androidStyle: "bigpicture",
        androidPicture: "https://api-mobile.midueloapp.com/uploads/colibri.png",
        androidLargeIcon: "https://api-mobile.midueloapp.com/uploads/colibri.png",

        // ocultar el ícono pequeño blanco
        androidSmallIcon: null,
      },
      {
        headers: { "Content-Type": "application/json" },
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
