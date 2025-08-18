import { Router } from "express";
import { pong } from "../controllers/index.controller.js";

const router = Router();

router.get("/ping", pong);

export default router;