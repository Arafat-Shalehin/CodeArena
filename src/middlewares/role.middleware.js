import { protect } from "./auth.middleware";

export function authorize(roles = []) {
  return async (req) => {
    const user = await protect(req);

    if (roles.length && !roles.includes(user.role)) {
      const error = new Error("Forbidden: Insufficient permissions.");
      error.status = 403;
      throw error;
    }

    return user;
  };
}
