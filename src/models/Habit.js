import mongoose from "mongoose";
import {
  HABIT_CATEGORIES,
  HABIT_DIFFICULTIES,
} from "../constants/habit.constants.js";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is required"],
      index: true,
    },

    name: {
      type: String,
      required: [true, "Habit name is required"],
      trim: true,
      minlength: [2, "Habit name must be at least 2 characters long"],
      maxlength: [100, "Habit name must not exceed 100 characters"],
    },

    category: {
      type: String,
      required: [true, "Habit category is required"],
      enum: {
        values: HABIT_CATEGORIES,
        message:
          "Category must be one of: health, education, productivity, mindfulness",
      },
    },

    difficulty: {
      type: String,
      required: [true, "Habit difficulty is required"],
      enum: {
        values: HABIT_DIFFICULTIES,
        message: "Difficulty must be one of: easy, medium, hard",
      },
    },

    streak: {
      type: Number,
      default: 0,
      min: [0, "Streak cannot be negative"],
    },

    bestStreak: {
      type: Number,
      default: 0,
      min: [0, "Best streak cannot be negative"],
    },

    totalCompletions: {
      type: Number,
      default: 0,
      min: [0, "Total completions cannot be negative"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

habitSchema.index({ userId: 1, name: 1 }, { unique: true });
habitSchema.index({ userId: 1, category: 1 });
habitSchema.index({ userId: 1, difficulty: 1 });
habitSchema.index({ userId: 1, streak: -1 });
habitSchema.index({ userId: 1, bestStreak: -1 });
habitSchema.index({ userId: 1, totalCompletions: -1 });

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;
