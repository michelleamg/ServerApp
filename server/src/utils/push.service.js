import axios from "axios";

export async function enviarPush(expoToken, title, body) {
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoToken,
      title,
      body,
      sound: "default",
      priority: "high",
    });
  } catch (error) {
    console.error("❌ Error enviando notificación:", error);
  }
}
