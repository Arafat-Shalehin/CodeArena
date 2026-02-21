const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    this.password = "hashed_" + this.password;
    next();
});

const User = mongoose.model("UserTesting", userSchema);

async function run() {
    try {
        // using local mongodb uri directly for test
        await mongoose.connect("mongodb+srv://CodeArenaAdmin:FJTp92jdb3ZBqVg0@crud-server.b5xdndi.mongodb.net/CodeArena?appName=Crud-Server");
        console.log("Connected to MongoDB.");

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
        await User.deleteOne({ email });
        console.log("Cleaned up.");

    } catch (err) {
        console.error("MongoDB Error Details:");
        console.log(err.message);
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
