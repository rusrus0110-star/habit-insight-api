import Progress from "../models/Progress.js";
import { isYesterday, startOfDay, subtractDays } from "../utils/date.js";

export const calculateNextStreak = async ({ userId, habitId }) => {
  const today = startOfDay(new Date());
  const yesterday = subtractDays(today, 1);

  const yesterdayProgress = await Progress.findOne({
    userId,
    habitId,
    completed: true,
    date: yesterday,
  });

  if (yesterdayProgress) {
    return {
      shouldContinueStreak: true,
    };
  }

  return {
    shouldContinueStreak: false,
  };
};

export const getLastCompletionBeforeToday = async ({ userId, habitId }) => {
  const today = startOfDay(new Date());

  const lastProgress = await Progress.findOne({
    userId,
    habitId,
    completed: true,
    date: {
      $lt: today,
    },
  }).sort({
    date: -1,
  });

  return lastProgress;
};

export const shouldIncreaseStreak = (lastCompletionDate) => {
  if (!lastCompletionDate) {
    return false;
  }

  return isYesterday(lastCompletionDate, new Date());
};
