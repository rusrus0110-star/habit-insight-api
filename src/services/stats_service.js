import Habit from "../models/Habit.js";
import Progress from "../models/Progress.js";

const DAY_NAMES = {
  1: "Sunday",
  2: "Monday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Thursday",
  6: "Friday",
  7: "Saturday",
};

const MONTH_NAMES = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

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

export const getLongestStreak = async ({ userId }) => {
  const result = await Habit.aggregate([
    {
      $match: {
        userId,
      },
    },
    {
      $sort: {
        streak: -1,
        bestStreak: -1,
        totalCompletions: -1,
        createdAt: 1,
      },
    },
    {
      $limit: 1,
    },
    {
      $project: {
        _id: 1,
        name: 1,
        category: 1,
        difficulty: 1,
        streak: 1,
      },
    },
  ]);

  return result[0] || null;
};

export const getBestDay = async ({ userId }) => {
  const result = await Progress.aggregate([
    {
      $match: {
        userId,
        completed: true,
      },
    },
    {
      $group: {
        _id: {
          $dayOfWeek: "$date",
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
        _id: 1,
      },
    },
    {
      $limit: 1,
    },
    {
      $project: {
        _id: 0,
        dayNumber: "$_id",
        count: 1,
      },
    },
  ]);

  const bestDay = result[0];

  if (!bestDay) {
    return null;
  }

  return {
    dayNumber: bestDay.dayNumber,
    dayName: DAY_NAMES[bestDay.dayNumber],
    count: bestDay.count,
  };
};

export const getBestMonth = async ({ userId }) => {
  const result = await Progress.aggregate([
    {
      $match: {
        userId,
        completed: true,
      },
    },
    {
      $group: {
        _id: {
          year: {
            $year: "$date",
          },
          month: {
            $month: "$date",
          },
        },
        completions: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        completions: -1,
        "_id.year": -1,
        "_id.month": -1,
      },
    },
    {
      $limit: 1,
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        completions: 1,
      },
    },
  ]);

  const bestMonth = result[0];

  if (!bestMonth) {
    return null;
  }

  return {
    month: bestMonth.month,
    monthName: MONTH_NAMES[bestMonth.month],
    year: bestMonth.year,
    completions: bestMonth.completions,
  };
};

export const getAbandonedHabits = async ({ userId }) => {
  const result = await Habit.aggregate([
    {
      $match: {
        userId,
      },
    },
    {
      $lookup: {
        from: "progresses",
        let: {
          habitId: "$_id",
          currentUserId: "$userId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$habitId", "$$habitId"],
                  },
                  {
                    $eq: ["$userId", "$$currentUserId"],
                  },
                  {
                    $eq: ["$completed", true],
                  },
                ],
              },
            },
          },
          {
            $sort: {
              date: -1,
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: 0,
              date: 1,
            },
          },
        ],
        as: "lastProgress",
      },
    },
    {
      $addFields: {
        lastCompleted: {
          $arrayElemAt: ["$lastProgress.date", 0],
        },
      },
    },
    {
      $addFields: {
        referenceDate: {
          $ifNull: ["$lastCompleted", "$createdAt"],
        },
      },
    },
    {
      $addFields: {
        daysSince: {
          $dateDiff: {
            startDate: "$referenceDate",
            endDate: "$$NOW",
            unit: "day",
          },
        },
      },
    },
    {
      $match: {
        daysSince: {
          $gt: 7,
        },
      },
    },
    {
      $sort: {
        daysSince: -1,
        createdAt: 1,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        category: 1,
        difficulty: 1,
        lastCompleted: 1,
        daysSince: 1,
      },
    },
  ]);

  return result;
};

export const getMoodCorrelation = async ({ userId }) => {
  const result = await Progress.aggregate([
    {
      $match: {
        userId,
        completed: true,
      },
    },
    {
      $lookup: {
        from: "habits",
        localField: "habitId",
        foreignField: "_id",
        as: "habit",
      },
    },
    {
      $unwind: "$habit",
    },
    {
      $match: {
        "habit.userId": userId,
      },
    },
    {
      $group: {
        _id: "$habit.difficulty",
        averageMood: {
          $avg: "$mood",
        },
        totalCompletions: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        difficulty: "$_id",
        averageMood: {
          $round: ["$averageMood", 2],
        },
        totalCompletions: 1,
      },
    },
    {
      $sort: {
        difficulty: 1,
      },
    },
  ]);

  const difficultyOrder = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  return result.sort((a, b) => {
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });
};

export const getPerfectDay = async ({ userId }) => {
  const result = await Progress.aggregate([
    {
      $match: {
        userId,
        completed: true,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
          },
        },
        completions: {
          $sum: 1,
        },
        averageMood: {
          $avg: "$mood",
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        completions: 1,
        averageMood: {
          $round: ["$averageMood", 2],
        },
      },
    },
    {
      $match: {
        averageMood: {
          $gt: 4,
        },
      },
    },
    {
      $sort: {
        completions: -1,
        averageMood: -1,
        date: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);

  return result[0] || null;
};

export const getGoldenMean = async ({ userId }) => {
  const result = await Habit.aggregate([
    {
      $match: {
        userId,
      },
    },
    {
      $group: {
        _id: null,
        averageCompletions: {
          $avg: "$totalCompletions",
        },
        habits: {
          $push: {
            _id: "$_id",
            name: "$name",
            category: "$category",
            difficulty: "$difficulty",
            totalCompletions: "$totalCompletions",
          },
        },
      },
    },
    {
      $unwind: "$habits",
    },
    {
      $project: {
        _id: 0,
        habit: "$habits",
        averageCompletions: {
          $round: ["$averageCompletions", 2],
        },
        difference: {
          $abs: {
            $subtract: ["$habits.totalCompletions", "$averageCompletions"],
          },
        },
      },
    },
    {
      $project: {
        habit: 1,
        averageCompletions: 1,
        difference: {
          $round: ["$difference", 2],
        },
      },
    },
    {
      $sort: {
        difference: 1,
        "habit.totalCompletions": -1,
        "habit.name": 1,
      },
    },
    {
      $limit: 1,
    },
  ]);

  return result[0] || null;
};

export const getBurnoutHabits = async ({ userId }) => {
  const result = await Habit.aggregate([
    {
      $match: {
        userId,
      },
    },
    {
      $match: {
        $expr: {
          $gt: ["$streak", "$totalCompletions"],
        },
      },
    },
    {
      $addFields: {
        difference: {
          $subtract: ["$streak", "$totalCompletions"],
        },
      },
    },
    {
      $sort: {
        difference: -1,
        streak: -1,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        category: 1,
        difficulty: 1,
        streak: 1,
        totalCompletions: 1,
        difference: 1,
      },
    },
  ]);

  return result;
};
