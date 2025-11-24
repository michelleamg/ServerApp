import express from "express";
import multer from "multer";
import path from "path";
import { registrarActividadPacienteFoto } from "../controllers/actividadPacienteController.js";

const router = express.Router();

// 📂 Carpeta donde se guardarán las fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/evidencias");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `evidencia_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

// ⭐ NUEVO ENDPOINT
router.post("/foto", upload.single("archivo"), registrarActividadPacienteFoto);

export default router;
