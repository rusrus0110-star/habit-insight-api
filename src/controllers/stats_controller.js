import { asyncHandler } from "../utils/async_handler.js";
import { sendSuccess } from "../utils/api_response.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";
import { getDashboardStats } from "../services/stats_service.js";

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const dashboardStats = await getDashboardStats({
    userId: req.user._id,
  });

  return sendSuccess({
    res,
    statusCode: HTTP_STATUS.OK,
    message: "Dashboard statistics fetched successfully",
    data: dashboardStats,
  });
});
