// routes/actividadPaciente.routes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  registrarActividadUniversal,
  getActividadesPaciente
} from "../controllers/actividadUniversalController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/evidencias",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post("/", upload.single("archivo"), registrarActividadUniversal);
router.get("/:id_paciente", getActividadesPaciente);

export default router;
