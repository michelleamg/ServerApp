import { Router } from "express";
import {ChatController} from "../controllers/ChatController.js";

const router = Router();

// 🔹 Obtener mensajes de un chat
router.get("/mensajes/:id_chat",ChatController.getMensajes);

// 🔹 Enviar mensaje (POST)
router.post("/enviar", ChatController.enviarMensaje);

// 🔹 Obtener el psicólogo asignado a un paciente
router.get("/psicologo/:id_paciente", ChatController.getPsychologistByPatient);
router.get('/obtener-chat/:id_paciente', ChatController.obtenerChatPorPaciente);
export default router;
