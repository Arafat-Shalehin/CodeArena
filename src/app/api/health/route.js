import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

/**
 * This function will help us to know if 
 * our backend is connecting to DB properly or not.
 * To verify this go to browser address bar and write
 * http://localhost:3000/api/health. You should see: 
 * {"dbState":1,"dbName":"CodeArena"} (0 = disconnected, 2 = connecting, 3 = disconnecting).
 */

export async function GET() {
  await dbConnect();

  return Response.json({
    dbState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
  });
}
