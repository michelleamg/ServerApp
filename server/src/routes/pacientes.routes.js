import { Router } from "express";
import { getPacienteById, updatePaciente } from "../controllers/pacientesController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/:id", getPacienteById);
router.put("/:id", upload.single("foto"), updatePaciente);

export default router;
