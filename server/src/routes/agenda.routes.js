// routes/agenda.routes.js
import express from "express";
import { AgendaController } from "../controllers/agendaController.js";

const router = express.Router();

router.get("/:id_psicologo", AgendaController.getSemanas);
router.get("/citas/:id_agenda", AgendaController.getCitasSemana);
router.post("/citas/solicitar", AgendaController.solicitarCita);

// 🆕 Nueva ruta: obtener semanas del psicólogo vinculado al paciente
router.get("/paciente/:id_paciente", AgendaController.getSemanasPorPaciente);

export default router;
