import express from "express";
import {
  getActividadesPaciente,
  postActividadPaciente,
} from "../controllers/actividadPacienteController.js";

const router = express.Router();

// 📥 Registrar / actualizar progreso
router.post("/actividad-paciente", postActividadPaciente);

// 📤 Obtener actividades con su estado
router.get("/actividad-paciente/:id_paciente", getActividadesPaciente);

export default router;
