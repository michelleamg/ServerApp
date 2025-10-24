// auth.routes.js
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/recover-password', AuthController.recoverPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/reset-password/:token', (req, res) => {
  res.send(`<h3>Tu token de recuperación es:</h3><p>${req.params.token}</p><p>Por favor, abre la app MiDuelo para continuar.</p>`);
});
router.post("/verify/send", AuthController.sendVerificationEmail);
router.get("/verify/:token", AuthController.verifyEmail);

export default router;
