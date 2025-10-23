// routes/agenda.routes.js
import express from "express";
import { AgendaController } from "../controllers/agendaController.js";

const router = express.Router();

// 🆕 Esta debe ir primero para que no sea “tapada” por :id_psicologo
router.get("/paciente/:id_paciente", AgendaController.getSemanasPorPaciente);

// Luego las rutas generales
router.get("/:id_psicologo", AgendaController.getSemanas);
router.get("/citas/:id_agenda", AgendaController.getCitasSemana);
router.post("/citas/solicitar", AgendaController.solicitarCita);

export default router;
