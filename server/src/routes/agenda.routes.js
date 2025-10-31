// routes/agenda.routes.js
import express from "express";
import { AgendaController } from "../controllers/agendaController.js";

const router = express.Router();

/* ===========================
   📅 RUTAS DE AGENDA PACIENTE
   =========================== */

// Obtener semanas y citas del psicólogo vinculado al paciente
// 👉 GET /api/agenda/paciente/:id_paciente
router.get("/paciente/:id_paciente", AgendaController.getSemanasPorPaciente);

// Solicitar nueva cita
// 👉 POST /api/agenda/solicitar
router.post("/solicitar", AgendaController.solicitarCita);

/* ===========================
   📅 RUTAS DE AGENDA PSICÓLOGO
   =========================== */

// Obtener citas dentro de una semana específica
// 👉 GET /api/agenda/citas/:id_agenda
router.get("/citas/:id_agenda", AgendaController.getCitasSemana);

// Obtener todas las semanas del psicólogo
// 👉 GET /api/agenda/:id_psicologo
router.get("/:id_psicologo", AgendaController.getSemanas);

export default router;
