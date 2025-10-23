import express from "express";
import { testController} from "../controllers/testController.js";
const router = express.Router();

router.get("/questions", testController.getQuestions);

router.post("/results", testController.saveResults);

router.get("/history/:id_paciente", testController.getHistory);

router.get("/status/:id_paciente", testController.getCompletedTest); 

export default router;