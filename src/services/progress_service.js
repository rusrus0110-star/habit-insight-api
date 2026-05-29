import Habit from "../models/Habit.js";
import Progress from "../models/Progress.js";
import { ApiError } from "../utils/api_error.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";
import { startOfDay, subtractDays } from "../utils/date.js";

const validateDaysQuery = (days) => {
  if (days === undefined) {
    return null;
  }

  const parsedDays = Number(days);

  if (!Number.isInteger(parsedDays)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Days must be an integer");
  }

  if (parsedDays < 1 || parsedDays > 365) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Days must be between 1 and 365",
    );
  }

  return parsedDays;
};

export const getHabitProgressHistory = async ({ userId, habitId, days }) => {
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Habit not found");
  }

  const parsedDays = validateDaysQuery(days);

  const filter = {
    userId,
    habitId,
    completed: true,
  };

  if (parsedDays) {
    const fromDate = subtractDays(startOfDay(new Date()), parsedDays - 1);

    filter.date = {
      $gte: fromDate,
    };
  }

  const progress = await Progress.find(filter)
    .sort({
      date: -1,
    })
    .select("-userId -habitId");

  return {
    habit,
    progress,
  };
};
