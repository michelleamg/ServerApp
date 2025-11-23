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

        // Título y cuerpo personalizados
        title: "🌿 Recordatorio diario",
        subtitle: "Tu bienestar es importante",
        body: "No olvides realizar tus actividades del día 💚",

        // 👇👇 **AQUÍ VA TU LOGO A COLOR**
        // Imagen grande para la notificación
        image:
          "https://api-mobile.midueloapp.com/images/duelingo.png",

        // Pequeño ícono en color — NOTE: Android NO permite íconos pequeños a color,
        // pero sí permite bigPicture con color.
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
