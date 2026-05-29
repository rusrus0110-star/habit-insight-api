import { ApiError } from "../utils/api_error.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";

export const notFoundMiddleware = (req, res, next) => {
  next(
    new ApiError(
      HTTP_STATUS.NOT_FOUND,
      `Route not found: ${req.method} ${req.originalUrl}`,
    ),
  );
};
