import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

export async function POST(req) {
  // Connect to the DB
  await dbConnect();
  console.log("Connection readyState:", mongoose.connection.readyState); // 1 = connected
  
  return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
    status: 400,
  });
}
