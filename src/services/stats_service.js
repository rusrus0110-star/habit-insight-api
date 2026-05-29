import Habit from "../models/Habit.js";
import Progress from "../models/Progress.js";

export const getDashboardStats = async ({ userId }) => {
  const totalHabitsPromise = Habit.countDocuments({
    userId,
  });

  const totalCompletionsPromise = Progress.countDocuments({
    userId,
    completed: true,
  });

  const bestStreakHabitPromise = Habit.findOne({
    userId,
  })
    .sort({
      bestStreak: -1,
      totalCompletions: -1,
      createdAt: 1,
    })
    .select("name category difficulty bestStreak streak totalCompletions");

  const moodStatsPromise = Progress.aggregate([
    {
      $match: {
        userId,
        completed: true,
      },
    },
    {
      $group: {
        _id: null,
        averageMood: {
          $avg: "$mood",
        },
      },
    },
    {
      $project: {
        _id: 0,
        averageMood: {
          $round: ["$averageMood", 2],
        },
      },
    },
  ]);

  const [totalHabits, totalCompletions, bestStreakHabit, moodStats] =
    await Promise.all([
      totalHabitsPromise,
      totalCompletionsPromise,
      bestStreakHabitPromise,
      moodStatsPromise,
    ]);

  return {
    totalHabits,
    totalCompletions,
    bestStreakHabit,
    averageMood: moodStats[0]?.averageMood || 0,
  };
};
