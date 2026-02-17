export function asyncHandler(fn) {
  return async (req, context) => {
    try {
      return await fn(req, context);
    } catch (error) {
      return Response.json(
        {
          success: false,
          message: error.message || "Internal Server Error",
        },
        { status: 400 },
      );
    }
  };
}
