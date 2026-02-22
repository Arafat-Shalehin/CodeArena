import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User.models";

export async function POST(request) {
    try {
        const body = await request.json();
        const { uid, email, displayName, photoURL } = body;

        if (!uid || !email) {
            return NextResponse.json(
                { success: false, error: "Missing required fields (uid, email)" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // Extract a base username from email or displayName if not provided
            let baseUsername = displayName
                ? displayName.toLowerCase().replace(/[^a-z0-9]/g, "")
                : email.split("@")[0].replace(/[^a-z0-9]/g, "");

            // Ensure username is unique to avoid MongoDB E11000 errors
            let existingName = await User.findOne({ name: baseUsername });
            while (existingName) {
                baseUsername = baseUsername + Math.floor(Math.random() * 1000);
                existingName = await User.findOne({ name: baseUsername });
            }

            try {
                // Create new user in MongoDB
                user = await User.create({
                    email,
                    name: baseUsername,
                    authProvider: body.authProvider || "firebase",
                    role: "user",
                    // we can store uid if we modify schema, but for now email is the unique link
                });
            } catch (createErr) {
                // If another concurrent request just created the user, we'll get a duplicate key error (11000)
                if (createErr.code === 11000 && createErr.keyPattern && createErr.keyPattern.email) {
                    user = await User.findOne({ email });
                } else {
                    console.error("MongoDB creation error:", createErr);
                    throw createErr;
                }
            }
        }

        // We can return the mongodb user object to the client
        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Error in /api/auth/sync:", error);
        return NextResponse.json(
            { success: false, error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
