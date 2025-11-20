import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 📁 Reutilizamos mismo storage pero en otra carpeta
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve("uploads/actividades");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 🔹 Subir foto de actividad
router.post("/actividad-foto", upload.single("archivo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No se recibió archivo",
      });
    }

    const filename = req.file.filename;
    const url = `/uploads/actividades/${filename}`;

    res.json({
      success: true,
      filename,
      url,
    });
  } catch (error) {
    console.error("❌ Error al subir evidencia de actividad:", error);
    res.status(500).json({
      success: false,
      error: "Error al subir archivo",
    });
  }
});

export default router;
