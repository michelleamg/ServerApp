import fetch from "node-fetch";
import db from "../db/db.js";

/**
 * Envía una notificación push usando Expo Push Service
 * @param {string} token - Expo push token (ExponentPushToken[xxxx])
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo de la notificación
 * @param {object} data - Datos extra (se usan para navegar dentro de la app)
 */
export async function enviarNotificacionExpo(token, title, body, data = {}) {
  try {
    const mensaje = {
      to: token,
      title,
      body,
      sound: "default",
      priority: "high",
      data,   // ejemplo { screen: "AgendaScreen" }
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mensaje),
    });

    const resultado = await response.json();
    console.log("📤 Notificación enviada:", resultado);
  } catch (error) {
    console.error("❌ Error enviando notificación:", error);
  }
}

/**
 * Obtiene TODOS los tokens registrados por un paciente
 */
export async function obtenerTokensPaciente(id_paciente) {
  const [rows] = await db.query(
    "SELECT push_token FROM paciente_push_tokens WHERE id_paciente = ?",
    [id_paciente]
  );
  return rows.map((r) => r.push_token); // devuelve array: [token1, token2...]
}

/**
 * Notifica cuando una cita es aceptada
 */
export async function notificarCitaAceptada(id_paciente) {
  const tokens = await obtenerTokensPaciente(id_paciente);

  for (const token of tokens) {
    await enviarNotificacionExpo(
      token,
      "💙 Cita aceptada",
      "Tu psicólogo confirmó tu sesión.",
      { screen: "AgendaScreen" }
    );
  }
}

/**
 * Notifica cuando una cita es rechazada
 */
export async function notificarCitaRechazada(id_paciente) {
  const tokens = await obtenerTokensPaciente(id_paciente);

  for (const token of tokens) {
    await enviarNotificacionExpo(
      token,
      "❌ Cita rechazada",
      "Tu psicólogo rechazó la cita. Selecciona un nuevo horario.",
      { screen: "AgendaScreen" }
    );
  }
}

/**
 * Notifica nueva actividad asignada
 */
export async function notificarNuevaActividad(id_paciente, tituloActividad) {
  const tokens = await obtenerTokensPaciente(id_paciente);

  for (const token of tokens) {
    await enviarNotificacionExpo(
      token,
      "✨ Nueva actividad disponible",
      tituloActividad,
      { screen: "ActividadesScreen" }
    );
  }
}

/**
 * Notifica recordatorio de cita
 */
export async function notificarRecordatorioCita(id_paciente) {
  const tokens = await obtenerTokensPaciente(id_paciente);

  for (const token of tokens) {
    await enviarNotificacionExpo(
      token,
      "⏰ Recordatorio de cita",
      "Tienes una sesión próximamente.",
      { screen: "AgendaScreen" }
    );
  }
}
