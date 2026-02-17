import { verifyToken } from "@/lib/jwt";

export async function protect(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Not authorized.");
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyToken(token);

  return decoded; // contains id & role
}
