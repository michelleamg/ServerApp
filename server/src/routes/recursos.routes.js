import express from "express";
import { RecursosController } from "../controllers/recursosController.js";

const router = express.Router();

// GET /api/recursos
router.get("/recursos/:id_paciente", RecursosController.getRecursos);

export default router;
