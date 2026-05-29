import { Router } from "express";

import authRoutes from "./auth_routes.js";
import habitRoutes from "./habit_routes.js";
import progressRoutes from "./progress_routes.js";
import statsRoutes from "./stats_outes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/habits", habitRoutes);
router.use("/progress", progressRoutes);
router.use("/stats", statsRoutes);

export default router;
