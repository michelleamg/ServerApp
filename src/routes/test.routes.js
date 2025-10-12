// src/routes/test.routes.js
import { Router } from 'express';
import { listQuestions, startTest, submitTest } from '../controllers/test.controller.js';

const router = Router();

router.get('/questions', listQuestions);
router.post('/start', startTest);
router.post('/:id_aplicacion/submit', submitTest);

export default router;