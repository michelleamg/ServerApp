import express from "express";
import { EvidenciaController, upload } from "../controllers/evidenciaController.js";

const router = express.Router();

router.post("/evidencias", upload.single("archivo"), EvidenciaController.uploadEvidencia);
router.get("/evidencias/:id_asignacion", EvidenciaController.getEvidencias);

export default router;
