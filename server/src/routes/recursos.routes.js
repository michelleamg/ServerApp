import express from "express";
import { RecursosController } from "../controllers/recursosController.js";

const router = express.Router();

// ✅ Ahora con parámetro id_paciente
router.get("/recursos/:id_paciente", RecursosController.getRecursos);

export default router;
