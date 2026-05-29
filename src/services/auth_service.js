import User from "../models/User.js";
import { ApiError } from "../utils/api-error.js";
import { generateToken } from "../utils/jwt.js";
import { HTTP_STATUS } from "../constants/http-status_constants.js";

const sanitizeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "User with this email already exists",
    );
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken({
    userId: user._id,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password");
  }

  const token = generateToken({
    userId: user._id,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const getPublicUser = (user) => {
  return sanitizeUser(user);
};
