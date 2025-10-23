// routes/agenda.routes.js
import express from "express";
import { AgendaController } from "../controllers/agendaController.js";

const router = express.Router();

router.get("/:id_psicologo", AgendaController.getSemanas);
router.get("/citas/:id_agenda", AgendaController.getCitasSemana);
router.post("/citas/solicitar", AgendaController.solicitarCita);

export default router;
