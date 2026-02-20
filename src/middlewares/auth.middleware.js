import { verifyToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";

export async function protect(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    await logger.auth.warn("Missing or malformed Authorization header.", {
      url: req.url,
    });
    const error = new Error("Not authorized.");
    error.status = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    // Standardize user object shape
    return {
      id: decoded.id || decoded._id,
      role: decoded.role,
      ...decoded
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      await logger.auth.warn("Expired JWT token used.", { url: req.url });
      const err = new Error("Token expired. Please login again.");
      err.status = 401;
      throw err;
    }

    await logger.auth.error("Invalid JWT token.", { url: req.url });
    const err = new Error("Invalid token.");
    err.status = 401;
    throw err;
  }
}
