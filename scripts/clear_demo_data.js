import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const DEMO_EMAILS = [
  "demo@habitinsight.dev",
  "demo@habitinsight.de",
];

async function deleteDemoUserData() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  await mongoose.connect(MONGO_URI);

  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  const usersCollection = db.collection("users");
  const habitsCollection = db.collection("habits");
  const progressesCollection = db.collection("progresses");

  const demoUsers = await usersCollection
    .find({
      email: {
        $in: DEMO_EMAILS,
      },
    })
    .toArray();

  if (demoUsers.length === 0) {
    console.log("No demo users found.");
    await mongoose.disconnect();
    return;
  }

  const demoUserObjectIds = demoUsers.map((user) => user._id);
  const demoUserStringIds = demoUsers.map((user) => user._id.toString());

  console.log("--------------------------------");
  console.log("Demo users found:", demoUsers.length);
  console.table(
    demoUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    }))
  );

  const demoHabits = await habitsCollection
    .find({
      $or: [
        {
          userId: {
            $in: demoUserObjectIds,
          },
        },
        {
          userId: {
            $in: demoUserStringIds,
          },
        },
      ],
    })
    .toArray();

  const demoHabitObjectIds = demoHabits.map((habit) => habit._id);
  const demoHabitStringIds = demoHabits.map((habit) => habit._id.toString());

  console.log("Demo habits found:", demoHabits.length);

  const progressesDeleteResult = await progressesCollection.deleteMany({
    $or: [
      {
        userId: {
          $in: demoUserObjectIds,
        },
      },
      {
        userId: {
          $in: demoUserStringIds,
        },
      },
      {
        habitId: {
          $in: demoHabitObjectIds,
        },
      },
      {
        habitId: {
          $in: demoHabitStringIds,
        },
      },
    ],
  });

  const habitsDeleteResult = await habitsCollection.deleteMany({
    $or: [
      {
        userId: {
          $in: demoUserObjectIds,
        },
      },
      {
        userId: {
          $in: demoUserStringIds,
        },
      },
    ],
  });

  const usersDeleteResult = await usersCollection.deleteMany({
    _id: {
      $in: demoUserObjectIds,
    },
  });

  console.log("--------------------------------");
  console.log("Deleted progresses:", progressesDeleteResult.deletedCount);
  console.log("Deleted habits:", habitsDeleteResult.deletedCount);
  console.log("Deleted users:", usersDeleteResult.deletedCount);
  console.log("--------------------------------");

  await mongoose.disconnect();

  console.log("Demo data deleted successfully");
}

deleteDemoUserData().catch(async (error) => {
  console.error("Delete demo data failed:");
  console.error(error);

  await mongoose.disconnect();
  process.exit(1);
});