import { Router } from "express";
import { ForoController } from "../controllers/foroController.js";

const router = Router();

// 🔹 Obtener todos los foros visibles para pacientes
router.get("/pacientes", ForoController.getForosParaPacientes);
router.get("/", ForoController.getForos);
router.get("/:id_foro/temas", ForoController.getTemas);

export default router;
