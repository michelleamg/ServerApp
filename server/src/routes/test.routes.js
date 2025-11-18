import express from "express";
import { testController } from "../controllers/testController.js";

const router = express.Router();

router.get("/questions", testController.getQuestions);

// Test inicial
router.post("/results", testController.saveResults);
router.get("/status/:id_paciente", testController.getCompletedTest);
router.get("/results/:id_paciente", testController.getLastResult);

// Test final
router.get("/questions/:id_test", testController.getQuestionsByTest);
router.get("/assigned/:id_paciente", testController.checkAssignedFinalTest);
router.post("/final", testController.saveFinalTest);

export default router;
