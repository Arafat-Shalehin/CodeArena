import { logger } from "@/lib/logger";

export function asyncHandler(fn) {
  return async (req, context) => {
    try {
      return await fn(req, context);
    } catch (error) {
      const status = error.status || error.statusCode || 500;

      // Only log genuine server errors (5xx)
      if (status >= 500) {
        await logger.system.error("Unhandled API error", {
          message: error.message,
          url: req.url,
          method: req.method,
        });
      }

      return Response.json(
        { success: false, message: error.message || "Internal Server Error" },
        { status }
      );
    }
  };
}
