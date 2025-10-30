import { Router } from "express";
import { getPacienteById, updatePaciente } from "../controllers/pacientes.controller.js";

const router = Router();

router.get("/:id", getPacienteById);
router.put("/:id", updatePaciente);

export default router;
