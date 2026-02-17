import dbConnect from "@/lib/mongodb";
import { fetchUserById, removeUser } from "@/controllers/user.controller";

export async function GET(req, context) {
  await dbConnect();
  return fetchUserById(req, context);
}

export async function DELETE(req, context) {
  await dbConnect();
  return removeUser(req, context);
}
