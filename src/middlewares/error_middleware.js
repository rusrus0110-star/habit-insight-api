import { HTTP_STATUS } from "../constants/http_status_constants.js";

export const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const response = {
    success: false,
    message: error.message || "Internal server error",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};
