import axios from "axios";

export async function enviarPush(token, title, body) {
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: token,
      sound: "default",
      title,
      body,
    });
  } catch (err) {
    console.error("❌ Error enviando push:", err);
  }
}
