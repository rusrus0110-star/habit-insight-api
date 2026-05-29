import { Router } from "express";

import { protect } from "../middlewares/auth_middleware.js";
import { getDashboardStatsController } from "../controllers/stats_controller.js";

const router = Router();

router.use(protect);

router.get("/dashboard", getDashboardStatsController);

export default router;
