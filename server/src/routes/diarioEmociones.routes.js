import express from "express";
import { DiarioEmocionesController } from "../controllers/diarioEmocionesController.js";

const router = express.Router();

router.post("/", DiarioEmocionesController.registrar);
router.get("/:id_paciente/:year/:month", DiarioEmocionesController.listarMensual);

export default router;
