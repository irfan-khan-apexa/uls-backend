require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
// const winston = require("winston");
require("winston-mongodb");
const { logger, logMessage, LOG_LEVELS } = require("./utils/logger"); // Import the updated logger
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI



const axios = require("axios");
const path = require("path");

const LOGGING_SERVICE_URL = "http://localhost:5000/logs";



// Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Define Mongoose Schema
const ProjectSchema = new mongoose.Schema({
    name: String,
    projectID: { type: String, unique: true },
});
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const Project = mongoose.model("Project", ProjectSchema);
const User = mongoose.model("User", UserSchema);

// Configure Winston Logger
// const logger = winston.createLogger({
//     transports: [
//         new winston.transports.Console(),
//         new winston.transports.MongoDB({
//             db: MONGO_URI,
//             collection: "logs",
//             level: "info",
//         }),
//     ],
// });
// logger.error()

// Create a new project
// app.post("/projects", async (req, res) => {
//     const { name } = req.body;
//     const projectID = Math.random().toString(36).substr(2, 9);
//     const newProject = new Project({ name, projectID });

//     try {
//         await newProject.save();
//         res.json({ message: "Project created", projectID });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });
app.post("/projects", async (req, res) => {
    const { name } = req.body;
    const projectID = Math.random().toString(36).substr(2, 9);
    const newProject = new Project({ name, projectID });

    try {
        await newProject.save();
        res.json({ message: "Project created", projectID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get all projects
app.get("/projects", async (req, res) => {
    const projects = await Project.find();
    res.json(projects);
});





// Store logs
// app.post("/logs", async (req, res) => {
//     const { projectID, message, level } = req.body;

//     if (!projectID || !message) {
//         return res.status(400).json({ error: "Project ID and message are required" });
//     }

//     try {
//         const logEntry = {
//             level: Number(level) || 2, // Default to "info" (2) if level is missing
//             message,
//             timestamp: new Date(),
//             projectID, // Store projectID directly
//         };

//         const result = await mongoose.connection.db.collection("logs").insertOne(logEntry);

//         if (!result.acknowledged) {
//             throw new Error("Failed to insert log");
//         }

//         res.json({ message: "Log saved successfully", log: logEntry });
//     } catch (error) {
//         console.error("Error saving log:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });
// app.post("/logs", async (req, res) => {
//     try {
//         const { projectID, message, level } = req.body;

//         if (!projectID || !message) {
//             logger.warn(`Missing required fields | ProjectID: ${projectID} | Message: ${message}`);
//             return res.status(400).json({ error: "Project ID and message are required" });
//         }

//         const logEntry = {
//             projectID,
//             message,
//             level: Number(level),
//             timestamp: new Date(),
//         };

//         // Store in MongoDB directly
//         const result = await mongoose.connection.db.collection("logs").insertOne(logEntry);

//         if (!result.acknowledged) {
//             throw new Error("Failed to insert log");
//         }

//         res.status(201).json({ message: "Log saved successfully", log: logEntry });
//     } catch (error) {
//         logger.error(`Log creation failed | Error: ${error.message}`);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });




// Get logs by project ID
// app.get("/logs/:projectID", async (req, res) => {
//     const { projectID } = req.params;
//     const logs = await mongoose.connection.db
//         .collection("logs")
//         .find({ "metadata.projectID": projectID })
//         .toArray();
//     res.json(logs);
// });

app.get("/logs/:projectID", async (req, res) => {
    const { projectID } = req.params;

    try {
        const logs = await mongoose.connection.db
            .collection("logs")
            .find({ "metadata.projectID": projectID }) // Fix: Correct field name
            .toArray();

        if (!logs.length) {
            return res.json([]); // Return an empty array instead of an object
        }

        res.json(logs); // Directly return logs without modification
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json([]); // Return empty array on error
    }
});








// Register User (Only for testing, remove in production)
app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "All fields are required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });

    try {
        await newUser.save();
        res.json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});

// Login API
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) {
        logMessage(LOG_LEVELS.warn, "User not found", "server.js", "POST");
        return res.status(404).json({ error: "User not found" });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, email: user.email }, "SECRET_KEY", { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
});



// 
// logMessage(LOG_LEVELS.debug, "Manually testing debug", "server.js", "TEST");
// logMessage(LOG_LEVELS.error, "Manually testing error", "server.js", "TEST");
// logMessage(LOG_LEVELS.http, "Manually testing http", "server.js", "TEST");
// logMessage(LOG_LEVELS.info, "Manually testing info", "server.js", "TEST");
// logMessage(LOG_LEVELS.silly, "Manually testing silly", "server.js", "TEST");
// logMessage(LOG_LEVELS.warn, "Manually testing warn", "server.js", "TEST");



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
