import Habit from "../models/Habit.js";
import Progress from "../models/Progress.js";
import { ApiError } from "../utils/api_error.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";
import {
  HABIT_CATEGORIES,
  HABIT_DIFFICULTIES,
  MOOD_MIN_VALUE,
  MOOD_MAX_VALUE,
} from "../constants/habit_constants.js";
import { startOfDay } from "../utils/date.js";
import {
  getLastCompletionBeforeToday,
  shouldIncreaseStreak,
} from "./streak_service.js";

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

const validateCompletePayload = ({ mood, notes }) => {
  if (mood === undefined || mood === null) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Mood is required");
  }

  if (typeof mood !== "number") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Mood must be a number");
  }

  if (mood < MOOD_MIN_VALUE || mood > MOOD_MAX_VALUE) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Mood must be between ${MOOD_MIN_VALUE} and ${MOOD_MAX_VALUE}`,
    );
  }

  if (notes !== undefined && typeof notes !== "string") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Notes must be a string");
  }

  if (notes && notes.length > 500) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Notes must not exceed 500 characters",
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

export const completeHabit = async ({ userId, habitId, mood, notes = "" }) => {
  validateCompletePayload({
    mood,
    notes,
  });

  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Habit not found");
  }

  const today = startOfDay(new Date());

  const existingProgress = await Progress.findOne({
    userId,
    habitId,
    date: today,
  });

  if (existingProgress) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Habit has already been completed today",
    );
  }

  const lastCompletion = await getLastCompletionBeforeToday({
    userId,
    habitId,
  });

  const shouldContinueCurrentStreak = shouldIncreaseStreak(
    lastCompletion?.date,
  );

  const nextStreak = shouldContinueCurrentStreak ? habit.streak + 1 : 1;

  const nextBestStreak = Math.max(habit.bestStreak, nextStreak);

  const progress = await Progress.create({
    userId,
    habitId,
    date: today,
    completed: true,
    mood,
    notes: notes.trim(),
  });

  habit.streak = nextStreak;
  habit.bestStreak = nextBestStreak;
  habit.totalCompletions += 1;

  await habit.save();

  return {
    habit,
    progress,
  };
};
