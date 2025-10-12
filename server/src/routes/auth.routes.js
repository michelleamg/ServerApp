// auth.routes.js
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/recover-password', AuthController.recoverPassword);

export default router;
