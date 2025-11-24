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

// Cambia esta ruta para usar el controlador correcto
router.post("/", upload.single("archivo"), async (req, res) => {
  try {
    const { id_paciente, id_actividad, estado } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No se recibió ninguna imagen" });
    }

    // CORREGIR: La ruta debe coincidir con el destino de multer
    const rutaFoto = "/uploads/evidencias/" + req.file.filename;

    const result = await ActividadPaciente.registrar({
      id_paciente,
      id_actividad,
      estado,
      evidencia_foto: rutaFoto,
      duracion_segundos: null,
      evidencia_texto: null
    });

    return res.status(201).json({ 
      success: true,  // Agregar esto
      message: "Foto guardada", 
      id_actividad_paciente: result.id  // Agregar esto
    });
  } catch (err) {
    console.error("❌ Error guardando evidencia:", err);
    return res.status(500).json({ 
      success: false,  // Agregar esto
      error: err.message 
    });
  }
});

export default router;