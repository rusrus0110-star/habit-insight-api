import Habit from "../models/Habit.js";
import Progress from "../models/Progress.js";
import { ApiError } from "../utils/api_error.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";
import {
  HABIT_CATEGORIES,
  HABIT_DIFFICULTIES,
} from "../constants/habit_constants.js";

const validateHabitPayload = ({ name, category, difficulty }) => {
  if (!name || !category || !difficulty) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Name, category and difficulty are required",
    );
  }

  if (typeof name !== "string" || name.trim().length < 2) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Habit name must be at least 2 characters long",
    );
  }

  if (!HABIT_CATEGORIES.includes(category)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Category must be one of: ${HABIT_CATEGORIES.join(", ")}`,
    );
  }

  if (!HABIT_DIFFICULTIES.includes(difficulty)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Difficulty must be one of: ${HABIT_DIFFICULTIES.join(", ")}`,
    );
  }
};

export const createHabit = async ({ userId, name, category, difficulty }) => {
  validateHabitPayload({
    name,
    category,
    difficulty,
  });

  const existingHabit = await Habit.findOne({
    userId,
    name: name.trim(),
  });

  if (existingHabit) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Habit with this name already exists",
    );
  }

  const habit = await Habit.create({
    userId,
    name: name.trim(),
    category,
    difficulty,
  });

  return habit;
};

export const getHabits = async ({ userId, category, difficulty }) => {
  const filter = {
    userId,
  };

  if (category) {
    if (!HABIT_CATEGORIES.includes(category)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Category must be one of: ${HABIT_CATEGORIES.join(", ")}`,
      );
    }

    filter.category = category;
  }

  if (difficulty) {
    if (!HABIT_DIFFICULTIES.includes(difficulty)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Difficulty must be one of: ${HABIT_DIFFICULTIES.join(", ")}`,
      );
    }

    filter.difficulty = difficulty;
  }

  const habits = await Habit.find(filter).sort({
    createdAt: -1,
  });

  return habits;
};

export const getHabitById = async ({ userId, habitId }) => {
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Habit not found");
  }

  return habit;
};

export const updateHabit = async ({
  userId,
  habitId,
  name,
  category,
  difficulty,
}) => {
  validateHabitPayload({
    name,
    category,
    difficulty,
  });

  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Habit not found");
  }

  const duplicateHabit = await Habit.findOne({
    userId,
    name: name.trim(),
    _id: {
      $ne: habitId,
    },
  });

  if (duplicateHabit) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Habit with this name already exists",
    );
  }

  habit.name = name.trim();
  habit.category = category;
  habit.difficulty = difficulty;

  await habit.save();

  return habit;
};

export const deleteHabit = async ({ userId, habitId }) => {
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Habit not found");
  }

  await Progress.deleteMany({
    userId,
    habitId,
  });

  await Habit.deleteOne({
    _id: habitId,
    userId,
  });

  return habit;
};
