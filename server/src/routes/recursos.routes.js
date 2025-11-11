import express from "express";
import { RecursosController } from "../controllers/recursosController.js";

const router = express.Router();

// GET /api/recursos
router.get("/recursos", RecursosController.getRecursos);

export default router;
