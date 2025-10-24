import { Router } from "express";
import { pong } from "../controllers/indexController.js";

const router = Router();

router.get("/ping", pong);


export default router;