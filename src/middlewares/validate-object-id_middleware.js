import mongoose from "mongoose";
import { ApiError } from "../utils/api-error.js";
import { HTTP_STATUS } from "../constants/http-status.constants.js";

export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(
        new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid ${paramName}: ${id}`),
      );
    }

    next();
  };
};
