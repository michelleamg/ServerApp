import { Router } from "express";
import { enviarNotificacionExpo } from "../utils/notificaciones.service.js";

const router = Router();

router.post("/test", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Falta token" });
  }

  await enviarNotificacionExpo(
    token,
    "🚀 Notificación de prueba",
    "¡Hola Ame! Esto es una prueba real.",
    { screen: "HomeDashboard" }
  );

  return res.json({ success: true });
});

export default router;
