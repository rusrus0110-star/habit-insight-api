import { asyncHandler } from "../utils/async_handler.js";
import { sendSuccess } from "../utils/api_response.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";
import {
  getDashboardStats,
  getLongestStreak,
  getBestDay,
  getBestMonth,
  getAbandonedHabits,
  getMoodCorrelation,
  getPerfectDay,
  getGoldenMean,
  getBurnoutHabits,
} from "../services/stats_service.js";

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const dashboardStats = await getDashboardStats({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Dashboard statistics fetched successfully",
    data: dashboardStats,
  });
});

export const getLongestStreakController = asyncHandler(async (req, res) => {
  const longestStreak = await getLongestStreak({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Habit with the longest current streak fetched successfully",
    data: longestStreak,
  });
});

export const getBestDayController = asyncHandler(async (req, res) => {
  const bestDay = await getBestDay({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Best weekday fetched successfully",
    data: bestDay,
  });
});

export const getBestMonthController = asyncHandler(async (req, res) => {
  const bestMonth = await getBestMonth({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Best month fetched successfully",
    data: bestMonth,
  });
});

export const getAbandonedHabitsController = asyncHandler(async (req, res) => {
  const abandonedHabits = await getAbandonedHabits({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Abandoned habits fetched successfully",
    data: abandonedHabits,
    meta: {
      count: abandonedHabits.length,
    },
  });
});

export const getMoodCorrelationController = asyncHandler(async (req, res) => {
  const moodCorrelation = await getMoodCorrelation({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Mood correlation fetched successfully",
    data: moodCorrelation,
    meta: {
      count: moodCorrelation.length,
    },
  });
});

export const getPerfectDayController = asyncHandler(async (req, res) => {
  const perfectDay = await getPerfectDay({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Perfect day fetched successfully",
    data: perfectDay,
  });
});

export const getGoldenMeanController = asyncHandler(async (req, res) => {
  const goldenMean = await getGoldenMean({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Golden mean habit fetched successfully",
    data: goldenMean,
  });
});

export const getBurnoutHabitsController = asyncHandler(async (req, res) => {
  const burnoutHabits = await getBurnoutHabits({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Burnout risk habits fetched successfully",
    data: burnoutHabits,
    meta: {
      count: burnoutHabits.length,
    },
  });
});
