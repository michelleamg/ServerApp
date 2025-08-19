
import { Router } from "express";
import {
  updateUsername,
  updatePassword,
  updateEmail,
} from "../controllers/user.controller.js";

const router = Router();

router.put("/username", updateUsername);
router.put("/password", updatePassword);
router.put("/email", updateEmail);

export default router;