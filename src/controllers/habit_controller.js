import { asyncHandler } from "../utils/async_handler.js";
import { sendSuccess } from "../utils/api_response.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  completeHabit,
} from "../services/habit_service.js";

export const createHabitController = asyncHandler(async (req, res) => {
  const habit = await createHabit({
    userId: req.user._id,
    name: req.body.name,
    category: req.body.category,
    difficulty: req.body.difficulty,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.CREATED,
    message: "Habit created successfully",
    data: {
      habit,
    },
  });
});

export const getHabitsController = asyncHandler(async (req, res) => {
  const habits = await getHabits({
    userId: req.user._id,
    category: req.query.category,
    difficulty: req.query.difficulty,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Habits fetched successfully",
    data: {
      habits,
    },
    meta: {
      count: habits.length,
    },
  });
});

export const getHabitByIdController = asyncHandler(async (req, res) => {
  const habit = await getHabitById({
    userId: req.user._id,
    habitId: req.params.id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Habit fetched successfully",
    data: {
      habit,
    },
  });
});

export const updateHabitController = asyncHandler(async (req, res) => {
  const habit = await updateHabit({
    userId: req.user._id,
    habitId: req.params.id,
    name: req.body.name,
    category: req.body.category,
    difficulty: req.body.difficulty,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Habit updated successfully",
    data: {
      habit,
    },
  });
});

export const deleteHabitController = asyncHandler(async (req, res) => {
  const habit = await deleteHabit({
    userId: req.user._id,
    habitId: req.params.id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Habit deleted successfully",
    data: {
      habit,
    },
  });
});

export const completeHabitController = asyncHandler(async (req, res) => {
  const result = await completeHabit({
    userId: req.user._id,
    habitId: req.params.id,
    mood: req.body.mood,
    notes: req.body.notes,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.CREATED,
    message: "Habit completed successfully",
    data: result,
  });
});
