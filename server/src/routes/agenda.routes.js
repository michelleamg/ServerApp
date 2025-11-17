import express from "express";
import { AgendaController } from "../controllers/agendaController.js";

const router = express.Router();

/* ===========================
   📅 RUTAS DE AGENDA PACIENTE
   =========================== */

// ⚠️ IMPORTANTE: Esta ruta DEBE ir PRIMERO
router.get("/horarios-disponibles", AgendaController.getHorariosDisponibles);

// Obtener semanas y citas del psicólogo vinculado al paciente
router.get("/paciente/:id_paciente", AgendaController.getSemanasPorPaciente);

// Solicitar nueva cita
router.post("/solicitar", AgendaController.solicitarCita);

/* ===========================
   📅 RUTAS DE AGENDA PSICÓLOGO
   =========================== */

// Obtener citas dentro de una semana específica
router.get("/citas/:id_agenda", AgendaController.getCitasSemana);

// Obtener todas las semanas del psicólogo
router.get("/:id_psicologo", AgendaController.getSemanas);

export default router;