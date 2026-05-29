import User from "../models/User.js";
import { ApiError } from "../utils/api_error.js";
import { verifyToken } from "../utils/jwt.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";

export const protect = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Authorization token is missing",
      );
    }

    const token = authorizationHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Authorization token is missing",
      );
    }

    const decoded = verifyToken(token);

    if (!decoded.userId) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid authorization token",
      );
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "User no longer exists");
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid authorization token"),
      );
    }

    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "Authorization token has expired",
        ),
      );
    }

    next(error);
  }
};
