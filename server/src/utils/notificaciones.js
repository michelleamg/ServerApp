//HELPER NOTIFICACIONES
import fetch from "node-fetch";

export async function enviarNotificacion({ token, titulo, cuerpo, data }) {
  console.log("-------------------------------------------------");
  console.log("📱 Enviando notificación");
  console.log("➡️ Token usado:", token);
  console.log("➡️ Título:", titulo);
  console.log("➡️ Cuerpo:", cuerpo);

  try {
    const mensaje = {
      to: token,
      sound: "default",
      title: titulo,
      body: cuerpo,
      data: data || {},
    };

    const respuesta = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mensaje),
    });

    const json = await respuesta.json();

    console.log("📨 Respuesta de Expo:", JSON.stringify(json, null, 2));

    // ❗ Revisión de errores comunes
    if (json.data && json.data.status === "ok") {
      console.log("✅ Expo aceptó la notificación correctamente");
    } else {
      console.log("❌ Expo NO aceptó la notificación");
    }

    if (json.data?.details?.error) {
      console.log("⚠️ Error específico:", json.data.details.error);
    }

    console.log("-------------------------------------------------");
    return json;

  } catch (error) {
    console.log("🔥 Error enviando notificación:", error);
    console.log("-------------------------------------------------");
    return { error };
  }
}
