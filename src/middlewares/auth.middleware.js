import { verifyToken } from "@/lib/jwt";

export async function protect(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Not authorized.");
    error.status = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const err = new Error("Token expired. Please login again.");
      err.status = 401;
      throw err;
    }

    const err = new Error("Invalid token.");
    err.status = 401;
    throw err;
  }
}
