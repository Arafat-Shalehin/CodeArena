import { verifyToken } from "@/lib/jwt";

export async function protect(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Not authorized.");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired. Please login again.');
    }
    throw new Error('Invalid token.');
  }

}
