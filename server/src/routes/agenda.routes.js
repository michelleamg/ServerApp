// routes/agenda.routes.js
import express from "express";
import { AgendaController } from "../controllers/agendaController.js";

const router = express.Router();

// ✅ primero esta
router.get("/paciente/:id_paciente", AgendaController.getSemanasPorPaciente);

// luego las demás
router.get("/citas/:id_agenda", AgendaController.getCitasSemana);
router.post("/citas/solicitar", AgendaController.solicitarCita);
router.get("/:id_psicologo", AgendaController.getSemanas);

export default router;
