import axios from "axios";

export async function enviarPush(token, title, body) {
  console.log("-------------------------------------------------");
  console.log("📱 Enviando notificación...");
  console.log("➡️ Token usado:", token);
  console.log("➡️ Título:", title);
  console.log("➡️ Cuerpo:", body);

  if (!token) {
    console.warn("⚠️ No se envió push porque token es null/undefined");
    console.log("-------------------------------------------------");
    return;
  }

  try {
    const payload = {
      to: [token], // ✔️ igual que tu código original
      title: title || "🌿 Recordatorio",
      body: body || "No olvides revisar tus actividades 💚",
      channelId: "default",
    };

    console.log("📦 Payload enviado a Expo:");
    console.log(JSON.stringify(payload, null, 2));

    // ---------------------------------------------------------
    //   👇👇👇 AQUI ESTA LA URL EXACTA QUE TÚ USAS 👇👇👇
    // ---------------------------------------------------------
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    // ---------------------------------------------------------

    console.log("📨 Respuesta de Expo:");
    console.log(JSON.stringify(response.data, null, 2));

    const data = response.data?.data?.[0];

    if (data?.status === "ok") {
      console.log("✅ Expo aceptó la notificación correctamente");
    } else {
      console.log("⚠️ Expo NO aceptó la notificación");
      if (data?.details?.error) {
        console.log("❌ Error:", data.details.error);
      }
    }

  } catch (err) {
    console.error("🔥 Error enviando push:", err.response?.data || err.message);
  }

  console.log("-------------------------------------------------");
}
