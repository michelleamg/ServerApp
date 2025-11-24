import express from "express";
import multer from "multer";
import path from "path";
import { ActividadPaciente } from "../models/actividadPacienteModel.js";

const router = express.Router();

// Ruta para guardar las fotos en /uploads/evidencias
const storage = multer.diskStorage({
  destination: "uploads/evidencias",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post("/", upload.single("archivo"), async (req, res) => {
  try {
    const { id_paciente, id_actividad, estado } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No se recibió ninguna imagen" });
    }

    const rutaFoto = "/uploads/Actividades/" + req.file.filename;

    const result = await ActividadPaciente.registrar({
      id_paciente,
      id_actividad,
      estado,
      evidencia_foto: rutaFoto,
      duracion_segundos: null,
      evidencia_texto: null
    });

    return res.status(201).json({ message: "Foto guardada", result });
  } catch (err) {
    console.error("❌ Error guardando evidencia:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
