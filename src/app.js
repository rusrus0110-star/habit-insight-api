import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import router from "./routes/index.js";
import { notFoundMiddleware } from "./middlewares/not-found_middleware.js";
import { errorMiddleware } from "./middlewares/error_middleware.js";

const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/auth", authLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Habit Insight API is running",
  });
});

app.use(router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
