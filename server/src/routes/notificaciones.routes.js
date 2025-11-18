import { Router } from "express";
import db from "../db/db.js";
import { 
  notificarCitaAceptada, 
  notificarCitaRechazada,
  obtenerTokensPaciente 
} from "../utils/notificaciones.service.js";

const router = Router();

router.post("/register-token", async (req, res) => {
  const { id_paciente, push_token } = req.body;

  if (!id_paciente || !push_token) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    await db.query(
      "INSERT INTO paciente_push_tokens (id_paciente, push_token) VALUES (?, ?)",
      [id_paciente, push_token]
    );

    return res.json({ success: true, message: "Token registrado" });
  } catch (err) {
    console.error("❌ Error guardando token:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 📌 NOTIFICACIÓN: CITA ACEPTADA
router.post("/cita-aceptada", async (req, res) => {
  try {
    const { id_paciente } = req.body;

    if (!id_paciente) {
      return res.status(400).json({ message: "id_paciente requerido" });
    }

    await notificarCitaAceptada(id_paciente);

    return res.status(200).json({ success: true, message: "Notificación enviada: cita aceptada" });

  } catch (error) {
    console.error("❌ Error en cita-aceptada:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 📌 NOTIFICACIÓN: CITA RECHAZADA
router.post("/cita-rechazada", async (req, res) => {
  try {
    const { id_paciente } = req.body;

    if (!id_paciente) {
      return res.status(400).json({ message: "id_paciente requerido" });
    }

    await notificarCitaRechazada(id_paciente);

    return res.status(200).json({ success: true, message: "Notificación enviada: cita rechazada" });

  } catch (error) {
    console.error("❌ Error en cita-rechazada:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
