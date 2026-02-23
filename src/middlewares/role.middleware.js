import { logger } from "@/lib/logger";

export function authorize(roles = []) {
  return async (req) => {
    const user = req.user;

    if (!user) {
      const error = new Error("Not authorized.");
      error.status = 401;
      throw error;
    }

    if (roles.length && !roles.includes(user.role)) {
      await logger.security.warn("Forbidden access attempt.", {
        userId: user.id,
        userRole: user.role,
        requiredRoles: roles,
        url: req.url,
      });
      const error = new Error("Forbidden: Insufficient permissions.");
      error.status = 403;
      throw error;
    }

    return user;
  };
}
