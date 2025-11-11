import { Router } from "express";
import { ForoController } from "../controllers/foroController.js";

const router = Router();

// 🔹 Obtener todos los foros visibles para pacientes
router.get("/pacientes", ForoController.getForosParaPacientes);
router.get("/", ForoController.getForos);
router.get("/:id_foro", ForoController.getForoDetalle); // ✅ nuevo endpoint para foro detalle
router.get("/:id_foro/temas", ForoController.getTemas);
router.post("/:id_foro/unirse", ForoController.unirseForo);
// ✅ Mensajes de un tema
router.get("/temas/:id_tema/mensajes", ForoMensajeController.getMensajes);
router.post("/temas/:id_tema/mensajes", ForoMensajeController.crearMensaje);
export default router;
