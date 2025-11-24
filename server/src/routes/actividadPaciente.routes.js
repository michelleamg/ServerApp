import express from "express";
import { 
  registrarActividadPaciente,
  getActividadesPaciente 
} from "../controllers/actividadPacienteController.js";

const router = express.Router();


router.post("/", registrarActividadPaciente);


router.get("/:id_paciente", getActividadesPaciente);


export default router;
