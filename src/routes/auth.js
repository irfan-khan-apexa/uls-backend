// src/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";
import { logMessage, LOG_LEVELS } from "../utils/logger.js";

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {


    const { email, password } = req.body;

    if (!email || !password) {
        logMessage(LOG_LEVELS.warn, "Missing email or password", "auth.js", "POST /register");
        return res.status(400).json({ error: "email and password are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "email already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        logMessage(LOG_LEVELS.info, `User registered: ${email}`, "auth.js", "POST /register");
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        logMessage(LOG_LEVELS.error, `Registration failed: ${error.message}`, "auth.js", "POST /register");
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("🔍 Login Attempt:", email, password); // Debugging line

    if (!email || !password) {
        console.log("⚠️ Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        console.log("🛠 Found User:", user);

        if (!user) {
            console.log("❌ User not found!");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔑 Password Match:", isMatch);

        if (!isMatch) {
            console.log("❌ Incorrect Password!");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, config.projectID, { expiresIn: "1h" });
        console.log("✅ Token Generated:", token);

        res.status(200).json({ token });
    } catch (error) {
        console.error("❌ Login Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



export default router;
