import { Router } from "express";
import { ChatController } from "../controllers/ChatController.js";
import { AuthController } from "../controllers/AuthController.js";

const router = Router();

router.get("/chat/:id_chat", AuthController.verifyToken, ChatController.getMensajes);
router.post("/chat/enviar", AuthController.verifyToken, ChatController.enviarMensaje);

export default router;
