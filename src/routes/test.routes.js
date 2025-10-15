import express from "express";
import { testController} from "../controllers/testController.js";
const router = express.Router();

// @desc    Obtener preguntas del test
// @route   GET /api/tests/questions
// @access  Public
router.get("/questions", testController.getQuestions);

// @desc    Guardar resultados del test
// @route   POST /api/tests/results
// @access  Public
router.post("/results", testController.saveResults);

// @desc    Obtener historial de tests
// @route   GET /api/tests/history/:id_paciente
// @access  Public
router.get("/history/:id_paciente", testController.getHistory);

export default router;