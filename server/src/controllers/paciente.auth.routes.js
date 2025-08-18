import { Router } from 'express';
import { body } from 'express-validator';
import { pacienteLogin, pacienteRegister, mePaciente, authMiddleware } from './paciente.auth.controller.js';

export const router = Router();

// Registro de paciente
router.post(
  '/register',
  [
    body('nombre').trim().notEmpty().withMessage('nombre requerido'),
    body('apellido_paterno').trim().notEmpty().withMessage('apellido_paterno requerido'),
    body('apellido_materno').trim().notEmpty().withMessage('apellido_materno requerido'),
    body('fecha_nacimiento').isISO8601().withMessage('fecha_nacimiento inválida'),
    body('sexo').isIn(['Masculino','Femenino','Otro']).withMessage('sexo inválido'),
    body('ciudad').trim().notEmpty().withMessage('ciudad requerida'),
    body('correo').isEmail().withMessage('correo inválido'),
    body('password').isLength({ min: 8 }).withMessage('password min 8'),
    body('id_psicologo').optional({ nullable: true }).isInt().withMessage('id_psicologo inválido'),
  ],
  pacienteRegister
);

// Login
router.post(
  '/login',
  [
    body('correo').isEmail().withMessage('correo inválido'),
    body('password').notEmpty().withMessage('password requerido'),
  ],
  pacienteLogin
);

// Perfil
router.get('/me', authMiddleware, mePaciente);
