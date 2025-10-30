import { Router } from "express";
import { getPacienteById, updatePaciente } from "../controllers/pacientesController.js";

const router = Router();

router.get("/:id", getPacienteById);
router.put("/:id", updatePaciente);

export default router;
