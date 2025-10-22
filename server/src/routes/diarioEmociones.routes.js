import express from "express";
import { DiarioEmocionesController } from "../controllers/diarioEmocionesController.js";

const router = express.Router();

router.post("/", DiarioEmocionesController.registrar);
router.get("/:id_paciente/:year/:month", DiarioEmocionesController.listarMensual);
// Obtener la última emoción registrada del paciente
router.get("/ultima/:id_paciente", DiarioEmocionesController.obtenerUltima);

export default router;
