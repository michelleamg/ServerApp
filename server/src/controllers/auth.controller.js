import { Router } from 'express';
import { router as pacienteAuthRouter } from './paciente.auth.routes.js';

export const router = Router();
router.use('/auth/paciente', pacienteAuthRouter);
