import { Router } from "express";

import { protect } from "../middlewares/auth_middleware.js";
import { validateObjectId } from "../middlewares/validate_object_id_middleware.js";

import {
  createHabitController,
  getHabitsController,
  getHabitByIdController,
  updateHabitController,
  deleteHabitController,
  completeHabitController,
} from "../controllers/habit_controller.js";

const router = Router();

router.use(protect);

router.route("/").post(createHabitController).get(getHabitsController);

router.post("/:id/complete", validateObjectId("id"), completeHabitController);

router
  .route("/:id")
  .get(validateObjectId("id"), getHabitByIdController)
  .put(validateObjectId("id"), updateHabitController)
  .delete(validateObjectId("id"), deleteHabitController);

export default router;
