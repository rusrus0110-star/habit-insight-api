import { Router } from "express";

import { protect } from "../middlewares/auth_middleware.js";
import {
  getDashboardStatsController,
  getLongestStreakController,
  getBestDayController,
  getBestMonthController,
  getAbandonedHabitsController,
  getMoodCorrelationController,
  getPerfectDayController,
  getGoldenMeanController,
  getBurnoutHabitsController,
} from "../controllers/stats_controller.js";

const router = Router();

router.use(protect);

router.get("/dashboard", getDashboardStatsController);
router.get("/longest-streak", getLongestStreakController);
router.get("/best-day", getBestDayController);
router.get("/best-month", getBestMonthController);
router.get("/abandoned", getAbandonedHabitsController);
router.get("/mood-correlation", getMoodCorrelationController);
router.get("/perfect-day", getPerfectDayController);
router.get("/golden-mean", getGoldenMeanController);
router.get("/burnout", getBurnoutHabitsController);

export default router;
