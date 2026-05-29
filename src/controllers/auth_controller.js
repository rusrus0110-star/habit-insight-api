import { asyncHandler } from "../utils/async_handler.js";
import { sendSuccess } from "../utils/api_response.js";
import { ApiError } from "../utils/api_error.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";
import {
  registerUser,
  loginUser,
  getPublicUser,
} from "../services/auth_service.js";

const validateRegisterInput = ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Name, email and password are required",
    );
  }

  if (typeof name !== "string" || name.trim().length < 2) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Name must be at least 2 characters long",
    );
  }

  if (typeof email !== "string" || !email.includes("@")) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Please provide a valid email address",
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Password must be at least 8 characters long",
    );
  }
};

const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Email and password are required",
    );
  }

  if (typeof email !== "string" || !email.includes("@")) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Please provide a valid email address",
    );
  }

  if (typeof password !== "string") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Password must be a string");
  }
};

export const register = asyncHandler(async (req, res) => {
  validateRegisterInput(req.body);

  const { name, email, password } = req.body;

  const result = await registerUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  validateLoginInput(req.body);

  const { email, password } = req.body;

  const result = await loginUser({
    email: email.trim().toLowerCase(),
    password,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "User logged in successfully",
    data: result,
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = getPublicUser(req.user);

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Current user fetched successfully",
    data: {
      user,
    },
  });
});
