import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const DEMO_USER = {
  name: "Demo User",
  email: "demo@habitinsight.dev",
  password: "Demo123456",
  role: "user",
};

const COLLECTIONS = {
  users: "users",
  habits: "habits",
  progresses: "progresses",
};

const CATEGORIES = {
  HEALTH: "health",
  EDUCATION: "education",
  PRODUCTIVITY: "productivity",
  MINDFULNESS: "mindfulness",
};

const DIFFICULTIES = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

function getDateDaysAgo(daysAgo) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function range(from, to) {
  const result = [];

  for (let index = from; index <= to; index += 1) {
    result.push(index);
  }

  return result;
}

function uniqueNumbers(numbers) {
  return [...new Set(numbers)].sort((a, b) => a - b);
}

function calculateCurrentStreak(daysAgoList) {
  const daysSet = new Set(daysAgoList);
  let streak = 0;

  for (let day = 0; day <= 365; day += 1) {
    if (!daysSet.has(day)) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function calculateBestStreak(daysAgoList) {
  const days = uniqueNumbers(daysAgoList);

  if (days.length === 0) {
    return 0;
  }

  let best = 1;
  let current = 1;

  for (let index = 1; index < days.length; index += 1) {
    if (days[index] === days[index - 1] + 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function createHabitDraft({
  userId,
  title,
  description,
  category,
  difficulty,
  targetDays,
  createdDaysAgo,
  completionDaysAgo,
  defaultMood = 4,
  burnoutCandidate = false,
  abandonedCandidate = false,
}) {
  const cleanCompletionDaysAgo = uniqueNumbers(completionDaysAgo);

  const currentStreak = calculateCurrentStreak(cleanCompletionDaysAgo);
  const bestStreak = calculateBestStreak(cleanCompletionDaysAgo);
  const totalCompletions = cleanCompletionDaysAgo.length;

  const lastCompletedDaysAgo =
    cleanCompletionDaysAgo.length > 0 ? cleanCompletionDaysAgo[0] : null;

  const lastCompletedAt =
    lastCompletedDaysAgo === null ? null : getDateDaysAgo(lastCompletedDaysAgo);

  return {
    habit: {
      userId,
      user: userId,

      title,
      name: title,

      description,

      category,
      type: category,

      difficulty,

      targetDays,
      targetFrequency: targetDays.length,

      isActive: true,
      archived: false,

      currentStreak,
      bestStreak,
      streak: currentStreak,
      bestStreakDays: bestStreak,

      completed: totalCompletions,
      completedCount: totalCompletions,
      completionCount: totalCompletions,
      totalCompletions,

      averageMood: defaultMood,
      moodAverage: defaultMood,

      lastCompletedAt,
      lastActivityAt: lastCompletedAt,

      burnoutCandidate,
      abandonedCandidate,

      createdAt: getDateDaysAgo(createdDaysAgo),
      updatedAt: new Date(),
    },

    completionDaysAgo: cleanCompletionDaysAgo,
    defaultMood,
    burnoutCandidate,
  };
}

function createProgressDocument({
  userId,
  habitId,
  habitTitle,
  daysAgo,
  mood,
  note = "",
}) {
  const date = getDateDaysAgo(daysAgo);
  const dateKey = getDateKey(date);

  return {
    userId,
    user: userId,

    habitId,
    habit: habitId,

    habitTitle,

    date,
    completedAt: date,
    progressDate: date,

    dateKey,

    completed: true,
    isCompleted: true,
    status: "completed",

    mood,
    moodScore: mood,

    note,

    createdAt: date,
    updatedAt: date,
  };
}

async function seedDemoUserData() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  await mongoose.connect(MONGO_URI);

  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  const usersCollection = db.collection(COLLECTIONS.users);
  const habitsCollection = db.collection(COLLECTIONS.habits);
  const progressesCollection = db.collection(COLLECTIONS.progresses);

  const existingDemoUser = await usersCollection.findOne({
    email: DEMO_USER.email,
  });

  if (existingDemoUser) {
    console.log("--------------------------------");
    console.log("Demo user already exists.");
    console.log("Run delete_demo_user_data.js first.");
    console.log("--------------------------------");

    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);

  const userInsertResult = await usersCollection.insertOne({
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    password: hashedPassword,
    role: DEMO_USER.role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const demoUserId = userInsertResult.insertedId;

  const habitDrafts = [
    createHabitDraft({
      userId: demoUserId,
      title: "Drink two liters of water",
      description: "Daily hydration tracking with stable consistency.",
      category: CATEGORIES.HEALTH,
      difficulty: DIFFICULTIES.EASY,
      targetDays: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      createdDaysAgo: 80,
      completionDaysAgo: [
        ...range(0, 30),
        ...range(35, 60),
      ],
      defaultMood: 4,
    }),

    createHabitDraft({
      userId: demoUserId,
      title: "Morning workout",
      description: "Short morning training session to keep energy stable.",
      category: CATEGORIES.HEALTH,
      difficulty: DIFFICULTIES.MEDIUM,
      targetDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      createdDaysAgo: 70,
      completionDaysAgo: [
        ...range(0, 14),
        ...range(22, 35),
        ...range(40, 55),
      ],
      defaultMood: 4,
    }),

    createHabitDraft({
      userId: demoUserId,
      title: "Read technical documentation",
      description: "Read backend, database or API documentation for 25 minutes.",
      category: CATEGORIES.EDUCATION,
      difficulty: DIFFICULTIES.MEDIUM,
      targetDays: ["monday", "wednesday", "friday"],
      createdDaysAgo: 55,
      completionDaysAgo: [
        ...range(0, 6),
        ...range(10, 17),
        ...range(25, 32),
      ],
      defaultMood: 4,
    }),

    createHabitDraft({
      userId: demoUserId,
      title: "Evening reflection",
      description: "Write a short reflection and plan the next day.",
      category: CATEGORIES.MINDFULNESS,
      difficulty: DIFFICULTIES.EASY,
      targetDays: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "sunday",
      ],
      createdDaysAgo: 65,
      completionDaysAgo: [
        ...range(0, 21),
        ...range(28, 43),
      ],
      defaultMood: 5,
    }),

    createHabitDraft({
      userId: demoUserId,
      title: "Deep work coding session",
      description: "Focused coding block without distractions.",
      category: CATEGORIES.PRODUCTIVITY,
      difficulty: DIFFICULTIES.HARD,
      targetDays: ["monday", "tuesday", "wednesday", "thursday"],
      createdDaysAgo: 45,
      completionDaysAgo: [
        ...range(0, 13),
        ...range(15, 25),
        ...range(28, 36),
      ],
      defaultMood: 3,
      burnoutCandidate: true,
    }),

    createHabitDraft({
      userId: demoUserId,
      title: "Practice German interview answers",
      description: "Practice structured German answers for technical interviews.",
      category: CATEGORIES.EDUCATION,
      difficulty: DIFFICULTIES.HARD,
      targetDays: ["monday", "tuesday", "thursday", "saturday"],
      createdDaysAgo: 55,
      completionDaysAgo: [
        ...range(0, 9),
        ...range(14, 24),
        ...range(30, 42),
      ],
      defaultMood: 4,
    }),

    createHabitDraft({
      userId: demoUserId,
      title: "Weekly planning",
      description: "Plan priorities for learning, portfolio and job search.",
      category: CATEGORIES.PRODUCTIVITY,
      difficulty: DIFFICULTIES.EASY,
      targetDays: ["sunday"],
      createdDaysAgo: 35,
      completionDaysAgo: [
        0,
        7,
        14,
        21,
        28,
      ],
      defaultMood: 4,
    }),

    createHabitDraft({
      userId: demoUserId,
      title: "Update portfolio project",
      description: "Improve portfolio code, README or project presentation.",
      category: CATEGORIES.PRODUCTIVITY,
      difficulty: DIFFICULTIES.MEDIUM,
      targetDays: ["wednesday", "saturday"],
      createdDaysAgo: 40,
      completionDaysAgo: [
        18,
        24,
        31,
        38,
      ],
      defaultMood: 3,
      abandonedCandidate: true,
    }),

    createHabitDraft({
      userId: demoUserId,
      title: "Stretching after long coding",
      description: "Short mobility routine after long sitting sessions.",
      category: CATEGORIES.HEALTH,
      difficulty: DIFFICULTIES.EASY,
      targetDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      createdDaysAgo: 30,
      completionDaysAgo: [
        16,
        19,
        23,
        27,
      ],
      defaultMood: 3,
      abandonedCandidate: true,
    }),
  ];

  const habitsToInsert = habitDrafts.map((draft) => draft.habit);
  const habitInsertResult = await habitsCollection.insertMany(habitsToInsert);
  const insertedHabitIds = Object.values(habitInsertResult.insertedIds);

  const progressDocuments = [];

  habitDrafts.forEach((draft, index) => {
    const habitId = insertedHabitIds[index];
    const habitTitle = draft.habit.title;

    draft.completionDaysAgo.forEach((daysAgo) => {
      let mood = draft.defaultMood;
      let note = "";

      if (draft.burnoutCandidate && daysAgo <= 7) {
        mood = 2;
        note = "Completed, but energy was low after intensive work.";
      }

      if (habitTitle === "Evening reflection") {
        mood = 5;
      }

      if (habitTitle === "Drink two liters of water") {
        mood = 4;
      }

      progressDocuments.push(
        createProgressDocument({
          userId: demoUserId,
          habitId,
          habitTitle,
          daysAgo,
          mood,
          note,
        })
      );
    });
  });

  await progressesCollection.insertMany(progressDocuments);

  console.log("--------------------------------");
  console.log("Demo data created successfully");
  console.log("--------------------------------");
  console.log(`Email: ${DEMO_USER.email}`);
  console.log(`Password: ${DEMO_USER.password}`);
  console.log(`Created habits: ${habitsToInsert.length}`);
  console.log(`Created progresses: ${progressDocuments.length}`);
  console.log("--------------------------------");

  await mongoose.disconnect();
}

seedDemoUserData().catch(async (error) => {
  console.error("Seed failed:");
  console.error(error);

  await mongoose.disconnect();
  process.exit(1);
});