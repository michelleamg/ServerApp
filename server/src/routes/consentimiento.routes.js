// routes/consentimiento.routes.js
import express from 'express';
import { ConsentimientoController } from '../controllers/consentimientoController.js';

const router = express.Router();

// POST /api/consentimientos - Guardar consentimientos
router.post('/', ConsentimientoController.saveConsentimientos);

// GET /api/consentimientos/:id_paciente - Obtener consentimientos
router.get('/:id_paciente', ConsentimientoController.getConsentimientos);

export default router;