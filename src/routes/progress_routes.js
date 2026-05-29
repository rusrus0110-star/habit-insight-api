import { Router } from "express";

import { protect } from "../middlewares/auth_middleware.js";
import { validateObjectId } from "../middlewares/validate_object_id_middleware.js";
import { getHabitProgressHistoryController } from "../controllers/progress_controller.js";

const router = Router();

router.use(protect);

router.get(
  "/habits/:habitId",
  validateObjectId("habitId"),
  getHabitProgressHistoryController,
);

export default router;
