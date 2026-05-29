import { asyncHandler } from "../utils/async_handler.js";
import { sendSuccess } from "../utils/api_response.js";
import { HTTP_STATUS } from "../constants/http_status_constants.js";
import { getHabitProgressHistory } from "../services/progress_service.js";

export const getHabitProgressHistoryController = asyncHandler(
  async (req, res) => {
    const result = await getHabitProgressHistory({
      userId: req.user._id,
      habitId: req.params.habitId,
      days: req.query.days,
    });

    return sendSuccess({
      res,
      statusCode: HTTP_STATUS.OK,
      message: "Habit progress history fetched successfully",
      data: result,
      meta: {
        count: result.progress.length,
      },
    });
  },
);
