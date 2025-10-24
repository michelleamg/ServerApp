import { Router } from "express";
import { getPacienteById, updatePaciente, updateFotoPerfil } from "../controllers/pacientesController.js";
import {upload} from "../middlewares/upload.js"

const router = Router();

router.get("/:id", getPacienteById);
router.put("/:id", updatePaciente);
router.put("/:id/foto", upload.single("foto"), updateFotoPerfil);


export default router;
