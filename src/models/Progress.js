import mongoose from "mongoose";
import {
  MOOD_MIN_VALUE,
  MOOD_MAX_VALUE,
} from "../constants/habit_constants.js";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is required"],
      index: true,
    },

    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: [true, "Habit id is required"],
      index: true,
    },

    date: {
      type: Date,
      required: [true, "Progress date is required"],
      index: true,
    },

    completed: {
      type: Boolean,
      default: true,
    },

    mood: {
      type: Number,
      required: [true, "Mood is required"],
      min: [MOOD_MIN_VALUE, "Mood must be at least 1"],
      max: [MOOD_MAX_VALUE, "Mood must not exceed 5"],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes must not exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

progressSchema.index(
  {
    userId: 1,
    habitId: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

progressSchema.index({ userId: 1, completed: 1 });
progressSchema.index({ userId: 1, mood: 1 });
progressSchema.index({ userId: 1, date: -1 });
progressSchema.index({ habitId: 1, date: -1 });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
