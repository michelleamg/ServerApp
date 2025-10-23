// src/routes/agenda.routes.js
import express from "express";
import { AgendaController } from "../controllers/agendaController.js";

const router = express.Router();

// 🔹 Nueva ruta para agenda del paciente
router.get("/paciente/:id_paciente", AgendaController.getSemanasPorPaciente);

// Rutas que ya tenías
router.get("/semanas/:id_psicologo", AgendaController.getSemanas);
router.get("/citas/:id_agenda", AgendaController.getCitasSemana);
router.post("/solicitar", AgendaController.solicitarCita);

export default router;
