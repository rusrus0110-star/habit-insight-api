import { Router } from "express";

import {
  register,
  login,
  getCurrentUser,
} from "../controllers/auth_controller.js";

import { protect } from "../middlewares/auth_middleware.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/", protect, getCurrentUser);

export default router;
