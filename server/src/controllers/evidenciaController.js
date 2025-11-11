import pool from "../db/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve("uploads/evidencias");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

export const EvidenciaController = {
  // 🔹 Subir evidencia
  async uploadEvidencia(req, res) {
    try {
      const { id_asignacion, comentario, visible_para_psicologo } = req.body;
      const archivo_url = `/uploads/evidencias/${req.file.filename}`;

      await pool.query(
        `INSERT INTO evidencia (id_asignacion, archivo_url, comentario, visible_para_psicologo)
         VALUES (?, ?, ?, ?)`,
        [id_asignacion, archivo_url, comentario || null, visible_para_psicologo ?? 1]
      );

      res.json({ success: true, message: "Evidencia subida correctamente", archivo_url });
    } catch (error) {
      console.error("❌ Error al subir evidencia:", error);
      res.status(500).json({ success: false, error: "Error al subir evidencia" });
    }
  },

  // 🔹 Obtener evidencias de una asignación
  async getEvidencias(req, res) {
    try {
      const { id_asignacion } = req.params;
      const [rows] = await pool.query(
        `SELECT id_evidencia, archivo_url, comentario, fecha_subida
         FROM evidencia WHERE id_asignacion = ?`,
        [id_asignacion]
      );
      res.json({ success: true, evidencias: rows });
    } catch (error) {
      console.error("❌ Error al obtener evidencias:", error);
      res.status(500).json({ success: false, error: "Error al obtener evidencias" });
    }
  },
};
