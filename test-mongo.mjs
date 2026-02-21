import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We need to define the schema exactly as it is in the project
const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true, unique: true },
        password: {
            type: String,
            required: [
                function () {
                    return !this.authProvider || this.authProvider === "local";
                },
                "Password is required.",
            ],
            minlength: [6, "Password should be contain more than 6 character."],
        },
        authProvider: {
            type: String,
            enum: ["local", "google", "github", "firebase"],
            default: "local",
        },
        role: { type: String, default: "user" },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    // mock bcrypt
    this.password = "hashed_" + this.password;
    next();
});

const User = mongoose.model("User2", userSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        // Simulate what the sync route is doing
        const email = "test.google." + Date.now() + "@example.com";
        const name = "testuser" + Date.now();

        console.log("Trying to create user:", { email, name, authProvider: "google" });

        const user = await User.create({
            email,
            name,
            authProvider: "google",
            role: "user"
        });

        console.log("Success! Created:", user);

        // Cleanup
        await User.deleteOne({ email });
        console.log("Cleaned up.");

    } catch (err) {
        console.error("MongoDB Error Details:");
        console.error(err);
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error("->", key, err.errors[key].message);
            });
        }
    } finally {
        mongoose.disconnect();
    }
}

run();
