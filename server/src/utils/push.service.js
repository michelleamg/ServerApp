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
        title,
        body,
        priority: "high",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // 🟢 Mostrar respuesta real de Expo
    if (response.data?.data?.status === "ok") {
      console.log(`📨 Push enviado a: ${token}`);
    } else {
      console.warn("⚠️ Expo devolvió advertencia:", response.data);
    }
  } catch (err) {
    // 🟡 Mostrar error real que responde Expo
    if (err.response) {
      console.error("❌ Error de Expo:", err.response.data);
    } else {
      console.error("❌ Error enviando push:", err.message);
    }
  }
}
