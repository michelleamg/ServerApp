import express from "express";
import { getActividadesPorModulo } from "../controllers/actividadesController.js";

const router = express.Router();

// 📤 Obtener actividades de un módulo (Negación, Ira, etc.)
router.get("/:id_modulo/actividades", getActividadesPorModulo);

export default router;
